"""Dashboard-Router (ARCHITECTURE.md Paragraph 4): aggregierte Startseiten-KPIs."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from ..adapters import stripe_adapter
from ..auth import require_auth
from ..config import Settings, get_settings
from ..db import get_session, utcnow
from ..models import AgentRun, HealthCheck, InboxItem, Notification
from ..services import healthcheck

router = APIRouter(
    prefix="/api/dashboard", tags=["dashboard"], dependencies=[Depends(require_auth)]
)


def _services_ok(session: Session, settings: Settings) -> tuple[int, int]:
    targets = healthcheck.service_targets(settings)
    total = len(targets)
    ok = 0
    for target in targets:
        latest = session.exec(
            select(HealthCheck)
            .where(HealthCheck.service_key == target["key"])
            .order_by(HealthCheck.ts.desc())  # type: ignore[union-attr]
        ).first()
        if latest is not None and latest.ok:
            ok += 1
        elif latest is None and target["key"] == "aos-backend":
            ok += 1  # Self ist per Definition ok, auch vor dem ersten Scheduler-Lauf.
    return ok, total


@router.get("/summary")
def summary(
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> dict:
    fin = stripe_adapter.get_summary(session, settings)
    day_start = utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    open_inbox = len(
        session.exec(select(InboxItem).where(InboxItem.status == "open")).all()
    )
    leads_today = len(
        session.exec(
            select(Notification)
            .where(Notification.level == "lead")
            .where(Notification.ts >= day_start)
        ).all()
    )
    agent_runs_today = len(
        session.exec(select(AgentRun).where(AgentRun.started_at >= day_start)).all()
    )
    notifications_unread = len(
        session.exec(
            select(Notification).where(Notification.read == False)  # noqa: E712
        ).all()
    )
    services_ok, services_total = _services_ok(session, settings)

    return {
        "revenue_30d_eur": fin["gross_30d"],
        "revenue_source": fin["source"],
        "open_inbox": open_inbox,
        "leads_today": leads_today,
        "services_ok": services_ok,
        "services_total": services_total,
        "agent_runs_today": agent_runs_today,
        "notifications_unread": notifications_unread,
        "sparkline_30d": stripe_adapter.get_sparkline(session, settings),
    }
