"""SQLModel-Engine + Session-Handling (SQLite /data/aos.db, synchron).

Synchron-Entscheidung (ARCHITECTURE.md Paragraph 1 laesst die Wahl): einfacher,
robuster mit SQLite + APScheduler-BackgroundScheduler + FastAPI-Threadpool.
"""

from __future__ import annotations

from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Iterator

from sqlalchemy import event
from sqlalchemy.engine import Engine
from sqlmodel import Session, SQLModel, create_engine

from .config import get_settings


def utcnow() -> datetime:
    """Naive UTC-Zeit — konsistent fuer alle DB-Spalten (SQLite liefert naiv zurueck)."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


_settings = get_settings()
_db_url = f"sqlite:///{_settings.db_path}"

engine: Engine = create_engine(
    _db_url,
    echo=False,
    connect_args={"check_same_thread": False},
)


@event.listens_for(engine, "connect")
def _sqlite_pragmas(dbapi_conn, _record) -> None:  # pragma: no cover - Treiber-Callback
    cur = dbapi_conn.cursor()
    cur.execute("PRAGMA journal_mode=WAL")
    cur.execute("PRAGMA foreign_keys=ON")
    # WAL serialisiert Schreiber; ohne busy_timeout wirft ein zweiter gleichzeitiger
    # Schreiber (Scheduler-Threads vs. Request/WS-Handler) sofort SQLITE_BUSY
    # ('database is locked'). 5s Wartezeit statt hartem 500er.
    cur.execute("PRAGMA busy_timeout=5000")
    cur.close()


def init_db() -> None:
    """Tabellen anlegen (idempotent). Modelle muessen vorher importiert sein."""
    from . import models  # noqa: F401  (Registrierung der Tabellen)

    SQLModel.metadata.create_all(engine)


def get_session() -> Iterator[Session]:
    """FastAPI-Dependency."""
    with Session(engine) as session:
        yield session


@contextmanager
def session_scope() -> Iterator[Session]:
    """Fuer Scheduler-Jobs und BackgroundTasks (ausserhalb des Request-Zyklus)."""
    session = Session(engine)
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
