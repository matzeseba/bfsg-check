"""Scanner-Adapter — GET SCANNER_BASE_URL/health, optional /admin-Daten.

Wenn SCANNER_ADMIN_TOKEN gesetzt: Versuch /admin/stats mit Bearer. 404/401 -> nur health.
Ohne Erreichbarkeit: Demo-Daten (source="demo").
"""

from __future__ import annotations

from typing import Any

import httpx

from ..config import Settings


def is_live(settings: Settings) -> bool:
    # "Live" bedeutet hier: Scan-Engine erreichbar (Basis-URL konfiguriert).
    return bool(settings.scanner_base_url)


def health(settings: Settings) -> dict[str, Any]:
    """Ruft /health der Scan-Engine ab. Ergebnis inkl. optionaler /admin-Daten."""
    base = settings.scanner_base_url.rstrip("/")
    try:
        with httpx.Client(timeout=5.0) as c:
            resp = c.get(f"{base}/health")
            resp.raise_for_status()
            payload = resp.json() if resp.content else {}
    except (httpx.HTTPError, ValueError):
        return {
            "source": "demo",
            "ok": True,
            "health": {"ok": True, "stripe": True, "live": True, "mailer": True},
            "admin": {
                "scans_total": 128,
                "scans_30d": 34,
                "avg_score": 71,
            },
        }

    result: dict[str, Any] = {"source": "live", "ok": True, "health": payload}
    admin = _admin_stats(settings, base)
    if admin is not None:
        result["admin"] = admin
    return result


def _admin_stats(settings: Settings, base: str) -> dict[str, Any] | None:
    if not settings.scanner_admin_token:
        return None
    headers = {"Authorization": f"Bearer {settings.scanner_admin_token}"}
    try:
        with httpx.Client(timeout=5.0, headers=headers) as c:
            resp = c.get(f"{base}/admin/stats")
            if resp.status_code in (401, 403, 404):
                return None
            resp.raise_for_status()
            return resp.json() if resp.content else None
    except (httpx.HTTPError, ValueError):
        return None
