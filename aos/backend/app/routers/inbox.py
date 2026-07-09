"""Inbox-Router (ARCHITECTURE.md Paragraph 4)."""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlmodel import Session, select

from ..auth import require_auth
from ..config import Settings, get_settings
from ..db import get_session, utcnow
from ..models import InboxItem
from ..services import ai

router = APIRouter(prefix="/api/inbox", tags=["inbox"], dependencies=[Depends(require_auth)])

_ALLOWED_STATUS = {"open", "drafted", "replied", "closed"}


def _item_summary(item: InboxItem) -> dict:
    return {
        "id": item.id,
        "subject": item.subject,
        "sender": item.sender,
        "channel": item.channel,
        "preview": item.preview,
        "priority": item.priority,
        "priority_reason": item.priority_reason,
        "status": item.status,
        "created_at": item.created_at.isoformat(),
        "source": item.source,
    }


@router.get("")
def list_inbox(
    session: Session = Depends(get_session),
    status: Optional[str] = Query(default=None),
    priority: Optional[int] = Query(default=None, ge=1, le=5),
) -> dict:
    stmt = select(InboxItem)
    if status:
        stmt = stmt.where(InboxItem.status == status)
    if priority is not None:
        stmt = stmt.where(InboxItem.priority == priority)
    items = session.exec(stmt).all()
    # Prioritaet aufsteigend (1 = hoechste); bei Gleichstand neueste zuerst.
    items.sort(key=lambda i: (i.priority, -i.created_at.timestamp()))
    return {"items": [_item_summary(i) for i in items]}


@router.get("/{item_id}")
def get_inbox(item_id: int, session: Session = Depends(get_session)) -> dict:
    item = session.get(InboxItem, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Anfrage nicht gefunden")
    data = _item_summary(item)
    data["body"] = item.body
    data["draft"] = item.draft
    return data


@router.post("/{item_id}/draft")
def draft_inbox(
    item_id: int,
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> dict:
    item = session.get(InboxItem, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Anfrage nicht gefunden")
    draft, model = ai.draft_reply(
        settings,
        {
            "subject": item.subject,
            "sender": item.sender,
            "channel": item.channel,
            "body": item.body,
        },
    )
    item.draft = draft
    item.status = "drafted"
    item.updated_at = utcnow()
    session.add(item)
    session.commit()
    return {"draft": draft, "model": model}


class StatusPatch(BaseModel):
    status: str


@router.patch("/{item_id}")
def patch_inbox(
    item_id: int, body: StatusPatch, session: Session = Depends(get_session)
) -> dict:
    item = session.get(InboxItem, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Anfrage nicht gefunden")
    if body.status not in _ALLOWED_STATUS:
        raise HTTPException(status_code=422, detail="Ungueltiger Status")
    item.status = body.status
    item.updated_at = utcnow()
    session.add(item)
    session.commit()
    data = _item_summary(item)
    data["body"] = item.body
    data["draft"] = item.draft
    return data
