"""Jarvis-WebSocket-Endpunkt (ARCHITECTURE.md Paragraph 5): /ws/jarvis.

Auth beim Verbindungsaufbau ueber das Cookie `aos_session` (dieselbe Verify-Funktion
wie die REST-API). Ungueltig -> Close 4401.

Protokoll (JSON):
    Client -> Server: {"type":"user_text","text":"...","context":{"route":"...","screen_summary":"..."}}
                      {"type":"cancel"}
    Server -> Client: {"type":"assistant_delta","text":"..."}
                      {"type":"ui_action","action":"navigate"|"run_agent","params":{...}}
                      {"type":"done","full_text":"..."}
                      {"type":"error","detail":"..."}
"""

from __future__ import annotations

import asyncio
import contextlib
import logging
from typing import Any, Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from ..auth import COOKIE_NAME, verify_session_cookie
from ..config import get_settings
from . import brain

log = logging.getLogger("aos.jarvis.ws")

router = APIRouter()

WS_CLOSE_UNAUTHORIZED = 4401


def _compose_user_content(text: str, context: dict[str, Any]) -> str:
    """Haengt den Seiten-Kontext an die Nutzer-Nachricht (fuer Kontext-Awareness)."""
    route = str(context.get("route") or "").strip()
    summary = str(context.get("screen_summary") or "").strip()
    if not route and not summary:
        return text
    parts = []
    if route:
        parts.append(f"Route: {route}")
    if summary:
        parts.append(summary)
    return f"{text}\n\n[Aktueller Kontext] " + " · ".join(parts)


@router.websocket("/ws/jarvis")
async def jarvis_ws(websocket: WebSocket) -> None:
    settings = get_settings()

    await websocket.accept()

    cookie = websocket.cookies.get(COOKIE_NAME)
    if not (cookie and verify_session_cookie(settings.session_secret, cookie)):
        await websocket.close(code=WS_CLOSE_UNAUTHORIZED, reason="Nicht authentifiziert")
        return

    # Anthropic-Nachrichtenhistorie (nur im LLM-Modus relevant).
    messages: list[dict[str, Any]] = []
    current_task: Optional[asyncio.Task[None]] = None

    try:
        while True:
            raw = await websocket.receive_json()
            mtype = raw.get("type")

            if mtype == "cancel":
                if current_task is not None and not current_task.done():
                    current_task.cancel()
                continue

            if mtype == "user_text":
                text = str(raw.get("text") or "").strip()
                if not text:
                    continue
                context = raw.get("context") or {}
                if not isinstance(context, dict):
                    context = {}
                # Laufende Generierung abbrechen UND ihr Aufraeumen abwarten, BEVOR
                # der neue Turn startet. Sonst koennte das 'del messages[base_len:]'
                # des alten Turns (base_len vom alten Startzeitpunkt) die frisch
                # angehaengte Nachricht des neuen Turns mitloeschen (geteilte Liste).
                if current_task is not None and not current_task.done():
                    current_task.cancel()
                    with contextlib.suppress(asyncio.CancelledError):
                        await current_task
                current_task = asyncio.create_task(
                    _handle_turn(websocket, settings, messages, text, context)
                )
    except WebSocketDisconnect:
        if current_task is not None and not current_task.done():
            current_task.cancel()
    except Exception:  # noqa: BLE001 - Verbindung sauber schliessen, nie hart crashen
        log.exception("Jarvis-WS-Schleife abgebrochen.")
        if current_task is not None and not current_task.done():
            current_task.cancel()


async def _handle_turn(
    websocket: WebSocket,
    settings: Any,
    messages: list[dict[str, Any]],
    text: str,
    context: dict[str, Any],
) -> None:
    """Fuehrt einen Turn aus und sendet die Frames. Cancelbar (Task-Cancel)."""
    base_len = len(messages)
    messages.append({"role": "user", "content": _compose_user_content(text, context)})

    async def emit(frame: dict[str, Any]) -> None:
        await websocket.send_json(frame)

    try:
        full_text = await brain.run_turn(settings, messages, text, emit)
        await websocket.send_json({"type": "done", "full_text": full_text})
    except asyncio.CancelledError:
        # Generierung abgebrochen: Historie auf den Stand vor dem Turn zuruecksetzen.
        del messages[base_len:]
        raise
    except Exception:  # noqa: BLE001
        log.exception("Jarvis-Turn fehlgeschlagen.")
        del messages[base_len:]
        try:
            await websocket.send_json(
                {"type": "error", "detail": "Interner Fehler bei der Antwort."}
            )
        except Exception:  # noqa: BLE001 - Client evtl. schon weg
            pass
