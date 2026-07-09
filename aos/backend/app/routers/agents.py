"""Agents-Router (ARCHITECTURE.md Paragraph 4): Liste, manueller Run, Ergebnisse."""

from __future__ import annotations

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from sqlmodel import Session, select

from ..auth import require_auth
from ..db import get_session
from ..models import AgentRun
from ..services import scheduler

router = APIRouter(
    prefix="/api/agents", tags=["agents"], dependencies=[Depends(require_auth)]
)


def _last_run(session: Session, key: str) -> dict | None:
    stmt = select(AgentRun).where(AgentRun.agent_key == key)
    runs = session.exec(stmt).all()
    if not runs:
        return None
    runs.sort(key=lambda r: r.started_at, reverse=True)
    latest = runs[0]
    return {
        "ts": latest.started_at.isoformat(),
        "ok": latest.ok,
        "summary": latest.summary,
    }


@router.get("")
def list_agents(session: Session = Depends(get_session)) -> dict:
    out = []
    for key, meta in scheduler.AGENT_META.items():
        out.append(
            {
                "key": key,
                "name": meta["name"],
                "description": meta["description"],
                "schedule_human": meta["schedule_human"],
                "last_run": _last_run(session, key),
                "enabled": True,
            }
        )
    return {"agents": out}


@router.post("/{key}/run")
def run_agent(
    key: str,
    background: BackgroundTasks,
    session: Session = Depends(get_session),
) -> JSONResponse:
    if key not in scheduler.AGENT_META:
        raise HTTPException(status_code=404, detail="Unbekannter Agent")
    run = scheduler.create_run(session, key, trigger="manual")
    background.add_task(scheduler.execute_run, run.id, key)
    return JSONResponse(status_code=202, content={"run_id": run.id})


@router.get("/{key}/results")
def agent_results(
    key: str,
    session: Session = Depends(get_session),
    limit: int = Query(default=20, ge=1, le=100),
) -> dict:
    if key not in scheduler.AGENT_META:
        raise HTTPException(status_code=404, detail="Unbekannter Agent")
    stmt = select(AgentRun).where(AgentRun.agent_key == key)
    runs = session.exec(stmt).all()
    runs.sort(key=lambda r: r.started_at, reverse=True)
    out = []
    for r in runs[:limit]:
        out.append(
            {
                "id": r.id,
                "started_at": r.started_at.isoformat(),
                "finished_at": r.finished_at.isoformat() if r.finished_at else None,
                "ok": r.ok,
                "summary": r.summary,
                "output_md": r.output_md,
            }
        )
    return {"runs": out}
