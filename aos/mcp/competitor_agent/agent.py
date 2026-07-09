"""Competitor- & Trend-Agent (Port 8103, Team Beta-2).

Tool ``trend_summary()`` liest ausschließlich ÖFFENTLICHE RSS-/News-Feeds,
filtert auf Barrierefreiheits-Stichworte und fasst die Lage zusammen (mit Key
via Anthropic als 5 Trends + je Konter-Strategie für BFSG-Fuchs; ohne Key als
Markdown-Rohliste).

WICHTIG (rechtlich): Es findet BEWUSST KEIN LinkedIn-Scraping statt.
LinkedIn untersagt automatisiertes Auslesen in seinen ToS und die deutsche
Rechtsprechung (u. a. OLG Hamm) wertet solches Scraping als unzulässig
(UWG/Datenschutz). Wir nutzen daher nur frei zugängliche Nachrichten-Feeds.
"""

from __future__ import annotations

import feedparser
import httpx

from common.ai import anthropic_complete, has_anthropic
from common.mcp_server import ToolDef, create_mcp_app

VERSION = "1.0.0"

FEEDS = [
    "https://www.heise.de/rss/heise-atom.xml",
    "https://t3n.de/rss.xml",
    "https://news.google.com/rss/search?q=barrierefreiheit+BFSG&hl=de&gl=DE&ceid=DE:de",
]

KEYWORDS = (
    "barrierefrei",
    "barrierefreiheit",
    "bfsg",
    "wcag",
    "accessibility",
    "abmahnung",
)

MAX_ENTRIES = 15
HTTP_TIMEOUT = 10.0
USER_AGENT = "BFSG-Fuchs-AOS/1.0 (+https://bfsg-fuchs.de; Trend-Monitor)"


async def _fetch_entries() -> list[dict]:
    """Holt + filtert Feed-Einträge. Fehler je Feed werden toleriert."""
    entries: list[dict] = []
    async with httpx.AsyncClient(
        timeout=HTTP_TIMEOUT,
        follow_redirects=True,
        headers={"User-Agent": USER_AGENT},
    ) as client:
        for url in FEEDS:
            try:
                resp = await client.get(url)
                resp.raise_for_status()
                parsed = feedparser.parse(resp.content)
                feed_title = parsed.feed.get("title", url) if parsed.feed else url
                for entry in parsed.entries:
                    title = (entry.get("title") or "").strip()
                    summary = entry.get("summary") or entry.get("description") or ""
                    haystack = f"{title} {summary}".lower()
                    if any(kw in haystack for kw in KEYWORDS):
                        entries.append(
                            {
                                "title": title,
                                "link": entry.get("link", ""),
                                "published": entry.get("published", ""),
                                "source": feed_title,
                            }
                        )
            except Exception:  # noqa: BLE001 - Feed-Fehler tolerieren
                continue
    return entries[:MAX_ENTRIES]


def _raw_markdown(entries: list[dict]) -> str:
    if not entries:
        return (
            "## Trend-Monitor Barrierefreiheit\n\n"
            "Aktuell keine passenden Meldungen in den öffentlichen Feeds gefunden.\n"
        )
    lines = ["## Trend-Monitor Barrierefreiheit (Rohliste)", ""]
    for item in entries:
        src = item["source"]
        pub = f" — {item['published']}" if item["published"] else ""
        if item["link"]:
            lines.append(f"- [{item['title']}]({item['link']}) ({src}){pub}")
        else:
            lines.append(f"- {item['title']} ({src}){pub}")
    lines.append("")
    lines.append(
        "_Hinweis: Rohliste ohne KI-Zusammenfassung (kein ANTHROPIC_API_KEY gesetzt)._"
    )
    return "\n".join(lines)


ANALYSIS_SYSTEM = (
    "Du bist Markt- und Wettbewerbsanalyst für BFSG-Fuchs, einen SaaS-Scanner "
    "für digitale Barrierefreiheit. Analysiere die übergebenen Schlagzeilen und "
    "gib eine Markdown-Antwort auf Deutsch (echte Umlaute) aus:\n"
    "Genau 5 Trends. Je Trend: eine prägnante Überschrift, 1-2 Sätze Einordnung "
    "und darunter eine konkrete 'Konter-Strategie für BFSG-Fuchs'.\n"
    "Sachlich bleiben. Keine unzulässigen Werbeversprechen ('BFSG-konform', "
    "'rechtssicher', 'garantiert', 'TÜV', 'DEKRA')."
)


async def trend_summary(_args: dict) -> dict:
    entries = await _fetch_entries()

    if has_anthropic() and entries:
        headlines = "\n".join(
            f"- {e['title']} ({e['source']})" for e in entries
        )
        user = (
            "Hier die aktuellen Schlagzeilen zu Barrierefreiheit/BFSG:\n\n"
            f"{headlines}\n\n"
            "Erstelle jetzt die 5 Trends inklusive Konter-Strategien."
        )
        markdown = await anthropic_complete(ANALYSIS_SYSTEM, user, max_tokens=1200)
        if markdown:
            return {
                "markdown": markdown,
                "entries_count": len(entries),
                "source": "anthropic",
            }

    return {
        "markdown": _raw_markdown(entries),
        "entries_count": len(entries),
        "source": "raw",
    }


TOOLS = [
    ToolDef(
        name="trend_summary",
        description=(
            "Fasst aktuelle Barrierefreiheits-/BFSG-Trends aus öffentlichen "
            "RSS-Feeds zusammen (mit KI 5 Trends + Konter-Strategien, sonst "
            "Rohliste). Kein LinkedIn-Scraping."
        ),
        input_schema={"type": "object", "properties": {}, "required": []},
        handler=trend_summary,
    ),
]

app = create_mcp_app("competitor", VERSION, TOOLS)
