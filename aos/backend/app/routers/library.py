"""Library-Router (ARCHITECTURE.md Paragraph 4). LIKE-Suche ueber title+body+tags."""

from __future__ import annotations

import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlmodel import Session, or_, select

from ..auth import require_auth
from ..db import get_session, utcnow
from ..models import LibraryAsset

router = APIRouter(
    prefix="/api/library", tags=["library"], dependencies=[Depends(require_auth)]
)

_CATEGORIES = {"linkedin", "case-study", "audit-template", "sonstiges"}


def _tags(asset: LibraryAsset) -> list[str]:
    try:
        parsed = json.loads(asset.tags_json)
        return parsed if isinstance(parsed, list) else []
    except (ValueError, json.JSONDecodeError):
        return []


def _preview(body_md: str, limit: int = 160) -> str:
    flat = " ".join(body_md.split())
    return flat[:limit] + ("..." if len(flat) > limit else "")


def _summary(asset: LibraryAsset) -> dict:
    return {
        "id": asset.id,
        "title": asset.title,
        "category": asset.category,
        "tags": _tags(asset),
        "preview": _preview(asset.body_md),
        "updated_at": asset.updated_at.isoformat(),
    }


def _full(asset: LibraryAsset) -> dict:
    data = _summary(asset)
    data["body_md"] = asset.body_md
    data["source"] = asset.source
    return data


@router.get("")
def list_library(
    session: Session = Depends(get_session),
    q: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
) -> dict:
    stmt = select(LibraryAsset)
    if category:
        stmt = stmt.where(LibraryAsset.category == category)
    if q:
        like = f"%{q}%"
        stmt = stmt.where(
            or_(
                LibraryAsset.title.like(like),  # type: ignore[union-attr]
                LibraryAsset.body_md.like(like),  # type: ignore[union-attr]
                LibraryAsset.tags_json.like(like),  # type: ignore[union-attr]
            )
        )
    assets = session.exec(stmt).all()
    assets.sort(key=lambda a: a.updated_at, reverse=True)
    return {"items": [_summary(a) for a in assets]}


@router.get("/{asset_id}")
def get_library(asset_id: int, session: Session = Depends(get_session)) -> dict:
    asset = session.get(LibraryAsset, asset_id)
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset nicht gefunden")
    return _full(asset)


class LibraryIn(BaseModel):
    title: str
    category: str = "sonstiges"
    tags: list[str] = []
    body_md: str = ""


def _validate_category(category: str) -> str:
    return category if category in _CATEGORIES else "sonstiges"


@router.post("")
def create_library(
    body: LibraryIn, session: Session = Depends(get_session)
) -> dict:
    asset = LibraryAsset(
        title=body.title,
        category=_validate_category(body.category),
        tags_json=json.dumps(body.tags, ensure_ascii=False),
        body_md=body.body_md,
        source="live",
    )
    session.add(asset)
    session.commit()
    session.refresh(asset)
    return _full(asset)


@router.put("/{asset_id}")
def update_library(
    asset_id: int, body: LibraryIn, session: Session = Depends(get_session)
) -> dict:
    asset = session.get(LibraryAsset, asset_id)
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset nicht gefunden")
    asset.title = body.title
    asset.category = _validate_category(body.category)
    asset.tags_json = json.dumps(body.tags, ensure_ascii=False)
    asset.body_md = body.body_md
    asset.updated_at = utcnow()
    session.add(asset)
    session.commit()
    session.refresh(asset)
    return _full(asset)
