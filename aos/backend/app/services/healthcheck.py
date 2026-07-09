"""Healthcheck-Dienst — prueft alle Services aus ARCHITECTURE.md Paragraph 4.

check_all() macht Live-HTTP-Checks; record_checks() schreibt in health_checks.
Der Scheduler ruft beides alle 60s.
"""

from __future__ import annotations

import time
from typing import Any

import httpx
from sqlmodel import Session

from ..config import Settings
from ..db import utcnow
from ..models import HealthCheck

_TIMEOUT = 4.0


def service_targets(settings: Settings) -> list[dict[str, str]]:
    """Kanonische Service-Liste (Reihenfolge stabil)."""
    return [
        {"key": "scan-engine", "name": "Scan-Engine", "url": f"{settings.scanner_base_url.rstrip('/')}/health"},
        {"key": "landing", "name": "Landingpage", "url": "http://landing-next:3000/"},
        {"key": "admin", "name": "Admin-Dashboard", "url": "http://admin-next:3001/"},
        {"key": "public", "name": "Public (bfsg-fuchs.de)", "url": settings.public_health_url},
        {"key": "mcp-research", "name": "MCP Research", "url": f"{settings.mcp_research_url.rstrip('/')}/healthz"},
        {"key": "mcp-leadscore", "name": "MCP Leadscore", "url": f"{settings.mcp_leadscore_url.rstrip('/')}/healthz"},
        {"key": "mcp-competitor", "name": "MCP Competitor", "url": f"{settings.mcp_competitor_url.rstrip('/')}/healthz"},
        {"key": "mcp-debrief", "name": "MCP Debrief", "url": f"{settings.mcp_debrief_url.rstrip('/')}/healthz"},
        {"key": "aos-backend", "name": "AOS-Backend", "url": "self"},
    ]


def _check_one(client: httpx.Client, target: dict[str, str]) -> dict[str, Any]:
    if target["url"] == "self":
        return {
            "key": target["key"],
            "name": target["name"],
            "url": target["url"],
            "ok": True,
            "latency_ms": 0,
            "checked_at": utcnow().isoformat(),
            "detail": "self",
        }
    start = time.perf_counter()
    ok = False
    detail = ""
    try:
        resp = client.get(target["url"])
        latency = int((time.perf_counter() - start) * 1000)
        ok = resp.status_code < 500
        detail = f"HTTP {resp.status_code}"
    except httpx.HTTPError as exc:
        latency = int((time.perf_counter() - start) * 1000)
        detail = type(exc).__name__
    return {
        "key": target["key"],
        "name": target["name"],
        "url": target["url"],
        "ok": ok,
        "latency_ms": latency,
        "checked_at": utcnow().isoformat(),
        "detail": detail,
    }


def check_all(settings: Settings) -> list[dict[str, Any]]:
    results: list[dict[str, Any]] = []
    with httpx.Client(timeout=_TIMEOUT, follow_redirects=True) as client:
        for target in service_targets(settings):
            results.append(_check_one(client, target))
    return results


def record_checks(session: Session, results: list[dict[str, Any]]) -> None:
    for r in results:
        session.add(
            HealthCheck(
                service_key=r["key"],
                ok=bool(r["ok"]),
                latency_ms=int(r["latency_ms"]),
                detail=r.get("detail", ""),
            )
        )
    session.commit()
