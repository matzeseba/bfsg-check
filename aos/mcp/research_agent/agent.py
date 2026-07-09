"""Research- & Content-Agent (Port 8101, Team Beta-2).

Tools:
* ``research_topic(query)``       — Perplexity-Websuche (wenn Key), sonst
                                    Anthropic-Modellwissen (mit Disclaimer),
                                    sonst strukturierter Demo-Text.
* ``generate_linkedin_post(topic)`` — deutscher LinkedIn-Entwurf. Der System-
                                    Prompt verbietet UWG-riskante Formulierungen
                                    ('BFSG-konform', 'rechtssicher', 'garantiert',
                                    'TÜV', 'DEKRA') und Heilsversprechen.

Kein Auto-Publish: Ergebnisse werden nur zurückgegeben (Backend speichert als
Entwurf via POST /api/library).
"""

from __future__ import annotations

import os

import httpx

from common.ai import agent_model, anthropic_complete, has_anthropic
from common.mcp_server import ToolDef, create_mcp_app

VERSION = "1.0.0"

# --- Prompts ----------------------------------------------------------------

RESEARCH_SYSTEM = (
    "Du bist ein präziser Recherche-Assistent für BFSG-Fuchs, einen SaaS-Scanner "
    "für digitale Barrierefreiheit (WCAG/BFSG). Antworte sachlich auf Deutsch mit "
    "echten Umlauten, in klaren Absätzen. Nenne, wo möglich, konkrete Fakten, "
    "Normen und Zahlen. Vermeide Werbe-Superlative."
)

LINKEDIN_SYSTEM = (
    "Du bist Content-Stratege für BFSG-Fuchs, einen SaaS-Scanner für digitale "
    "Barrierefreiheit (WCAG/BFSG). Schreibe EINEN LinkedIn-Beitrag auf Deutsch mit "
    "echten Umlauten.\n"
    "Struktur strikt einhalten:\n"
    "1) Ein starker Hook (eine Zeile).\n"
    "2) Drei bis fünf kurze Absätze.\n"
    "3) Ein klarer Call-to-Action.\n"
    "4) Genau drei themenrelevante Hashtags in der letzten Zeile.\n\n"
    "STRENG VERBOTEN (UWG §5, Irreführung): die Wörter oder Versprechen "
    "'BFSG-konform', 'rechtssicher', 'garantiert', 'TÜV', 'DEKRA' sowie jegliche "
    "Heils-, Erfolgs- oder Ergebnisgarantie. Formuliere stattdessen sachlich, z. B. "
    "'automatisierte technische Analyse' oder 'WCAG-2.1-AA-Prüfung'. "
    "Kein reißerischer Ton, kein Clickbait."
)

# Deterministische Nachkontrolle des Modell-Outputs (Gürtel und Hosenträger).
FORBIDDEN_TERMS = ("bfsg-konform", "rechtssicher", "garantiert", "tüv", "tuev", "dekra")


def _contains_forbidden(text: str) -> bool:
    low = text.lower()
    return any(term in low for term in FORBIDDEN_TERMS)


# --- Perplexity -------------------------------------------------------------


async def _perplexity_search(query: str) -> str | None:
    """Websuche via Perplexity (Modell 'sonar'). ``None`` wenn kein Key/Fehler."""
    key = os.getenv("PERPLEXITY_API_KEY")
    if not key:
        return None
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                "https://api.perplexity.ai/chat/completions",
                headers={
                    "Authorization": f"Bearer {key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "sonar",
                    "messages": [
                        {"role": "system", "content": RESEARCH_SYSTEM},
                        {"role": "user", "content": query},
                    ],
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"].strip() or None
    except Exception:  # noqa: BLE001 - Fallback statt Absturz
        return None


# --- Tool-Handler -----------------------------------------------------------


async def research_topic(args: dict) -> dict:
    query = str(args["query"]).strip()

    text = await _perplexity_search(query)
    if text:
        return {"query": query, "summary": text, "source": "perplexity"}

    text = await anthropic_complete(RESEARCH_SYSTEM, query, max_tokens=1024)
    if text:
        text += (
            "\n\n(Hinweis: Diese Zusammenfassung stammt aus dem Modellwissen ohne "
            "Live-Websuche. Bitte aktuelle Fakten vor einer Veröffentlichung prüfen.)"
        )
        return {"query": query, "summary": text, "source": "anthropic"}

    demo = (
        f"Demo-Recherche zu „{query}“ (kein API-Key gesetzt):\n\n"
        "1) Kontext — worum geht es und warum ist es für barrierefreie Websites "
        "relevant?\n"
        "2) Rechtlicher Rahmen — BFSG (seit 28.06.2025) und die zugrunde liegende "
        "WCAG 2.1 AA.\n"
        "3) Typische technische Baustellen — Kontraste, Alternativtexte, Tastatur-"
        "Bedienbarkeit, Fokus-Reihenfolge.\n"
        "4) Handlungsempfehlung — automatisierte technische Analyse als erster "
        "Schritt, danach manuelle Prüfung.\n\n"
        "Setze PERPLEXITY_API_KEY oder ANTHROPIC_API_KEY, um echte Rechercheergebnisse "
        "zu erhalten."
    )
    return {"query": query, "summary": demo, "source": "demo"}


def _demo_linkedin_post(topic: str) -> str:
    return (
        f"Barrierefreiheit ist kein Nice-to-have mehr — {topic} betrifft praktisch "
        "jede Website.\n\n"
        "Viele Unternehmen unterschätzen, wie viele Menschen an Kontrast-, Tastatur- "
        "oder Screenreader-Hürden scheitern. Sichtbar wird das selten, spürbar fast "
        "immer.\n\n"
        "Eine automatisierte technische Analyse nach WCAG 2.1 AA zeigt in Minuten, wo "
        "die größten Hürden liegen: von fehlenden Alternativtexten bis zu unklarer "
        "Fokus-Reihenfolge.\n\n"
        "So wird aus einem abstrakten Thema eine konkrete To-do-Liste, die dein Team "
        "Schritt für Schritt abarbeiten kann.\n\n"
        "Wie barrierefrei ist deine Website wirklich? Mach den ersten Check und teile "
        "deine Erfahrung in den Kommentaren.\n\n"
        "#Barrierefreiheit #WCAG #DigitaleTeilhabe"
    )


async def generate_linkedin_post(args: dict) -> dict:
    topic = str(args["topic"]).strip()

    if has_anthropic():
        user = (
            f"Thema des Beitrags: {topic}\n\n"
            "Erstelle jetzt den LinkedIn-Beitrag exakt nach den Struktur- und "
            "Verbotsregeln."
        )
        text = await anthropic_complete(LINKEDIN_SYSTEM, user, max_tokens=900)
        if text and not _contains_forbidden(text):
            return {
                "topic": topic,
                "post": text,
                "model": agent_model(),
                "source": "anthropic",
                "note": "KI-Entwurf. Vor Veröffentlichung prüfen (kein Auto-Publish).",
            }
        # Bei verbotenen Formulierungen ODER leerem Ergebnis: sicherer Demo-Entwurf.

    return {
        "topic": topic,
        "post": _demo_linkedin_post(topic),
        "model": None,
        "source": "demo",
        "note": (
            "Demo-Entwurf (kein API-Key oder KI-Ausgabe verworfen). "
            "Vor Veröffentlichung anpassen — kein Auto-Publish."
        ),
    }


# --- App --------------------------------------------------------------------

TOOLS = [
    ToolDef(
        name="research_topic",
        description=(
            "Recherchiert ein Thema (Perplexity-Websuche wenn Key, sonst "
            "Anthropic-Modellwissen mit Disclaimer, sonst Demo)."
        ),
        input_schema={
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Recherche-Frage oder Stichwort.",
                }
            },
            "required": ["query"],
        },
        handler=research_topic,
    ),
    ToolDef(
        name="generate_linkedin_post",
        description=(
            "Erstellt einen deutschen LinkedIn-Entwurf (Hook, 3-5 Absätze, CTA, "
            "3 Hashtags). UWG-sicher, kein Auto-Publish."
        ),
        input_schema={
            "type": "object",
            "properties": {
                "topic": {
                    "type": "string",
                    "description": "Thema des LinkedIn-Beitrags.",
                }
            },
            "required": ["topic"],
        },
        handler=generate_linkedin_post,
    ),
]

app = create_mcp_app("research", VERSION, TOOLS)
