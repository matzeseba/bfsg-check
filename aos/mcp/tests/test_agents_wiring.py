"""Verdrahtungs-Tests: alle 4 Agenten-Apps starten, /healthz + tools/list ok.

Es werden nur netzwerkfreie Pfade getestet (Research-Demo-Fallback). Der
Competitor-Agent wird NICHT aufgerufen (RSS-Netzzugriff), nur seine Registrierung
wird geprüft.
"""

import asyncio

from fastapi.testclient import TestClient

from competitor_agent.agent import app as competitor_app
from debrief_agent.agent import app as debrief_app
from leadscore_agent.agent import app as leadscore_app
from research_agent.agent import (
    app as research_app,
    generate_linkedin_post,
    research_topic,
)

AGENTS = {
    "research": (research_app, {"research_topic", "generate_linkedin_post"}),
    "leadscore": (leadscore_app, {"score_leads"}),
    "competitor": (competitor_app, {"trend_summary"}),
    "debrief": (debrief_app, {"daily_debrief"}),
}


def test_all_agents_healthz_and_tools():
    for expected_name, (app, tool_names) in AGENTS.items():
        client = TestClient(app)
        health = client.get("/healthz").json()
        assert health == {"ok": True, "agent": expected_name}

        listed = client.post(
            "/", json={"jsonrpc": "2.0", "id": 1, "method": "tools/list"}
        ).json()
        got = {t["name"] for t in listed["result"]["tools"]}
        assert got == tool_names


def test_research_topic_demo_fallback_offline():
    # ohne PERPLEXITY/ANTHROPIC-Key -> Demo-Quelle, kein Netzwerk
    result = asyncio.run(research_topic({"query": "Alternativtexte für Bilder"}))
    assert result["source"] == "demo"
    assert "Alternativtexte für Bilder" in result["summary"]


def test_linkedin_post_demo_is_uwg_safe():
    result = asyncio.run(generate_linkedin_post({"topic": "Kontraste"}))
    assert result["source"] == "demo"
    post = result["post"].lower()
    assert post.count("#") == 3  # genau drei Hashtags
    for forbidden in ("bfsg-konform", "rechtssicher", "garantiert", "tüv", "dekra"):
        assert forbidden not in post
