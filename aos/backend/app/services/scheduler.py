"""Scheduler + Agenten-Orchestrierung (ARCHITECTURE.md Paragraph 8).

APScheduler (BackgroundScheduler, TZ Europe/Berlin). Agent-Runs rufen die MCP-Services
per JSON-RPC 2.0 (tools/call) auf. Ergebnisse landen in agent_runs + notifications;
leadscore-Treffer >= 80 und debrief zusaetzlich als Brevo-Mail an ADMIN_EMAIL.
research-Ergebnis wird als library_asset (category=linkedin, source='agent') gespeichert.
"""

from __future__ import annotations

import json
import logging
from datetime import timedelta
from typing import Any

import httpx
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from sqlmodel import Session, select

from ..adapters import brevo_adapter, scanner_adapter, stripe_adapter
from ..config import Settings, get_settings
from ..db import session_scope, utcnow
from ..models import AgentRun, HealthCheck, InboxItem, LibraryAsset, Notification
from . import healthcheck

log = logging.getLogger("aos.scheduler")

AGENT_META = {
    "research": {
        "name": "Research & Content",
        "description": "Recherchiert Barrierefreiheits-Trends und erstellt einen LinkedIn-Post-Entwurf.",
        "schedule_human": "Montags 08:00",
        "tool": "generate_linkedin_post",
    },
    "leadscore": {
        "name": "Lead-Scoring",
        "description": "Bewertet eingehende Scans/Bestellungen nach Prioritaet (1-100).",
        "schedule_human": "Alle 30 Minuten",
        "tool": "score_leads",
    },
    "competitor": {
        "name": "Wettbewerb & Trends",
        "description": "Fasst oeffentliche RSS-/News-Quellen zu Trends und Konter-Strategien zusammen.",
        "schedule_human": "Taeglich 07:30",
        "tool": "trend_summary",
    },
    "debrief": {
        "name": "Daily Debriefing",
        "description": "Formuliert ein deutsches Morgen-/Abend-Briefing aus den Tages-KPIs.",
        "schedule_human": "Taeglich 08:00 und 18:00",
        "tool": "daily_debrief",
    },
}

_scheduler: BackgroundScheduler | None = None


# --------------------------------------------------------------------------- #
# JSON-RPC-Aufruf an MCP-Service
# --------------------------------------------------------------------------- #
def mcp_call(
    settings: Settings, key: str, tool: str, arguments: dict[str, Any]
) -> dict[str, Any]:
    """JSON-RPC 2.0 tools/call. Rueckgabe: {ok, result|error}."""
    url = settings.mcp_url(key).rstrip("/") + "/"
    body = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {"name": tool, "arguments": arguments},
    }
    try:
        with httpx.Client(timeout=30.0) as client:
            resp = client.post(url, json=body)
            resp.raise_for_status()
            data = resp.json()
    except (httpx.HTTPError, ValueError) as exc:
        return {"ok": False, "error": f"MCP nicht erreichbar ({type(exc).__name__})"}
    if "error" in data:
        return {"ok": False, "error": str(data["error"])}
    return {"ok": True, "result": data.get("result", {})}


def _result_markdown(result: Any) -> str:
    """Extrahiert Markdown/Text aus einer MCP tools/call-Antwort (flexibel)."""
    if isinstance(result, dict):
        content = result.get("content")
        if isinstance(content, list):
            texts = [
                c.get("text", "")
                for c in content
                if isinstance(c, dict) and c.get("type") == "text"
            ]
            if texts:
                return "\n".join(t for t in texts if t).strip()
        for field in ("output_md", "markdown", "summary", "text"):
            if isinstance(result.get(field), str):
                return result[field].strip()
        return json.dumps(result, ensure_ascii=False, indent=2)
    if isinstance(result, str):
        return result.strip()
    return json.dumps(result, ensure_ascii=False)


def _max_lead_score(result: Any) -> tuple[int, list[dict[str, Any]]]:
    """Sucht die hoechste Lead-Bewertung + Liste in einer leadscore-Antwort."""
    leads: list[dict[str, Any]] = []
    if isinstance(result, dict):
        for field in ("leads", "results", "scores"):
            if isinstance(result.get(field), list):
                leads = result[field]
                break
        # MCP-content mit eingebettetem JSON
        if not leads and isinstance(result.get("content"), list):
            for c in result["content"]:
                if isinstance(c, dict) and c.get("type") == "text":
                    try:
                        parsed = json.loads(c.get("text", ""))
                        if isinstance(parsed, dict) and isinstance(parsed.get("leads"), list):
                            leads = parsed["leads"]
                            break
                    except (ValueError, json.JSONDecodeError):
                        continue
    top = 0
    for lead in leads:
        if isinstance(lead, dict):
            # Der leadscore-Agent liefert das Feld 'lead_score' (Fallback 'score'
            # nur fuer aeltere/abweichende Antworten).
            raw = lead.get("lead_score", lead.get("score", 0))
            try:
                top = max(top, int(raw))
            except (TypeError, ValueError):
                continue
    return top, leads


# --------------------------------------------------------------------------- #
# Argument-Aufbau (Backend liefert Daten in den Call)
# --------------------------------------------------------------------------- #
def _build_arguments(session: Session, settings: Settings, key: str) -> dict[str, Any]:
    if key == "leadscore":
        return {"leads": _collect_lead_candidates(session, settings)}
    if key == "debrief":
        return {"kpis": _collect_kpis(session, settings)}
    if key == "research":
        return {"topic": _rotating_research_topic()}
    return {}


def _collect_lead_candidates(session: Session, settings: Settings) -> list[dict[str, Any]]:
    """Bestell-/Scan-Kontext fuer das Scoring (aus Scanner-Adapter + Inbox).

    Rueckgabe: FLACHE Liste von Lead-Dicts exakt in der vom leadscore-Agent
    erwarteten Form ({domain, score_a11y, issues_critical, issues_total, package}
    — ARCHITECTURE.md Paragraph 8). Der aggregierte A11y-Durchschnitt aus den
    Scanner-Admin-Statistiken dient als grober Score-Proxy, solange keine
    domainspezifischen Scan-Daten vorliegen.
    """
    scan = scanner_adapter.health(settings)
    admin = scan.get("admin", {}) if isinstance(scan, dict) else {}
    avg_score = admin.get("avg_score")
    candidates: list[dict[str, Any]] = []
    open_items = session.exec(
        select(InboxItem).where(InboxItem.status == "open")
    ).all()
    for item in open_items[:20]:
        domain = item.sender.split("@")[-1] if "@" in item.sender else item.sender
        lead: dict[str, Any] = {
            "domain": domain,
            "package": "",
            "issues_critical": 0,
            "issues_total": 0,
        }
        if isinstance(avg_score, (int, float)) and not isinstance(avg_score, bool):
            lead["score_a11y"] = avg_score
        candidates.append(lead)
    return candidates


def _collect_kpis(session: Session, settings: Settings) -> dict[str, Any]:
    fin = stripe_adapter.get_summary(session, settings)
    open_inbox = len(
        session.exec(select(InboxItem).where(InboxItem.status == "open")).all()
    )
    day_start = utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    leads_today = len(
        session.exec(
            select(Notification)
            .where(Notification.level == "lead")
            .where(Notification.ts >= day_start)
        ).all()
    )
    runs_today = len(
        session.exec(
            select(AgentRun).where(AgentRun.started_at >= day_start)
        ).all()
    )
    return {
        "revenue_30d_eur": fin["gross_30d"],
        "open_inbox": open_inbox,
        "leads_today": leads_today,
        "agent_runs_today": runs_today,
        "mrr": fin["mrr"],
    }


def _rotating_research_topic() -> str:
    topics = [
        "BFSG-Pflichten fuer kleine Online-Shops ab 2025",
        "Die fuenf haeufigsten WCAG-2.1-AA-Fehler auf deutschen Websites",
        "Barrierefreie Formulare: praktische Umsetzung",
        "Kontrast und Fokus: schnelle Gewinne fuer die Tastaturbedienung",
    ]
    return topics[utcnow().isocalendar().week % len(topics)]


# --------------------------------------------------------------------------- #
# Run-Lebenszyklus
# --------------------------------------------------------------------------- #
def create_run(session: Session, key: str, trigger: str) -> AgentRun:
    run = AgentRun(agent_key=key, trigger=trigger, started_at=utcnow())
    session.add(run)
    session.commit()
    session.refresh(run)
    return run


def execute_run(run_id: int, key: str) -> None:
    """Fuehrt den MCP-Aufruf aus und schreibt Ergebnis + Nebenwirkungen."""
    settings = get_settings()
    with session_scope() as session:
        run = session.get(AgentRun, run_id)
        if run is None:
            return
        tool = AGENT_META[key]["tool"]
        arguments = _build_arguments(session, settings, key)
        outcome = mcp_call(settings, key, tool, arguments)

        run.finished_at = utcnow()
        if not outcome["ok"]:
            run.ok = False
            run.summary = f"Fehlgeschlagen: {outcome['error']}"
            run.output_md = (
                f"# {AGENT_META[key]['name']}\n\n"
                f"Der Agent konnte nicht ausgefuehrt werden.\n\n> {outcome['error']}"
            )
            session.add(run)
            session.add(
                Notification(
                    level="warn",
                    title=f"Agent '{AGENT_META[key]['name']}' fehlgeschlagen",
                    body=outcome["error"],
                )
            )
            return

        result = outcome["result"]
        markdown = _result_markdown(result)
        run.ok = True
        run.output_md = markdown
        run.summary = _first_line(markdown)
        session.add(run)

        _apply_side_effects(session, settings, key, result, markdown)


def _first_line(text: str, limit: int = 140) -> str:
    line = next((ln.strip("# ").strip() for ln in text.splitlines() if ln.strip()), "")
    return line[:limit] if line else "Abgeschlossen"


def _apply_side_effects(
    session: Session,
    settings: Settings,
    key: str,
    result: Any,
    markdown: str,
) -> None:
    if key == "research":
        session.add(
            LibraryAsset(
                title=f"LinkedIn-Entwurf: {_rotating_research_topic()}",
                category="linkedin",
                tags_json=json.dumps(["linkedin", "entwurf", "barrierefreiheit"]),
                body_md=markdown,
                source="agent",
            )
        )
        session.add(
            Notification(
                level="info",
                title="Neuer LinkedIn-Entwurf verfuegbar",
                body="Der Research-Agent hat einen Post-Entwurf in der Bibliothek gespeichert.",
            )
        )
        return

    if key == "leadscore":
        top, leads = _max_lead_score(result)
        level = "lead" if top >= 80 else "info"
        title = (
            f"Heisser Lead erkannt (Score {top})"
            if top >= 80
            else f"Lead-Scoring aktualisiert ({len(leads)} bewertet)"
        )
        session.add(Notification(level=level, title=title, body=_first_line(markdown)))
        if top >= 80 and settings.admin_email:
            brevo_adapter.send_transactional(
                settings,
                settings.admin_email,
                subject=f"[AOS] Heisser Lead (Score {top})",
                html=f"<h2>Heisser Lead erkannt</h2><p>Score: {top}</p><pre>{markdown}</pre>",
                text=f"Heisser Lead erkannt. Score {top}.\n\n{markdown}",
            )
        return

    if key == "competitor":
        session.add(
            Notification(
                level="info",
                title="Trend-Zusammenfassung aktualisiert",
                body=_first_line(markdown),
            )
        )
        return

    if key == "debrief":
        session.add(
            Notification(
                level="info",
                title="Tagesbriefing bereit",
                body=_first_line(markdown),
            )
        )
        if settings.admin_email:
            brevo_adapter.send_transactional(
                settings,
                settings.admin_email,
                subject="[AOS] Tagesbriefing",
                html=f"<h2>Tagesbriefing</h2><pre>{markdown}</pre>",
                text=markdown,
            )


def trigger_agent(key: str, trigger: str = "schedule") -> int:
    """Erzeugt einen Run und fuehrt ihn aus (Scheduler-Pfad). Gibt run_id zurueck."""
    with session_scope() as session:
        run = create_run(session, key, trigger)
        run_id = run.id
    execute_run(run_id, key)  # type: ignore[arg-type]
    return run_id  # type: ignore[return-value]


# --------------------------------------------------------------------------- #
# Scheduler-Jobs
# --------------------------------------------------------------------------- #
def job_healthchecks() -> None:
    settings = get_settings()
    results = healthcheck.check_all(settings)
    with session_scope() as session:
        healthcheck.record_checks(session, results)


def job_cleanup() -> None:
    cutoff = utcnow() - timedelta(days=7)
    with session_scope() as session:
        old = session.exec(select(HealthCheck).where(HealthCheck.ts < cutoff)).all()
        for row in old:
            session.delete(row)


def _job(key: str):
    def runner() -> None:
        try:
            trigger_agent(key, "schedule")
        except Exception:  # noqa: BLE001 - Scheduler-Job darf nie hart crashen
            log.exception("Agent-Job '%s' fehlgeschlagen", key)

    return runner


# --------------------------------------------------------------------------- #
# Aufbau / Start
# --------------------------------------------------------------------------- #
def build_scheduler(settings: Settings) -> BackgroundScheduler:
    sched = BackgroundScheduler(timezone=settings.tz)
    sched.add_job(job_healthchecks, IntervalTrigger(seconds=60), id="healthchecks",
                  max_instances=1, coalesce=True)
    sched.add_job(_job("leadscore"), IntervalTrigger(minutes=30), id="leadscore",
                  max_instances=1, coalesce=True)
    sched.add_job(_job("competitor"), CronTrigger(hour=7, minute=30), id="competitor")
    sched.add_job(_job("research"), CronTrigger(day_of_week="mon", hour=8, minute=0),
                  id="research")
    sched.add_job(_job("debrief"), CronTrigger(hour="8,18", minute=0), id="debrief")
    sched.add_job(job_cleanup, CronTrigger(hour=3, minute=0), id="cleanup")
    return sched


def start_scheduler(settings: Settings) -> BackgroundScheduler | None:
    global _scheduler
    if settings.disable_scheduler:
        log.info("Scheduler deaktiviert (AOS_DISABLE_SCHEDULER).")
        return None
    if _scheduler is not None:
        return _scheduler
    _scheduler = build_scheduler(settings)
    _scheduler.start()
    log.info("AOS-Scheduler gestartet (TZ=%s).", settings.tz)
    return _scheduler


def shutdown_scheduler() -> None:
    global _scheduler
    if _scheduler is not None:
        _scheduler.shutdown(wait=False)
        _scheduler = None
