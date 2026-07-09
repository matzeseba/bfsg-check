"""Brevo-Adapter — transaktionale Mail (api.brevo.com/v3/smtp/email) + Account-Info.

Live mit BREVO_API_KEY (Header api-key). Ohne Key: Demo (kein Versand, source="demo").
"""

from __future__ import annotations

from typing import Any

import httpx

from ..config import Settings

_BREVO_BASE = "https://api.brevo.com/v3"
_SENDER = {"name": "BFSG-Fuchs AOS", "email": "no-reply@bfsg-fuchs.de"}


def is_live(settings: Settings) -> bool:
    return bool(settings.brevo_api_key)


def send_transactional(
    settings: Settings,
    to_email: str,
    subject: str,
    html: str,
    text: str | None = None,
) -> dict[str, Any]:
    """Sendet eine transaktionale Mail. Ohne Key: Demo-Antwort ohne Versand."""
    if not is_live(settings) or not to_email:
        return {"sent": False, "source": "demo", "detail": "kein BREVO_API_KEY"}

    payload: dict[str, Any] = {
        "sender": _SENDER,
        "to": [{"email": to_email}],
        "subject": subject,
        "htmlContent": html,
    }
    if text:
        payload["textContent"] = text

    headers = {
        "api-key": settings.brevo_api_key,
        "accept": "application/json",
        "content-type": "application/json",
    }
    try:
        with httpx.Client(base_url=_BREVO_BASE, headers=headers, timeout=10.0) as c:
            resp = c.post("/smtp/email", json=payload)
            resp.raise_for_status()
    except httpx.HTTPError as exc:
        return {"sent": False, "source": "live", "detail": f"Brevo-Fehler: {exc}"}
    data = resp.json() if resp.content else {}
    return {"sent": True, "source": "live", "message_id": data.get("messageId")}


def account_info(settings: Settings) -> dict[str, Any]:
    """GET /account. Ohne Key: Demo-Kennzahlen."""
    if not is_live(settings):
        return {
            "source": "demo",
            "email": "demo@bfsg-fuchs.de",
            "company_name": "BFSG-Fuchs (Demo)",
            "plan_credits": 3000,
        }
    headers = {"api-key": settings.brevo_api_key, "accept": "application/json"}
    try:
        with httpx.Client(base_url=_BREVO_BASE, headers=headers, timeout=10.0) as c:
            resp = c.get("/account")
            resp.raise_for_status()
    except httpx.HTTPError as exc:
        return {"source": "live", "detail": f"Brevo-Fehler: {exc}"}
    data = resp.json()
    plan = data.get("plan", [])
    credits = plan[0].get("credits") if isinstance(plan, list) and plan else None
    return {
        "source": "live",
        "email": data.get("email"),
        "company_name": data.get("companyName"),
        "plan_credits": credits,
    }
