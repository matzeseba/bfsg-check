"""Gemeinsame Anthropic-Anbindung für die MCP-Agenten (Team Beta-2).

Alle Aufrufe sind best-effort: fehlt der Key oder schlägt der Call fehl,
wird ``None`` zurückgegeben und der Agent nutzt seinen Demo-/Template-Fallback.
Damit bleiben die Services (und die Tests) ohne API-Key voll funktionsfähig.
"""

from __future__ import annotations

import os

DEFAULT_AGENT_MODEL = "claude-sonnet-4-6"


def agent_model() -> str:
    """Modell für Agenten-Generierung (Env AOS_MODEL_AGENTS, sonst Default)."""
    return os.getenv("AOS_MODEL_AGENTS") or DEFAULT_AGENT_MODEL


def has_anthropic() -> bool:
    return bool(os.getenv("ANTHROPIC_API_KEY"))


async def anthropic_complete(
    system: str,
    user: str,
    *,
    max_tokens: int = 1024,
    model: str | None = None,
) -> str | None:
    """Ein einzelner Anthropic-Messages-Call. Gibt Text oder ``None`` zurück."""
    key = os.getenv("ANTHROPIC_API_KEY")
    if not key:
        return None
    try:
        import anthropic

        client = anthropic.AsyncAnthropic(api_key=key)
        resp = await client.messages.create(
            model=model or agent_model(),
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
        return None
