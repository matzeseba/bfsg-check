"""Jarvis-Brain (ARCHITECTURE.md Paragraph 5).

Provider-Abstraktion ueber ``services/llm_provider`` (AOS_LLM_PROVIDER):
- ``anthropic`` (Default): Messages-Streaming mit Tool-Use-Loop, Modell
  `AOS_MODEL_JARVIS`, max_tokens 1024, deutscher System-Prompt.
- ``openai-compatible``: einfache Chat-Completion via httpx — OHNE Tool-Use
  und OHNE Streaming (EINSCHRAENKUNG: das Anthropic-Tool-Use-Format laesst
  sich nicht verlustfrei auf das OpenAI-Format abbilden; dieser Pfad
  beantwortet nur Fragen, keine navigate-/run_agent-Aktionen).
Ohne LLM-Key: regelbasierter Fallback (Keyword-Routing).

Frames (an den Client, via `emit`-Callback):
    {"type":"assistant_delta","text":"..."}
    {"type":"ui_action","action":"navigate"|"run_agent","params":{...}}
`done`/`error` sendet der WS-Handler (ws.py); dieses Modul liefert den full_text
zurueck und emittiert Zwischen-Frames.
"""

from __future__ import annotations

import asyncio
import logging
import re
from typing import Any, Awaitable, Callable, Optional

from ..config import Settings
from ..services import llm_provider
from . import tools

log = logging.getLogger("aos.jarvis.brain")

EmitFn = Callable[[dict[str, Any]], Awaitable[None]]

MAX_TOOL_ITERATIONS = 6

SYSTEM_PROMPT = (
    "Du bist Jarvis, das Betriebssystem des BFSG-Fuchs-Dashboards. BFSG-Fuchs ist "
    "ein Anbieter automatisierter technischer Barrierefreiheits-Analysen (WCAG 2.1 AA) "
    "fuer Websites. Du hilfst dem Betreiber, das Dashboard per Sprache und Text zu "
    "bedienen.\n\n"
    "Das Dashboard hat die Module (Routen): '/' (Dashboard-Uebersicht), '/inbox' "
    "(Posteingang mit Kundenanfragen), '/library' (Content-Bibliothek), '/health' "
    "(System-/Service-Status), '/finance' (Finanzen/Umsatz), '/agents' (KI-Agenten).\n\n"
    "Nutze die bereitgestellten Tools, um zu navigieren, Daten abzurufen, die "
    "Bibliothek zu durchsuchen, Agenten zu starten oder Antwortentwuerfe zu erstellen. "
    "Wenn der Nutzer ein Modul oeffnen moechte, rufe das Tool 'navigate' auf.\n\n"
    "Antworte knapp und gesprochen-tauglich (kurze Saetze, keine Aufzaehlungen mit "
    "Sonderzeichen, keine Markdown-Tabellen), auf Deutsch mit echten Umlauten.\n\n"
    "VERBOTEN (UWG): Formuliere niemals rechtliche Versprechen. Benutze nie die Woerter "
    "'BFSG-konform', 'rechtssicher', 'garantiert', 'TUEV' oder 'DEKRA'. Sprich von "
    "'automatisierter technischer Analyse' bzw. 'WCAG-2.1-AA-Audit'."
)


# --------------------------------------------------------------------------- #
# Regelbasierter Fallback (ohne API-Key)
# --------------------------------------------------------------------------- #
_NAV_TRIGGER = re.compile(r"\b(öffne|offne|zeige|zeig|geh(e)?\s+zu|wechsle|navigiere)\b", re.IGNORECASE)
_DEBRIEF_TRIGGER = re.compile(r"\b(debrief(ing)?|briefing|tagesbriefing)\b", re.IGNORECASE)

# Modul-Stichwoerter -> Route (Reihenfolge: spezifisch vor generisch).
_MODULE_ROUTES: tuple[tuple[re.Pattern[str], str, str], ...] = (
    (re.compile(r"posteingang|inbox|anfrage", re.IGNORECASE), "/inbox", "Posteingang"),
    (re.compile(r"bibliothek|library|content", re.IGNORECASE), "/library", "Bibliothek"),
    (re.compile(r"system|health|gesundheit|status|dienste", re.IGNORECASE), "/health", "System"),
    (re.compile(r"finanz|finance|umsatz|geld|einnahmen", re.IGNORECASE), "/finance", "Finanzen"),
    (re.compile(r"agent", re.IGNORECASE), "/agents", "Agenten"),
    (re.compile(r"dashboard|übersicht|ubersicht|start|home", re.IGNORECASE), "/", "Dashboard"),
)

_NO_KEY_HINT = "KI-Modus inaktiv — AOS_LLM_API_KEY/ANTHROPIC_API_KEY fehlt."


def rule_based_reply(text: str) -> tuple[str, Optional[dict[str, Any]]]:
    """Deterministische Antwort ohne LLM.

    Rueckgabe: (Antworttext, optionale ui_action). Rein synchron und ohne
    Seiteneffekte -> unmittelbar testbar.
    """
    lowered = text or ""

    if _DEBRIEF_TRIGGER.search(lowered):
        return (
            "Ich starte das Tagesbriefing. " + _NO_KEY_HINT,
            {"type": "ui_action", "action": "run_agent", "params": {"key": "debrief"}},
        )

    if _NAV_TRIGGER.search(lowered):
        for pattern, route, name in _MODULE_ROUTES:
            if pattern.search(lowered):
                return (
                    f"Öffne {name}. " + _NO_KEY_HINT,
                    {"type": "ui_action", "action": "navigate", "params": {"route": route}},
                )

    return (
        "Ich kann diese Anfrage ohne aktiven KI-Modus nicht beantworten. "
        "Sage z. B. „öffne den Posteingang“ oder „zeige die Finanzen“. " + _NO_KEY_HINT,
        None,
    )


async def _fallback_turn(user_text: str, emit: EmitFn) -> str:
    reply_text, ui_action = rule_based_reply(user_text)
    await emit({"type": "assistant_delta", "text": reply_text})
    if ui_action is not None:
        await emit(ui_action)
    return reply_text


# --------------------------------------------------------------------------- #
# LLM-Turn (Anthropic-Streaming + Tool-Use-Loop, alternativ OpenAI-kompatibel)
# --------------------------------------------------------------------------- #
def _blocks_to_dicts(content: Any) -> list[dict[str, Any]]:
    """Serialisiert Anthropic-Content-Bloecke fuer den erneuten Versand."""
    out: list[dict[str, Any]] = []
    for block in content:
        btype = getattr(block, "type", None)
        if btype == "text":
            out.append({"type": "text", "text": block.text})
        elif btype == "tool_use":
            out.append(
                {
                    "type": "tool_use",
                    "id": block.id,
                    "name": block.name,
                    "input": block.input,
                }
            )
    return out


async def _llm_turn(
    settings: Settings, messages: list[dict[str, Any]], emit: EmitFn
) -> str:
    if llm_provider.provider_name(settings) == llm_provider.PROVIDER_OPENAI_COMPATIBLE:
        return await _llm_turn_openai_compatible(settings, messages, emit)
    return await _llm_turn_anthropic(settings, messages, emit)


async def _llm_turn_openai_compatible(
    settings: Settings, messages: list[dict[str, Any]], emit: EmitFn
) -> str:
    """OpenAI-kompatibler Pfad: einfache Chat-Completion OHNE Tool-Use.

    EINSCHRAENKUNG (bewusst): Das Anthropic-Tool-Use-Protokoll (tool_use/
    tool_result-Bloecke) laesst sich nicht verlustfrei auf OpenAI-Tool-Calls
    abbilden. Daher laeuft dieser Provider rein als Chat: die letzte
    Nutzer-Nachricht wird beantwortet, navigate-/run_agent-Aktionen stehen
    hier NICHT zur Verfuegung (dafuer Anthropic-Provider oder Regel-Fallback).
    Kein Streaming — die Antwort wird als ein Delta emittiert.
    """
    # Letzte Nutzer-Nachricht als Prompt (Historie liegt in `messages`;
    # der OpenAI-Pfad haelt sie bewusst flach, um Format-Fallstricke
    # mit tool_use/tool_result-Bloecken zu vermeiden).
    user_text = ""
    for msg in reversed(messages):
        if msg.get("role") == "user":
            content = msg.get("content")
            if isinstance(content, str):
                user_text = content
                break
    text = await llm_provider.a_chat_complete_openai(
        settings.llm_base_url,
        settings.llm_api_key,
        SYSTEM_PROMPT,
        user_text,
        max_tokens=1024,
        model=settings.model_jarvis,
    )
    if text is None:
        raise RuntimeError("OpenAI-kompatibler LLM-Call fehlgeschlagen")
    await emit({"type": "assistant_delta", "text": text})
    return text


async def _llm_turn_anthropic(
    settings: Settings, messages: list[dict[str, Any]], emit: EmitFn
) -> str:
    from anthropic import AsyncAnthropic

    client = AsyncAnthropic(api_key=settings.llm_api_key)
    full_parts: list[str] = []

    for _ in range(MAX_TOOL_ITERATIONS):
        async with client.messages.stream(
            model=settings.model_jarvis,
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            tools=tools.TOOLS,
            messages=messages,
        ) as stream:
            async for chunk in stream.text_stream:
                if chunk:
                    full_parts.append(chunk)
                    await emit({"type": "assistant_delta", "text": chunk})
            final = await stream.get_final_message()

        messages.append({"role": "assistant", "content": _blocks_to_dicts(final.content)})

        tool_uses = [b for b in final.content if getattr(b, "type", None) == "tool_use"]
        if not tool_uses:
            break

        tool_results: list[dict[str, Any]] = []
        for tu in tool_uses:
            result_text, ui_action = await asyncio.to_thread(
                tools.execute_tool, tu.name, dict(tu.input or {}), settings
            )
            if ui_action is not None:
                await emit(ui_action)
            tool_results.append(
                {
                    "type": "tool_result",
                    "tool_use_id": tu.id,
                    "content": result_text,
                }
            )
        messages.append({"role": "user", "content": tool_results})

    return "".join(full_parts)


# --------------------------------------------------------------------------- #
# Oeffentlicher Einstieg
# --------------------------------------------------------------------------- #
async def run_turn(
    settings: Settings,
    messages: list[dict[str, Any]],
    user_text: str,
    emit: EmitFn,
) -> str:
    """Fuehrt einen Gespraechs-Turn aus und liefert den vollstaendigen Antworttext.

    `messages` enthaelt bereits die aktuelle Nutzer-Nachricht (mit eingebettetem
    Kontext). Ohne LLM-Key wird der regelbasierte Fallback genutzt; dabei bleibt
    `messages` unveraendert (der WS-Handler haelt die Historie schlank).
    """
    if not llm_provider.llm_enabled(settings):
        return await _fallback_turn(user_text, emit)
    try:
        return await _llm_turn(settings, messages, emit)
    except asyncio.CancelledError:
        raise
    except Exception:  # noqa: BLE001 - jede API-Stoerung faellt auf die Regel-Antwort zurueck
        log.exception("Jarvis-LLM-Turn fehlgeschlagen — Fallback aktiv.")
        return await _fallback_turn(user_text, emit)
