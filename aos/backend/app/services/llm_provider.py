"""LLM-Provider-Adapter (Backend).

Abstraktion ueber die konkrete LLM-Anbindung, gesteuert ueber Env-Vars
(SSOT: aos/ARCHITECTURE.md Paragraph 7):

- ``AOS_LLM_PROVIDER``: ``anthropic`` (Default) oder ``openai-compatible``
- ``AOS_LLM_BASE_URL``: Basis-URL des OpenAI-kompatiblen Endpunkts
  (z. B. ``https://api.openai.com/v1``); Pflicht bei ``openai-compatible``
- ``AOS_LLM_API_KEY``: API-Key; Fallback auf ``ANTHROPIC_API_KEY``

Der OpenAI-kompatible Pfad nutzt ``httpx`` (bereits Dependency) gegen
``POST {base_url}/chat/completions`` — bewusst OHNE Tool-Use (siehe
``jarvis/brain.py``). Jarvis behaelt unter ``anthropic`` den vollen
Streaming-/Tool-Use-Loop; unter ``openai-compatible`` laeuft er als
einfache Chat-Completion ohne Tools.

Design-Prinzip wie ueberall im System: jeder Fehler (kein Key, Netzwerk,
HTTP-Fehler, unerwartetes Response-Format) liefert ``None`` bzw. loest im
Aufrufer den Demo-/Heuristik-Fallback aus — nie einen Absturz.

HINWEIS (Duplikat): Die MCP-Microservices koennen dieses Backend-Modul
strukturell nicht importieren (eigene Container/Deployments). Dort lebt
ein bewusst gespiegelter Adapter in ``aos/mcp/common/ai.py``. Aenderungen
an der Provider-Logik bitte an beiden Stellen nachziehen.
"""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any

import httpx

if TYPE_CHECKING:  # pragma: no cover - nur fuer Typpruefung
    from ..config import Settings

log = logging.getLogger("aos.llm_provider")

PROVIDER_ANTHROPIC = "anthropic"
PROVIDER_OPENAI_COMPATIBLE = "openai-compatible"

_TIMEOUT_S = 60.0


def provider_name(settings: Settings) -> str:
    """Normalisierter Provider-Name; unbekannte Werte fallen auf 'anthropic'."""
    raw = (settings.llm_provider or "").strip().lower()
    if raw in ("", PROVIDER_ANTHROPIC):
        return PROVIDER_ANTHROPIC
    if raw == PROVIDER_OPENAI_COMPATIBLE:
        return PROVIDER_OPENAI_COMPATIBLE
    log.warning("Unbekannter AOS_LLM_PROVIDER %r — Fallback auf 'anthropic'.", raw)
    return PROVIDER_ANTHROPIC


def llm_enabled(settings: Settings) -> bool:
    """True, wenn ein LLM-Aufruf grundsaetzlich konfiguriert ist (Key vorhanden)."""
    return bool(settings.llm_api_key)


def chat_complete(
    settings: Settings,
    system: str,
    user: str,
    *,
    max_tokens: int = 1024,
    model: str | None = None,
) -> str | None:
    """Ein einzelner Chat-Call (synchron). Gibt Text oder ``None`` zurueck.

    Provider-Auswahl ueber ``AOS_LLM_PROVIDER``. Fehler jeder Art -> ``None``
    (Aufrufer faellt auf Heuristik/Demo zurueck).
    """
    if not settings.llm_api_key:
        return None
    if provider_name(settings) == PROVIDER_OPENAI_COMPATIBLE:
        return _openai_compatible_complete(
            settings.llm_base_url,
            settings.llm_api_key,
            system,
            user,
            max_tokens=max_tokens,
            model=model or settings.model_agents,
        )
    return _anthropic_complete(
        settings.llm_api_key,
        system,
        user,
        max_tokens=max_tokens,
        model=model or settings.model_agents,
    )


def _anthropic_complete(
    api_key: str,
    system: str,
    user: str,
    *,
    max_tokens: int,
    model: str,
) -> str | None:
    try:
        import anthropic

        client = anthropic.Anthropic(api_key=api_key)
        resp = client.messages.create(
            model=model,
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        parts = [b.text for b in resp.content if getattr(b, "type", "") == "text"]
        text = "\n".join(parts).strip()
        return text or None
    except Exception:  # noqa: BLE001 - Fallback statt Absturz
        log.exception("Anthropic-Aufruf fehlgeschlagen — Fallback aktiv.")
        return None


def _openai_compatible_complete(
    base_url: str,
    api_key: str,
    system: str,
    user: str,
    *,
    max_tokens: int,
    model: str,
) -> str | None:
    """OpenAI-kompatibler Chat-Completion-Call via httpx (ohne Tool-Use)."""
    if not base_url:
        log.warning("AOS_LLM_BASE_URL fehlt — OpenAI-kompatibler Pfad inaktiv.")
        return None
    url = base_url.rstrip("/") + "/chat/completions"
    payload = {
        "model": model,
        "max_tokens": max_tokens,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    }
    try:
        resp = httpx.post(
            url,
            headers={"Authorization": f"Bearer {api_key}"},
            json=payload,
            timeout=_TIMEOUT_S,
        )
        resp.raise_for_status()
        data: dict[str, Any] = resp.json()
        text = (data["choices"][0]["message"]["content"] or "").strip()
        return text or None
    except Exception:  # noqa: BLE001 - Fallback statt Absturz
        log.exception("OpenAI-kompatibler Aufruf fehlgeschlagen — Fallback aktiv.")
        return None


async def a_chat_complete_openai(
    base_url: str,
    api_key: str,
    system: str,
    user: str,
    *,
    max_tokens: int,
    model: str,
) -> str | None:
    """Async-Variante des OpenAI-kompatiblen Calls (fuer Jarvis, ohne Tool-Use).

    Jarvis nutzt diesen Pfad als einfache Chat-Completion: keine Tools, kein
    Streaming — der komplette Antworttext wird in einem Stueck geliefert.
    Fehler jeder Art -> ``None`` (Aufrufer faellt auf die Regel-Antwort zurueck).
    """
    if not base_url:
        log.warning("AOS_LLM_BASE_URL fehlt — OpenAI-kompatibler Pfad inaktiv.")
        return None
    url = base_url.rstrip("/") + "/chat/completions"
    payload = {
        "model": model,
        "max_tokens": max_tokens,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    }
    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT_S) as client:
            resp = await client.post(
                url,
                headers={"Authorization": f"Bearer {api_key}"},
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()
            text = (data["choices"][0]["message"]["content"] or "").strip()
            return text or None
    except Exception:  # noqa: BLE001 - Fallback statt Absturz
        log.exception("OpenAI-kompatibler Jarvis-Call fehlgeschlagen — Fallback aktiv.")
        return None
