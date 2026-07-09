"""Demo-Seeds (deutsch, realistisch, source="demo"). Nur wenn Tabellen leer sind."""

from __future__ import annotations

import json
from datetime import timedelta

from sqlmodel import Session, select

from .db import utcnow
from .models import AgentRun, InboxItem, LibraryAsset, Notification

# --------------------------------------------------------------------------- #
# Inbox: 8 realistische deutsche B2B-Anfragen (Barrierefreiheits-Kontext)
# --------------------------------------------------------------------------- #
_INBOX = [
    {
        "subject": "Angebot Profi-Paket fuer unseren Online-Shop",
        "sender": "einkauf@moebel-tannenhof.de",
        "channel": "email",
        "priority": 2,
        "priority_reason": "Konkrete Kaufabsicht (Profi-Paket) mit Mehrseiten-Bedarf.",
        "body": (
            "Guten Tag,\n\nwir betreiben einen Online-Shop mit rund 40 Seiten und moechten "
            "unsere Website auf Barrierefreiheit pruefen lassen. Koennen Sie uns ein Angebot "
            "fuer das Profi-Paket machen und den Ablauf kurz erlaeutern?\n\nBeste Gruesse\n"
            "M. Tannenhof"
        ),
        "hours_ago": 3,
    },
    {
        "subject": "Frist Behoerden-Website - dringend Unterstuetzung benoetigt",
        "sender": "it@stadtwerke-lingen.de",
        "channel": "email",
        "priority": 1,
        "priority_reason": "Zeitkritisch (Frist) und oeffentliche Stelle.",
        "body": (
            "Sehr geehrte Damen und Herren,\n\nwir muessen unsere Buergerportal-Seiten kurzfristig "
            "auf WCAG 2.1 AA pruefen. Es besteht eine Frist. Wie schnell koennen Sie einen "
            "Multi-Page-Scan liefern?\n\nMit freundlichen Gruessen\nAbteilung IT"
        ),
        "hours_ago": 6,
    },
    {
        "subject": "Rechnung 1041 - Frage zur Kleinunternehmer-Regelung",
        "sender": "buchhaltung@kanzlei-vogt.de",
        "channel": "email",
        "priority": 2,
        "priority_reason": "Abrechnungsthema, erwartet zeitnahe kaufmaennische Klaerung.",
        "body": (
            "Hallo,\n\nauf Ihrer Rechnung 1041 ist keine Umsatzsteuer ausgewiesen. Ist das "
            "korrekt (Kleinunternehmer)? Wir benoetigen die Info fuer unsere Buchhaltung.\n\n"
            "Danke und Gruss"
        ),
        "hours_ago": 20,
    },
    {
        "subject": "Scan-Report zeigt Fehler, die ich nicht nachvollziehen kann",
        "sender": "webmaster@tischlerei-ahrend.de",
        "channel": "support",
        "priority": 2,
        "priority_reason": "Support zu bezahltem Report; Kundenzufriedenheit betroffen.",
        "body": (
            "Guten Tag,\n\nim Report werden mehrere Kontrastfehler gemeldet. Auf meinem Monitor "
            "sehen die Farben aber gut aus. Koennen Sie mir erklaeren, wie die Bewertung "
            "zustande kommt?\n\nViele Gruesse"
        ),
        "hours_ago": 26,
    },
    {
        "subject": "Kurze Frage zu Cookie-Basis vs. Cookie-Profi",
        "sender": "info@yoga-studio-ol.de",
        "channel": "form",
        "priority": 3,
        "priority_reason": "Produktfrage ohne Dringlichkeit.",
        "body": (
            "Hallo, worin unterscheiden sich Cookie-Basis und Cookie-Profi? Wir haben eine "
            "kleine Website mit Kontaktformular. Was passt besser?"
        ),
        "hours_ago": 30,
    },
    {
        "subject": "Zusammenarbeit als Web-Agentur - Partnerkonditionen?",
        "sender": "kontakt@agentur-nordlicht.de",
        "channel": "email",
        "priority": 3,
        "priority_reason": "Potenzielle Partnerschaft, mittelfristig interessant.",
        "body": (
            "Sehr geehrtes Team,\n\nwir sind eine Web-Agentur und moechten Ihre Scans regelmaessig "
            "fuer Kundenprojekte einsetzen. Gibt es Partner- oder Mengenkonditionen?\n\n"
            "Freundliche Gruesse"
        ),
        "hours_ago": 40,
    },
    {
        "subject": "Bestaetigung Basis-Scan - alles bestens, danke!",
        "sender": "mail@cafe-morgentau.de",
        "channel": "email",
        "priority": 4,
        "priority_reason": "Positives Feedback, keine Handlung noetig.",
        "body": (
            "Hallo, der Report war verstaendlich und hat uns geholfen. Vielen Dank fuer die "
            "schnelle Bearbeitung!"
        ),
        "hours_ago": 48,
    },
    {
        "subject": "Newsletter-Anmeldung / Infos zu BFSG-Themen",
        "sender": "office@elektro-timmer.de",
        "channel": "form",
        "priority": 5,
        "priority_reason": "Reine Info-Anfrage, niedrigste Prioritaet.",
        "body": (
            "Guten Tag, koennen wir Ihren Newsletter zu Barrierefreiheit und BFSG erhalten? "
            "Wir moechten auf dem Laufenden bleiben."
        ),
        "hours_ago": 60,
    },
]

# --------------------------------------------------------------------------- #
# Library: 10 Assets (3 LinkedIn, 3 Case-Study-Gerueste, 4 Audit-Vorlagen)
# --------------------------------------------------------------------------- #
_LIBRARY = [
    {
        "title": "LinkedIn: Die fuenf haeufigsten WCAG-Fehler",
        "category": "linkedin",
        "tags": ["linkedin", "wcag", "hook"],
        "body_md": (
            "**Hook:** 90 % der Websites, die wir automatisiert pruefen, scheitern an denselben "
            "fuenf Punkten.\n\n"
            "1. Zu geringe Farbkontraste\n2. Fehlende Alternativtexte\n3. Formularfelder ohne "
            "Label\n4. Nicht per Tastatur bedienbare Menues\n5. Fehlende Seitenstruktur "
            "(Ueberschriften)\n\n"
            "**CTA:** Wir zeigen in einer automatisierten technischen Analyse (WCAG 2.1 AA), wo "
            "Ihre Seite steht. Kommentar 'Check' und wir melden uns."
        ),
    },
    {
        "title": "LinkedIn: Barrierefreiheit ist Reichweite",
        "category": "linkedin",
        "tags": ["linkedin", "awareness"],
        "body_md": (
            "**Hook:** Jede vierte Person in Deutschland lebt mit einer Einschraenkung. Ihre "
            "Website entscheidet, ob diese Menschen bei Ihnen kaufen koennen.\n\n"
            "Barrierefreiheit ist kein Nice-to-have, sondern erweitert messbar Ihre Zielgruppe. "
            "Und die technischen Grundlagen (WCAG 2.1 AA) sind pruefbar.\n\n"
            "**CTA:** Lust auf einen ehrlichen Blick auf Ihre Seite? Schreiben Sie uns."
        ),
    },
    {
        "title": "LinkedIn: Was ein WCAG-2.1-AA-Audit wirklich prueft",
        "category": "linkedin",
        "tags": ["linkedin", "audit", "wcag"],
        "body_md": (
            "**Hook:** 'Wir haben doch ein Cookie-Banner' - leider deckt das nur einen "
            "Bruchteil ab.\n\n"
            "Ein WCAG-2.1-AA-Audit betrachtet Kontrast, Tastaturbedienung, Struktur, "
            "Formulare und Medien. Unsere automatisierte Analyse liefert dazu eine "
            "priorisierte Fehlerliste.\n\n"
            "**CTA:** Neugierig auf Ihren Ist-Stand? Melden Sie sich."
        ),
    },
    {
        "title": "Case-Study-Geruest: Regionaler Online-Shop",
        "category": "case-study",
        "tags": ["case-study", "shop", "vorlage"],
        "body_md": (
            "## Ausgangslage\n<Branche, Seitenanzahl, Anlass der Pruefung>\n\n"
            "## Vorgehen\nAutomatisierte technische Analyse (WCAG 2.1 AA), Multi-Page-Scan, "
            "priorisierter Umsetzungsplan.\n\n"
            "## Ergebnis\n<Vorher/Nachher-Score, Zahl behobener Maengel, Aufwand>\n\n"
            "## Zitat\n<O-Ton der Kundin/des Kunden>"
        ),
    },
    {
        "title": "Case-Study-Geruest: Kommunale Einrichtung",
        "category": "case-study",
        "tags": ["case-study", "public", "vorlage"],
        "body_md": (
            "## Ausgangslage\n<Oeffentliche Stelle, Fristdruck, Umfang>\n\n"
            "## Vorgehen\nErstscan, Abstimmung der Prioritaeten, Nachpruefung.\n\n"
            "## Ergebnis\n<messbare Verbesserung der WCAG-2.1-AA-Kriterien>\n\n"
            "## Lernpunkt\n<uebertragbare Empfehlung>"
        ),
    },
    {
        "title": "Case-Study-Geruest: Handwerksbetrieb",
        "category": "case-study",
        "tags": ["case-study", "handwerk", "vorlage"],
        "body_md": (
            "## Ausgangslage\n<kleine Website, geringes Budget>\n\n"
            "## Vorgehen\nBasis-Scan, verstaendlicher Report, Umsetzung in Eigenregie.\n\n"
            "## Ergebnis\n<Score-Verbesserung, Zeitaufwand>\n\n"
            "## Fazit\n<warum sich der Aufwand gelohnt hat>"
        ),
    },
    {
        "title": "Audit-Vorlage: Kontraste (WCAG 1.4.3)",
        "category": "audit-template",
        "tags": ["audit", "kontrast", "wcag-1.4.3"],
        "body_md": (
            "### Pruefpunkt: Farbkontrast\n"
            "- Normaler Text: Mindestkontrast 4,5:1\n"
            "- Grosser Text (>= 24px bzw. 18,66px fett): 3:1\n"
            "- Bedienelemente/Grafiken: 3:1 (WCAG 1.4.11)\n\n"
            "### Pruefweg\nKontrast der Vordergrund-/Hintergrundfarben messen; Hover-/Fokus-Zustaende "
            "einbeziehen.\n\n### Befund\n<betroffene Elemente, gemessene Werte, Empfehlung>"
        ),
    },
    {
        "title": "Audit-Vorlage: Tastaturbedienung (WCAG 2.1.1)",
        "category": "audit-template",
        "tags": ["audit", "tastatur", "wcag-2.1.1"],
        "body_md": (
            "### Pruefpunkt: Bedienbarkeit per Tastatur\n"
            "- Alle interaktiven Elemente per Tab erreichbar\n"
            "- Sichtbarer Fokus (WCAG 2.4.7)\n"
            "- Keine Tastaturfallen\n\n"
            "### Pruefweg\nSeite ausschliesslich mit Tab/Shift+Tab/Enter/Leertaste bedienen.\n\n"
            "### Befund\n<nicht erreichbare Elemente, fehlender Fokus, Empfehlung>"
        ),
    },
    {
        "title": "Audit-Vorlage: Formulare & Labels (WCAG 3.3.2)",
        "category": "audit-template",
        "tags": ["audit", "formulare", "wcag-3.3.2"],
        "body_md": (
            "### Pruefpunkt: Beschriftungen und Anweisungen\n"
            "- Jedes Feld hat ein programmatisch verknuepftes Label\n"
            "- Pflichtfelder erkennbar\n"
            "- Fehlermeldungen verstaendlich (WCAG 3.3.1)\n\n"
            "### Pruefweg\nLabel-Verknuepfung im Markup pruefen; Fehlerfaelle durchspielen.\n\n"
            "### Befund\n<Felder ohne Label, unklare Fehler, Empfehlung>"
        ),
    },
    {
        "title": "Audit-Vorlage: Struktur & Ueberschriften (WCAG 1.3.1)",
        "category": "audit-template",
        "tags": ["audit", "struktur", "wcag-1.3.1"],
        "body_md": (
            "### Pruefpunkt: Info und Beziehungen\n"
            "- Logische Ueberschriften-Hierarchie (h1..h6)\n"
            "- Landmarks/Regionen ausgezeichnet\n"
            "- Listen und Tabellen semantisch korrekt\n\n"
            "### Pruefweg\nUeberschriftenbaum und Landmark-Struktur auswerten.\n\n"
            "### Befund\n<Bruchstellen in der Hierarchie, fehlende Semantik, Empfehlung>"
        ),
    },
]

_NOTIFICATIONS = [
    {"level": "lead", "title": "Neuer Lead: stadtwerke-lingen.de", "body": "Behoerden-Anfrage mit Frist - hohe Prioritaet.", "hours_ago": 6},
    {"level": "info", "title": "Tagesbriefing bereit", "body": "Das Morgen-Briefing wurde erstellt.", "hours_ago": 5},
    {"level": "warn", "title": "MCP Competitor nicht erreichbar", "body": "Beim letzten Lauf war der Competitor-Service offline.", "hours_ago": 2},
]

_AGENT_RUNS = [
    {
        "agent_key": "debrief",
        "ok": True,
        "summary": "Morgen-Briefing: 2 offene Leads, Umsatz 30 Tage stabil.",
        "output_md": (
            "# Morgen-Briefing\n\nGuten Morgen! Aktuell 2 heisse Leads offen, davon eine "
            "Behoerden-Anfrage mit Frist. Der 30-Tage-Umsatz liegt stabil im Zielbereich. "
            "Empfehlung: zuerst die Frist-Anfrage aus Lingen beantworten."
        ),
        "hours_ago": 5,
    },
    {
        "agent_key": "competitor",
        "ok": True,
        "summary": "5 Trends erkannt, u. a. steigende Nachfrage nach Multi-Page-Audits.",
        "output_md": (
            "# Trend-Zusammenfassung\n\n1. Steigende Nachfrage nach Multi-Page-Audits\n"
            "2. Mehr Fragen zur Barrierefreiheitserklaerung\n3. Cookie-Themen bleiben relevant\n"
            "4. Interesse an verstaendlichen Reports\n5. Regionale Betriebe holen auf\n\n"
            "Konter-Strategie je Trend: klare, sachliche Kommunikation ohne Rechtsversprechen."
        ),
        "hours_ago": 22,
    },
]


def seed_if_empty(session: Session) -> None:
    """Legt Demo-Daten an, sofern die jeweiligen Tabellen leer sind."""
    now = utcnow()

    if not session.exec(select(InboxItem)).first():
        for entry in _INBOX:
            ts = now - timedelta(hours=entry["hours_ago"])
            body = entry["body"]
            session.add(
                InboxItem(
                    subject=entry["subject"],
                    sender=entry["sender"],
                    channel=entry["channel"],
                    body=body,
                    preview=_preview(body),
                    priority=entry["priority"],
                    priority_reason=entry["priority_reason"],
                    status="open",
                    source="demo",
                    created_at=ts,
                    updated_at=ts,
                )
            )

    if not session.exec(select(LibraryAsset)).first():
        for entry in _LIBRARY:
            session.add(
                LibraryAsset(
                    title=entry["title"],
                    category=entry["category"],
                    tags_json=json.dumps(entry["tags"], ensure_ascii=False),
                    body_md=entry["body_md"],
                    source="demo",
                    created_at=now,
                    updated_at=now,
                )
            )

    if not session.exec(select(Notification)).first():
        for entry in _NOTIFICATIONS:
            session.add(
                Notification(
                    level=entry["level"],
                    title=entry["title"],
                    body=entry["body"],
                    read=False,
                    ts=now - timedelta(hours=entry["hours_ago"]),
                )
            )

    if not session.exec(select(AgentRun)).first():
        for entry in _AGENT_RUNS:
            ts = now - timedelta(hours=entry["hours_ago"])
            session.add(
                AgentRun(
                    agent_key=entry["agent_key"],
                    started_at=ts,
                    finished_at=ts + timedelta(seconds=8),
                    ok=entry["ok"],
                    summary=entry["summary"],
                    output_md=entry["output_md"],
                    trigger="schedule",
                )
            )

    session.commit()


def _preview(body: str, limit: int = 140) -> str:
    flat = " ".join(body.split())
    return flat[:limit] + ("..." if len(flat) > limit else "")
