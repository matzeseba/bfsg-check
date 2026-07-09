"""Notifications-Router (ARCHITECTURE.md Paragraph 4)."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlmodel import Session, select

from ..auth import require_auth
from ..db import get_session
from ..models import Notification

router = APIRouter(
    prefix="/api/notifications",
    tags=["notifications"],
    dependencies=[Depends(require_auth)],
)


@router.get("")
def list_notifications(
    session: Session = Depends(get_session),
    unread: bool = Query(default=False),
) -> dict:
    stmt = select(Notification)
    if unread:
        stmt = stmt.where(Notification.read == False)  # noqa: E712 (SQL-Vergleich)
    rows = session.exec(stmt).all()
    rows.sort(key=lambda n: n.ts, reverse=True)
    items = [
        {
            "id": n.id,
            "ts": n.ts.isoformat(),
            "level": n.level,
            "title": n.title,
            "body": n.body,
            "read": n.read,
        }
        for n in rows
    ]
    return {"items": items}


class ReadIn(BaseModel):
    ids: list[int]


@router.post("/read")
def mark_read(body: ReadIn, session: Session = Depends(get_session)) -> dict:
    if body.ids:
        rows = session.exec(
            select(Notification).where(Notification.id.in_(body.ids))  # type: ignore[union-attr]
        ).all()
        for n in rows:
            n.read = True
            session.add(n)
        session.commit()
    return {"ok": True}
