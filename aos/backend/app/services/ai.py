"""KI-Dienst — Antwortentwuerfe + Inbox-Priorisierung.

Provider-Abstraktion ueber ``llm_provider`` (AOS_LLM_PROVIDER, Default Anthropic).
Modell: AOS_MODEL_AGENTS. System-Prompts verbieten UWG-kritische Begriffe.
Ohne LLM-Key: deterministischer Heuristik-Fallback (model="heuristik").
"""

from __future__ import annotations

from typing import Any

from ..config import Settings
from . import llm_provider

# UWG-kritische Begriffe, die in generierten Texten NIE vorkommen duerfen.
FORBIDDEN_TERMS = ("bfsg-konform", "konform", "rechtssicher", "garantiert", "garantie", "tüv", "tuev", "dekra")

_REPLY_SYSTEM = (
    "Du bist die Kundenbetreuung von BFSG-Fuchs, einem Anbieter automatisierter "
    "technischer Barrierefreiheits-Analysen (WCAG 2.1 AA) fuer Websites. "
    "Schreibe eine professionelle, freundliche deutsche Antwort auf die Anfrage. "
    "Nutze echte Umlaute. Sei konkret und loesungsorientiert. "
    "VERBOTEN sind rechtliche Versprechen oder die Woerter "
    "'BFSG-konform', 'rechtssicher', 'garantiert', 'TUEV', 'DEKRA'. "
    "Sprich von 'automatisierter technischer Analyse' bzw. 'WCAG-2.1-AA-Audit'. "
    "Keine Grussformel-Platzhalter wie [Name] am Ende offen lassen — nutze "
    "'Ihr Team von BFSG-Fuchs'."
)

_HIGH_PRIORITY_KW = (
    "dringend", "sofort", "frist", "abmahnung", "anwalt", "rechnung", "fehler",
    "storno", "rückerstattung", "ruckerstattung", "bug", "funktioniert nicht",
    "problem", "beschwerde", "verklagen",
)
_MED_PRIORITY_KW = ("angebot", "preis", "profi", "upgrade", "kaufen", "bestellung", "demo")
_LOW_PRIORITY_KW = ("newsletter", "info", "frage", "hallo", "danke")


def _sanitize(text: str) -> str:
    """Erste Sicherung: milde UWG-Begriffe entschaerfen (Soft-Replace)."""
    replacements = {
        "BFSG-konform": "nach WCAG 2.1 AA geprueft",
        "bfsg-konform": "nach WCAG 2.1 AA geprueft",
        "rechtssicher": "technisch geprueft",
        "garantiert": "verlaesslich",
        "garantieren": "zusagen",
    }
    for bad, good in replacements.items():
        text = text.replace(bad, good)
    return text


def _contains_forbidden(text: str) -> bool:
    """Harte Nachkontrolle: enthaelt der Text noch einen verbotenen Begriff?

    Deckt insbesondere die hoechst-riskanten Siegel-/Absolut-Claims ab, die der
    Soft-Sanitizer NICHT ersetzt (TUEV/TÜV/DEKRA, eigenstaendiges 'konform',
    'Garantie'). Treffer -> Aufrufer faellt auf den sicheren Heuristik-Entwurf zurueck.
    """
    low = text.lower()
    return any(term in low for term in FORBIDDEN_TERMS)


# --------------------------------------------------------------------------- #
# Antwortentwurf
# --------------------------------------------------------------------------- #
def draft_reply(settings: Settings, item: dict[str, Any]) -> tuple[str, str]:
    """Erzeugt (Entwurfstext, Modellname) fuer eine Inbox-Anfrage."""
    if llm_provider.llm_enabled(settings):
        drafted = _draft_reply_live(settings, item)
        if drafted is not None:
            sanitized = _sanitize(drafted)
            # Harter Backstop: bleibt trotz Soft-Sanitizer ein verbotener Begriff
            # (TUEV/DEKRA/'konform'/Garantie) uebrig, wird NICHT der Modelltext
            # ausgeliefert, sondern der sichere Heuristik-Entwurf.
            if not _contains_forbidden(sanitized):
                return sanitized, settings.model_agents
    return _draft_reply_heuristic(item), "heuristik"


def _draft_reply_live(settings: Settings, item: dict[str, Any]) -> str | None:
    user = (
        f"Betreff: {item.get('subject','')}\n"
        f"Absender: {item.get('sender','')}\n"
        f"Kanal: {item.get('channel','email')}\n\n"
        f"Nachricht:\n{item.get('body','')}\n\n"
        "Formuliere den Antwortentwurf."
    )
    return llm_provider.chat_complete(
        settings, _REPLY_SYSTEM, user, max_tokens=800
    )


def _draft_reply_heuristic(item: dict[str, Any]) -> str:
    subject = item.get("subject", "Ihre Anfrage")
    sender = item.get("sender", "")
    anrede = f"Guten Tag{(' ' + sender.split('@')[0]) if '@' in sender else ''},"
    body_l = (item.get("body", "") + " " + subject).lower()

    if any(k in body_l for k in ("rechnung", "storno", "rückerstattung", "ruckerstattung")):
        kern = (
            "vielen Dank fuer Ihre Nachricht zum Thema Abrechnung. Wir pruefen Ihren "
            "Vorgang umgehend und melden uns mit einer konkreten Loesung. Bitte nennen "
            "Sie uns zur schnellen Zuordnung Ihre Bestell- oder Rechnungsnummer."
        )
    elif any(k in body_l for k in ("fehler", "funktioniert nicht", "bug", "problem")):
        kern = (
            "danke fuer den Hinweis. Wir schauen uns das geschilderte Verhalten direkt "
            "an. Damit wir es nachvollziehen koennen, senden Sie uns bitte die betroffene "
            "URL sowie den Zeitpunkt. Wir melden uns mit einem Zwischenstand."
        )
    elif any(k in body_l for k in ("angebot", "preis", "profi", "upgrade", "kaufen")):
        kern = (
            "vielen Dank fuer Ihr Interesse. Gern erlaeutern wir Ihnen, wie unsere "
            "automatisierte technische Analyse (WCAG 2.1 AA) Ihre Website prueft und "
            "welches Paket zu Ihrem Umfang passt. Nennen Sie uns gern Ihre Domain."
        )
    else:
        kern = (
            "vielen Dank fuer Ihre Nachricht. Wir haben Ihre Anfrage aufgenommen und "
            "melden uns zeitnah mit einer ausfuehrlichen Antwort. Bei Rueckfragen "
            "stehen wir Ihnen jederzeit zur Verfuegung."
        )

    return f"{anrede}\n\n{kern}\n\nFreundliche Gruesse\nIhr Team von BFSG-Fuchs"


# --------------------------------------------------------------------------- #
# Priorisierung
# --------------------------------------------------------------------------- #
def priorisiere_inbox(settings: Settings, item: dict[str, Any]) -> tuple[int, str]:
    """Liefert (priority 1-5, Begruendung). 1 = hoechste Dringlichkeit."""
    if llm_provider.llm_enabled(settings):
        live = _priorisiere_live(settings, item)
        if live is not None:
            return live
    return _priorisiere_heuristic(item)


def _priorisiere_live(settings: Settings, item: dict[str, Any]) -> tuple[int, str] | None:
    system = (
        "Du priorisierst Support-/Vertriebsanfragen fuer BFSG-Fuchs. Antworte NUR im "
        "Format 'PRIORITAET: <1-5> | GRUND: <kurze deutsche Begruendung>'. "
        "1 = sehr dringend (Fristen, Beschwerden, Zahlungsprobleme), "
        "5 = niedrig (allgemeine Info)."
    )
    user = f"Betreff: {item.get('subject','')}\nNachricht: {item.get('body','')}"
    text = llm_provider.chat_complete(settings, system, user, max_tokens=120)
    if text is None:
        return None
    return _parse_priority(text)


def _parse_priority(text: str) -> tuple[int, str]:
    prio = 3
    reason = text.strip()
    upper = text.upper()
    if "PRIORITAET" in upper or "PRIORITÄT" in upper:
        for token in text.replace("|", " ").split():
            if token.strip().isdigit():
                val = int(token.strip())
                if 1 <= val <= 5:
                    prio = val
                    break
    if "GRUND:" in text:
        reason = text.split("GRUND:", 1)[1].strip()
    return prio, (reason or "KI-Priorisierung")


def _priorisiere_heuristic(item: dict[str, Any]) -> tuple[int, str]:
    text = (item.get("subject", "") + " " + item.get("body", "")).lower()
    if any(k in text for k in _HIGH_PRIORITY_KW):
        return 1, "Enthaelt dringliche Signalwoerter (z. B. Frist/Beschwerde/Zahlung)."
    if any(k in text for k in _MED_PRIORITY_KW):
        return 2, "Vertriebsrelevant (Kauf-/Angebotsabsicht erkennbar)."
    if any(k in text for k in _LOW_PRIORITY_KW):
        return 4, "Allgemeine Anfrage ohne Dringlichkeit."
    return 3, "Standardanfrage, mittlere Prioritaet."
