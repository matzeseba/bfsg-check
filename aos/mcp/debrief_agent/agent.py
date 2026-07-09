"""Daily-Debrief-Agent (Port 8104, Team Beta-2).

Tool ``daily_debrief(kpis, zeitpunkt)`` formuliert ein kurzes, vorlesbares
deutsches Briefing (max. 150 Wörter) und priorisiert 3 Aufgaben.
``zeitpunkt`` ist 'morgens' oder 'abends'. Ohne ANTHROPIC_API_KEY wird ein
Template aus den KPI-Zahlen erzeugt (ebenfalls vorlesbar, ohne Tabellen/
Sonderzeichen).
"""

from __future__ import annotations

import json

from common.ai import anthropic_complete, has_anthropic
from common.mcp_server import ToolDef, create_mcp_app

VERSION = "1.0.0"

VALID_ZEITPUNKT = ("morgens", "abends")


def _num(kpis: dict, key: str, default: int = 0) -> int:
    value = kpis.get(key, default)
    if isinstance(value, bool):
        return default
    if isinstance(value, (int, float)):
        return int(value)
    return default


def _priorities(kpis: dict, zeitpunkt: str) -> list[str]:
    """Leitet bis zu 3 priorisierte Aufgaben aus den KPIs ab."""
    tasks: list[tuple[int, str]] = []

    hot = _num(kpis, "hot_leads")
    leads_today = _num(kpis, "leads_today")
    open_inbox = _num(kpis, "open_inbox")
    services_ok = _num(kpis, "services_ok")
    services_total = _num(kpis, "services_total")
    notifications = _num(kpis, "notifications_unread")

    if services_total and services_ok < services_total:
        down = services_total - services_ok
        tasks.append((100, f"Zuerst {down} gestörte Dienste prüfen und stabilisieren"))
    if hot > 0:
        tasks.append((90, f"{hot} heiße Leads heute persönlich kontaktieren"))
    if open_inbox > 0:
        tasks.append((70, f"{open_inbox} offene Anfragen in der Inbox beantworten"))
    if notifications > 0:
        tasks.append((50, f"{notifications} ungelesene Hinweise sichten"))
    if leads_today > 0 and hot == 0:
        tasks.append((40, f"{leads_today} neue Leads bewerten und einsortieren"))

    tasks.sort(key=lambda item: item[0], reverse=True)
    top = [text for _, text in tasks[:3]]

    if not top:
        if zeitpunkt == "morgens":
            top = ["Tagesziele festlegen", "Content-Pipeline prüfen", "Ads-Budget checken"]
        else:
            top = ["Offene Punkte notieren", "Morgen vorbereiten", "Zahlen kurz sichten"]
    return top


def _template_debrief(kpis: dict, zeitpunkt: str) -> str:
    revenue = _num(kpis, "revenue_30d_eur")
    leads_today = _num(kpis, "leads_today")
    hot = _num(kpis, "hot_leads")
    open_inbox = _num(kpis, "open_inbox")
    services_ok = _num(kpis, "services_ok")
    services_total = _num(kpis, "services_total")

    if zeitpunkt == "morgens":
        opener = "Guten Morgen. Hier dein Lagebild für heute."
    else:
        opener = "Guten Abend. Hier die Zusammenfassung des Tages."

    status = []
    status.append(f"Der Umsatz der letzten 30 Tage liegt bei {revenue} Euro.")
    if services_total:
        status.append(
            f"Von {services_total} Diensten laufen {services_ok} stabil."
        )
    status.append(
        f"Es gibt {leads_today} neue Leads, davon {hot} heiße, und "
        f"{open_inbox} offene Anfragen."
    )

    tasks = _priorities(kpis, zeitpunkt)
    task_line = "Deine drei wichtigsten Aufgaben: " + "; ".join(
        f"{i}. {t}" for i, t in enumerate(tasks, start=1)
    ) + "."

    if zeitpunkt == "morgens":
        closer = "Konzentrier dich auf das Wichtigste zuerst. Auf einen guten Tag."
    else:
        closer = "Ein solider Tag. Morgen geht es fokussiert weiter."

    return " ".join([opener, *status, task_line, closer])


DEBRIEF_SYSTEM = (
    "Du bist Jarvis, das Betriebssystem des BFSG-Fuchs-Dashboards. Sprich den "
    "Owner direkt an. Erstelle ein {zeitpunkt}es Briefing auf Deutsch mit echten "
    "Umlauten. Regeln: höchstens 150 Wörter, gut vorlesbar (fließende Sätze, "
    "KEINE Tabellen, keine Aufzählungszeichen, keine Sonderzeichen oder Emojis). "
    "Nenne die wichtigsten Kennzahlen in Worten und priorisiere klar drei konkrete "
    "Aufgaben. Sachlich, keine Werbeversprechen."
)


async def daily_debrief(args: dict) -> dict:
    kpis = args.get("kpis") or {}
    if not isinstance(kpis, dict):
        kpis = {}
    zeitpunkt = str(args.get("zeitpunkt") or "morgens").lower().strip()
    if zeitpunkt not in VALID_ZEITPUNKT:
        zeitpunkt = "morgens"

    if has_anthropic():
        system = DEBRIEF_SYSTEM.format(zeitpunkt=zeitpunkt)
        user = (
            f"Tageszeit: {zeitpunkt}\nKPIs (JSON):\n"
            + json.dumps(kpis, ensure_ascii=False)
        )
        text = await anthropic_complete(system, user, max_tokens=400)
        if text:
            return {"briefing": text, "zeitpunkt": zeitpunkt, "source": "anthropic"}

    return {
        "briefing": _template_debrief(kpis, zeitpunkt),
        "zeitpunkt": zeitpunkt,
        "source": "demo",
    }


TOOLS = [
    ToolDef(
        name="daily_debrief",
        description=(
            "Erstellt ein kurzes, vorlesbares deutsches Tages-Briefing (morgens/"
            "abends, max. 150 Wörter) und priorisiert 3 Aufgaben aus den KPIs."
        ),
        input_schema={
            "type": "object",
            "properties": {
                "kpis": {
                    "type": "object",
                    "description": "KPI-Kennzahlen (Umsatz, Leads, Inbox, Dienste ...).",
                },
                "zeitpunkt": {
                    "type": "string",
                    "description": "'morgens' oder 'abends'.",
                },
            },
            "required": ["kpis"],
        },
        handler=daily_debrief,
    ),
]

app = create_mcp_app("debrief", VERSION, TOOLS)
