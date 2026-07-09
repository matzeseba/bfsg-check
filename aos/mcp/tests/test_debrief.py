"""Tests für den Template-Fallback des Debrief-Agenten (ohne API-Key)."""

import asyncio

from debrief_agent.agent import daily_debrief


def _run(kpis, zeitpunkt="morgens"):
    return asyncio.run(daily_debrief({"kpis": kpis, "zeitpunkt": zeitpunkt}))


KPIS = {
    "revenue_30d_eur": 1290,
    "leads_today": 4,
    "hot_leads": 2,
    "open_inbox": 5,
    "services_ok": 7,
    "services_total": 9,
    "notifications_unread": 3,
}


def test_template_fallback_basic():
    result = _run(KPIS)
    assert result["source"] == "demo"
    assert result["zeitpunkt"] == "morgens"
    text = result["briefing"]
    assert "Guten Morgen" in text
    # KPI-Zahlen tauchen im vorlesbaren Text auf
    assert "1290" in text
    assert "5" in text


def test_word_limit_under_150():
    text = _run(KPIS)["briefing"]
    assert len(text.split()) <= 150


def test_vorlesbar_no_special_chars():
    text = _run(KPIS)["briefing"]
    # keine Tabellen/Markdown/Sonderzeichen, die das Vorlesen stören
    for bad in ("|", "*", "#", "`", "\n"):
        assert bad not in text


def test_abends_variant_and_priorities():
    result = _run(KPIS, zeitpunkt="abends")
    assert result["zeitpunkt"] == "abends"
    assert "Guten Abend" in result["briefing"]
    # gestörte Dienste haben höchste Priorität
    assert "gestörte Dienste" in result["briefing"]


def test_invalid_zeitpunkt_defaults_morgens():
    result = _run(KPIS, zeitpunkt="mittags")
    assert result["zeitpunkt"] == "morgens"


def test_empty_kpis_still_produces_briefing():
    result = _run({})
    assert result["source"] == "demo"
    assert len(result["briefing"].split()) <= 150
    assert result["briefing"]
