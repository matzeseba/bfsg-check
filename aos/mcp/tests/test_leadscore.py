"""Deterministische Tests für das Lead-Scoring (ohne API-Key)."""

import asyncio

from leadscore_agent.agent import score_leads


def _run(leads):
    return asyncio.run(score_leads({"leads": leads}))


def test_scores_in_range_and_sorted():
    leads = [
        {
            "domain": "kleiner-blog.de",
            "score_a11y": 92,
            "issues_critical": 0,
            "issues_total": 3,
            "package": "",
        },
        {
            "domain": "grosser-shop.de",
            "score_a11y": 31,
            "issues_critical": 12,
            "issues_total": 48,
            "package": "profi",
        },
    ]
    result = _run(leads)
    scored = result["leads"]
    assert len(scored) == 2
    for item in scored:
        assert 1 <= item["lead_score"] <= 100
        assert item["reasoning"]
        assert item["recommended_action"]
    # absteigend sortiert
    assert scored[0]["lead_score"] >= scored[1]["lead_score"]
    # der kritische Shop-Lead muss vorne stehen
    assert scored[0]["domain"] == "grosser-shop.de"


def test_critical_beats_clean():
    hot = _run(
        [
            {
                "domain": "problemseite.de",
                "score_a11y": 20,
                "issues_critical": 14,
                "issues_total": 55,
                "package": "profi",
            }
        ]
    )["leads"][0]
    clean = _run(
        [
            {
                "domain": "vorbildseite.de",
                "score_a11y": 98,
                "issues_critical": 0,
                "issues_total": 1,
                "package": "",
            }
        ]
    )["leads"][0]
    assert hot["lead_score"] > clean["lead_score"]
    assert hot["lead_score"] >= 80
    assert "Sofort kontaktieren" in hot["recommended_action"]


def test_deterministic_repeatable():
    leads = [
        {
            "domain": "beispiel-store.com",
            "score_a11y": 45,
            "issues_critical": 6,
            "issues_total": 20,
            "package": "basis",
        }
    ]
    first = _run(leads)
    second = _run(leads)
    assert first == second
    assert first["source"] == "deterministic"


def test_ecommerce_domain_signal_raises_budget():
    with_shop = _run(
        [
            {
                "domain": "mein-shop.de",
                "score_a11y": 60,
                "issues_critical": 2,
                "issues_total": 10,
                "package": "",
            }
        ]
    )["leads"][0]
    without_shop = _run(
        [
            {
                "domain": "mein-verein.de",
                "score_a11y": 60,
                "issues_critical": 2,
                "issues_total": 10,
                "package": "",
            }
        ]
    )["leads"][0]
    assert with_shop["lead_score"] >= without_shop["lead_score"]


def test_empty_and_malformed_leads():
    result = _run([])
    assert result["leads"] == []
    assert result["count"] == 0
    # nicht-dict-Einträge werden ignoriert
    mixed = _run(["kaputt", {"domain": "ok.de", "issues_critical": 1}])
    assert mixed["count"] == 1
