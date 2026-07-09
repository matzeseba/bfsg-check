"""FastAPI-App: Router-Mounts, Lifespan (DB-Init + Seed + Scheduler).

ARCHITECTURE.md Paragraph 4/8. Team Gamma liefert app/jarvis/ nach — der Mount unten
ist in try/except ImportError gekapselt, damit die App auch ohne das Modul startet.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from . import __version__
from .config import get_settings
from .db import init_db, session_scope
from .routers import (
    agents,
    auth,
    dashboard,
    finance,
    health,
    inbox,
    library,
    notifications,
)
from .seed import seed_if_empty
from .services import scheduler

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("aos.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    init_db()
    with session_scope() as session:
        seed_if_empty(session)
    scheduler.start_scheduler(settings)
    try:
        yield
    finally:
        scheduler.shutdown_scheduler()


app = FastAPI(title="AOS-Backend", version=__version__, lifespan=lifespan)

app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(inbox.router)
app.include_router(library.router)
app.include_router(health.router)
app.include_router(finance.router)
app.include_router(agents.router)
app.include_router(notifications.router)


@app.get("/healthz")
def healthz() -> dict:
    return {"ok": True, "service": "aos-backend", "version": __version__}


# --------------------------------------------------------------------------- #
# Team Gamma: Jarvis-WebSocket (app/jarvis/ws.py). Optionaler Mount.
# --------------------------------------------------------------------------- #
try:
    from .jarvis import ws as jarvis_ws  # type: ignore

    app.include_router(jarvis_ws.router)
    log.info("Jarvis-WebSocket-Router gemountet.")
except ImportError:
    log.info("Jarvis-Modul (app/jarvis/) noch nicht vorhanden — Mount uebersprungen.")
