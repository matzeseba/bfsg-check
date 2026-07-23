"""Gemeinsame LLM-Anbindung für die MCP-Agenten (Team Beta-2).

Provider-Abstraktion über Env-Vars (SSOT: aos/ARCHITECTURE.md §7):

- ``AOS_LLM_PROVIDER``: ``anthropic`` (Default) oder ``openai-compatible``
- ``AOS_LLM_BASE_URL``: Basis-URL des OpenAI-kompatiblen Endpunkts
- ``AOS_LLM_API_KEY``: API-Key; Fallback auf ``ANTHROPIC_API_KEY``

Der OpenAI-kompatible Pfad nutzt ``httpx`` gegen ``POST {base}/chat/completions``
(ohne Tool-Use — die Agenten brauchen nur einfache Completions).

Alle Aufrufe sind best-effort: fehlt der Key oder schlägt der Call fehl,
wird ``None`` zurückgegeben und der Agent nutzt seinen Demo-/Template-Fallback.
Damit bleiben die Services (und die Tests) ohne API-Key voll funktionsfähig.

HINWEIS (Duplikat): Das Backend hat den strukturell getrennten, aber fachlich
gespiegelten Adapter ``aos/backend/app/services/llm_provider.py`` (die MCP-
Container können keinen Backend-Code importieren). Änderungen an der Provider-
Logik bitte an beiden Stellen nachziehen.
"""

from __future__ import annotations

import logging
import os

import httpx

log = logging.getLogger("aos.mcp.ai")

DEFAULT_AGENT_MODEL = "claude-sonnet-4-6"

PROVIDER_ANTHROPIC = "anthropic"
PROVIDER_OPENAI_COMPATIBLE = "openai-compatible"

_TIMEOUT_S = 60.0


def agent_model() -> str:
    """Modell für Agenten-Generierung (Env AOS_MODEL_AGENTS, sonst Default)."""
    return os.getenv("AOS_MODEL_AGENTS") or DEFAULT_AGENT_MODEL


def llm_provider_name() -> str:
    """Normalisierter Provider-Name; unbekannte Werte fallen auf 'anthropic'."""
    raw = (os.getenv("AOS_LLM_PROVIDER") or "").strip().lower()
    if raw in ("", PROVIDER_ANTHROPIC):
        return PROVIDER_ANTHROPIC
    if raw == PROVIDER_OPENAI_COMPATIBLE:
        return PROVIDER_OPENAI_COMPATIBLE
    log.warning("Unbekannter AOS_LLM_PROVIDER %r — Fallback auf 'anthropic'.", raw)
    return PROVIDER_ANTHROPIC


def llm_api_key() -> str:
    """AOS_LLM_API_KEY hat Vorrang; ANTHROPIC_API_KEY bleibt als Fallback."""
    return os.getenv("AOS_LLM_API_KEY") or os.getenv("ANTHROPIC_API_KEY") or ""


def has_anthropic() -> bool:
    """True, wenn ein LLM-Aufruf konfiguriert ist (Key vorhanden).

    Heisst aus Kompatibilitätsgründen weiter ``has_anthropic`` (Agenten-
    Schnittstelle), gilt aber für jeden konfigurierten Provider.
    """
    return bool(llm_api_key())


async def chat_complete(
    system: str,
    user: str,
    *,
    max_tokens: int = 1024,
    model: str | None = None,
) -> str | None:
    """Ein einzelner Chat-Call. Gibt Text oder ``None`` zurück.

    Provider-Auswahl über ``AOS_LLM_PROVIDER``. Fehler jeder Art -> ``None``
    (Aufrufer fällt auf Demo-/Template-Fallback zurück).
    """
    key = llm_api_key()
    if not key:
        return None
    if llm_provider_name() == PROVIDER_OPENAI_COMPATIBLE:
        return await _openai_compatible_complete(
            system, user, key, max_tokens=max_tokens, model=model or agent_model()
        )
    return await _anthropic_complete(
        system, user, key, max_tokens=max_tokens, model=model or agent_model()
    )


async def anthropic_complete(
    system: str,
    user: str,
    *,
    max_tokens: int = 1024,
    model: str | None = None,
) -> str | None:
    """Kompatibilitäts-Alias für ``chat_complete`` (Agenten-Schnittstelle)."""
    return await chat_complete(system, user, max_tokens=max_tokens, model=model)


async def _anthropic_complete(
    system: str,
    user: str,
    api_key: str,
    *,
    max_tokens: int,
    model: str,
) -> str | None:
    try:
        import anthropic

        client = anthropic.AsyncAnthropic(api_key=api_key)
        resp = await client.messages.create(
            model=model,
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        parts = [
            block.text
            for block in resp.content
            if getattr(block, "type", None) == "text"
        ]
        text = "\n".join(parts).strip()
        return text or None
    except Exception:  # noqa: BLE001 - Fallback statt Absturz
        log.exception("Anthropic-Aufruf fehlgeschlagen — Fallback aktiv.")
        return None


async def _openai_compatible_complete(
    system: str,
    user: str,
    api_key: str,
    *,
    max_tokens: int,
    model: str,
) -> str | None:
    """OpenAI-kompatibler Chat-Completion-Call via httpx (ohne Tool-Use)."""
    base_url = os.getenv("AOS_LLM_BASE_URL") or ""
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
        log.exception("OpenAI-kompatibler Aufruf fehlgeschlagen — Fallback aktiv.")
        return None
