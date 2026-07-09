"""Jarvis-Tools (ARCHITECTURE.md Paragraph 5).

Tool-Definitionen fuer die Anthropic-Tool-Use-Schnittstelle + serverseitige
Ausfuehrung als DIREKTE Funktionsaufrufe in die bestehenden Router-/Service-
Funktionen (kein HTTP-Loopback).

Lese-Tools (get_dashboard_summary/get_health/get_finance_summary/search_library/
draft_inbox_reply) laufen gegen eine frische DB-Session und liefern JSON-Text
zurueck, den das Modell im naechsten Loop-Schritt verarbeitet.

Steuer-Tools (navigate, run_agent) liefern zusaetzlich eine ui_action an den
Client. `run_agent` startet den Agenten NICHT selbst — der Client fuehrt beim
Empfang der ui_action den POST /api/agents/{key}/run aus (verhindert Doppellauf).
"""

from __future__ import annotations

import json
from typing import Any, Optional

from ..config import Settings
from ..db import session_scope
from ..routers import dashboard, finance, health, inbox, library

# Bekannte Routen des Dashboards (fuer navigate-Tool).
ROUTES = ("/", "/inbox", "/library", "/health", "/finance", "/agents")
# Agenten-Schluessel (fuer run_agent-Tool).
AGENT_KEYS = ("research", "leadscore", "competitor", "debrief")

# --------------------------------------------------------------------------- #
# Tool-Registry (Anthropic tool-use-Schema)
# --------------------------------------------------------------------------- #
TOOLS: list[dict[str, Any]] = [
    {
        "name": "navigate",
        "description": (
            "Wechselt im Dashboard zu einer Route. Nutze dies, wenn der Nutzer "
            "ein Modul oeffnen/anzeigen moechte."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "route": {
                    "type": "string",
                    "enum": list(ROUTES),
                    "description": "Zielroute im Dashboard.",
                }
            },
            "required": ["route"],
        },
    },
    {
        "name": "get_dashboard_summary",
        "description": "Liefert die aggregierten Startseiten-KPIs (Umsatz 30 Tage, offene Anfragen, Leads heute, Service-Status).",
        "input_schema": {"type": "object", "properties": {}},
    },
    {
        "name": "get_health",
        "description": "Liefert den aktuellen Status aller ueberwachten Dienste (Scan-Engine, Landing, Admin, MCP-Agenten).",
        "input_schema": {"type": "object", "properties": {}},
    },
    {
        "name": "get_finance_summary",
        "description": "Liefert die Finanz-Uebersicht (Brutto/Netto 30 Tage, MRR, aktive Abos, Paket-Aufteilung).",
        "input_schema": {"type": "object", "properties": {}},
    },
    {
        "name": "search_library",
        "description": "Durchsucht die Content-Bibliothek (LinkedIn-Entwuerfe, Fallstudien, Audit-Vorlagen) nach einem Stichwort.",
        "input_schema": {
            "type": "object",
            "properties": {
                "q": {"type": "string", "description": "Suchbegriff."}
            },
            "required": ["q"],
        },
    },
    {
        "name": "run_agent",
        "description": (
            "Startet einen KI-Agenten. Verfuegbare Schluessel: research (Content), "
            "leadscore (Lead-Bewertung), competitor (Trends), debrief (Tagesbriefing)."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "key": {
                    "type": "string",
                    "enum": list(AGENT_KEYS),
                    "description": "Agenten-Schluessel.",
                }
            },
            "required": ["key"],
        },
    },
    {
        "name": "draft_inbox_reply",
        "description": "Erstellt einen KI-Antwortentwurf fuer eine Anfrage im Posteingang (per Anfrage-ID).",
        "input_schema": {
            "type": "object",
            "properties": {
                "inbox_id": {
                    "type": "integer",
                    "description": "ID der Anfrage im Posteingang.",
                }
            },
            "required": ["inbox_id"],
        },
    },
]

TOOL_NAMES: frozenset[str] = frozenset(t["name"] for t in TOOLS)


def _json(data: Any) -> str:
    return json.dumps(data, ensure_ascii=False)


def _navigate_action(route: str) -> dict[str, Any]:
    return {"type": "ui_action", "action": "navigate", "params": {"route": route}}


def _run_agent_action(key: str) -> dict[str, Any]:
    return {"type": "ui_action", "action": "run_agent", "params": {"key": key}}


def execute_tool(
    name: str, tool_input: dict[str, Any], settings: Settings
) -> tuple[str, Optional[dict[str, Any]]]:
    """Fuehrt ein Tool aus.

    Rueckgabe: (Ergebnis-Text fuer das Modell, optionale ui_action fuer den Client).
    Diese Funktion ist synchron (DB-Zugriff) und wird vom Brain via to_thread
    aufgerufen, damit der Event-Loop (u. a. cancel) frei bleibt.
    """
    if name == "navigate":
        route = tool_input.get("route", "/")
        if route not in ROUTES:
            route = "/"
        return f"Navigiere zu {route}.", _navigate_action(route)

    if name == "run_agent":
        key = tool_input.get("key", "")
        if key not in AGENT_KEYS:
            return f"Unbekannter Agent: {key!r}.", None
        return f"Ich starte den Agenten '{key}'.", _run_agent_action(key)

    # Ab hier: Lese-/Aktions-Tools mit DB-Session.
    try:
        with session_scope() as session:
            if name == "get_dashboard_summary":
                return _json(dashboard.summary(session=session, settings=settings)), None
            if name == "get_health":
                return _json(health.services(settings=settings)), None
            if name == "get_finance_summary":
                return _json(finance.summary(session=session, settings=settings)), None
            if name == "search_library":
                q = tool_input.get("q") or None
                return (
                    _json(library.list_library(session=session, q=q, category=None)),
                    None,
                )
            if name == "draft_inbox_reply":
                inbox_id = int(tool_input.get("inbox_id", 0))
                data = inbox.draft_inbox(
                    item_id=inbox_id, session=session, settings=settings
                )
                return _json(data), None
    except Exception as exc:  # noqa: BLE001 - Tool-Fehler an das Modell zurueckmelden
        return _json({"fehler": f"{type(exc).__name__}: {exc}"}), None

    return _json({"fehler": f"Unbekanntes Tool: {name}"}), None
