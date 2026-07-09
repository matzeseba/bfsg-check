"""DB-Schema (ARCHITECTURE.md Paragraph 6, SQLModel/SQLite)."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel

from .db import utcnow


class InboxItem(SQLModel, table=True):
    __tablename__ = "inbox_items"

    id: Optional[int] = Field(default=None, primary_key=True)
    subject: str
    sender: str
    channel: str = Field(default="email")  # email | form | support
    body: str = ""
    preview: str = ""
    priority: int = Field(default=3)  # 1 (hoechste) .. 5
    priority_reason: str = ""
    status: str = Field(default="open", index=True)  # open | drafted | replied | closed
    draft: Optional[str] = None
    source: str = Field(default="demo")  # demo | live
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)


class LibraryAsset(SQLModel, table=True):
    __tablename__ = "library_assets"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    category: str = Field(default="sonstiges")  # linkedin | case-study | audit-template | sonstiges
    tags_json: str = "[]"
    body_md: str = ""
    source: str = Field(default="demo")  # demo | agent | live
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)


class HealthCheck(SQLModel, table=True):
    __tablename__ = "health_checks"

    id: Optional[int] = Field(default=None, primary_key=True)
    service_key: str = Field(index=True)
    ok: bool = False
    latency_ms: int = 0
    detail: str = ""
    ts: datetime = Field(default_factory=utcnow, index=True)


class AgentRun(SQLModel, table=True):
    __tablename__ = "agent_runs"

    id: Optional[int] = Field(default=None, primary_key=True)
    agent_key: str = Field(index=True)  # research | leadscore | competitor | debrief
    started_at: datetime = Field(default_factory=utcnow)
    finished_at: Optional[datetime] = None
    ok: bool = False
    summary: str = ""
    output_md: str = ""
    trigger: str = "schedule"  # schedule | manual


class Notification(SQLModel, table=True):
    __tablename__ = "notifications"

    id: Optional[int] = Field(default=None, primary_key=True)
    ts: datetime = Field(default_factory=utcnow, index=True)
    level: str = "info"  # info | warn | lead
    title: str = ""
    body: str = ""
    read: bool = Field(default=False, index=True)


class FinanceCache(SQLModel, table=True):
    __tablename__ = "finance_cache"

    id: Optional[int] = Field(default=None, primary_key=True)
    key: str = Field(unique=True, index=True)
    payload_json: str = "{}"
    fetched_at: datetime = Field(default_factory=utcnow)
