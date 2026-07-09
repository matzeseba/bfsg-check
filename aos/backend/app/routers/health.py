"""Health-Router (ARCHITECTURE.md Paragraph 4): services, host, history."""

from __future__ import annotations

from datetime import timedelta
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select

from ..adapters import host_adapter
from ..auth import require_auth
from ..config import Settings, get_settings
from ..db import get_session, utcnow
from ..models import HealthCheck
from ..services import healthcheck

router = APIRouter(
    prefix="/api/health", tags=["health"], dependencies=[Depends(require_auth)]
)


@router.get("/services")
def services(settings: Settings = Depends(get_settings)) -> dict:
    return {"services": healthcheck.check_all(settings)}


@router.get("/host")
def host(settings: Settings = Depends(get_settings)) -> dict:
    return host_adapter.host_metrics(settings)


@router.get("/history")
def history(
    session: Session = Depends(get_session),
    service: Optional[str] = Query(default=None),
    hours: int = Query(default=24, ge=1, le=168),
) -> dict:
    since = utcnow() - timedelta(hours=hours)
    stmt = select(HealthCheck).where(HealthCheck.ts >= since)
    if service:
        stmt = stmt.where(HealthCheck.service_key == service)
    rows = session.exec(stmt).all()
    rows.sort(key=lambda r: r.ts)
    points = [
        {"ts": r.ts.isoformat(), "ok": r.ok, "latency_ms": r.latency_ms} for r in rows
    ]
    return {"points": points}
