"""Jarvis (Team Gamma): Tool-Registry + regelbasierter Fallback (ohne API-Key).

Diese Tests laufen im Demo-Modus (conftest entfernt ANTHROPIC_API_KEY), decken
also gezielt den Nicht-LLM-Pfad + die Tool-Definitionen ab.
"""

from __future__ import annotations

from app.jarvis import brain, tools
from app.jarvis.ws import _compose_user_content


# --------------------------------------------------------------------------- #
# Tool-Registry
# --------------------------------------------------------------------------- #
def test_tool_registry_vollstaendig():
    namen = {t["name"] for t in tools.TOOLS}
    assert namen == {
        "navigate",
        "get_dashboard_summary",
        "get_health",
        "get_finance_summary",
        "search_library",
        "run_agent",
        "draft_inbox_reply",
    }
    assert tools.TOOL_NAMES == namen


def test_tool_schemas_wohlgeformt():
    for tool in tools.TOOLS:
        assert isinstance(tool["name"], str) and tool["name"]
        assert isinstance(tool["description"], str) and tool["description"]
        schema = tool["input_schema"]
        assert schema["type"] == "object"
        assert "properties" in schema


def test_execute_navigate_liefert_ui_action():
    text, ui = tools.execute_tool("navigate", {"route": "/finance"}, settings=None)
    assert ui == {
        "type": "ui_action",
        "action": "navigate",
        "params": {"route": "/finance"},
    }
    assert "/finance" in text


def test_execute_navigate_unbekannte_route_faellt_auf_root():
    _text, ui = tools.execute_tool("navigate", {"route": "/hack"}, settings=None)
    assert ui is not None and ui["params"]["route"] == "/"


def test_execute_run_agent_ohne_internen_lauf():
    # run_agent liefert nur die ui_action (Client fuehrt den POST aus) — kein DB/MCP.
    text, ui = tools.execute_tool("run_agent", {"key": "debrief"}, settings=None)
    assert ui == {
        "type": "ui_action",
        "action": "run_agent",
        "params": {"key": "debrief"},
    }
    assert "debrief" in text


def test_execute_run_agent_unbekannt():
    text, ui = tools.execute_tool("run_agent", {"key": "boese"}, settings=None)
    assert ui is None
    assert "Unbekannt" in text or "unbekannt" in text.lower()


# --------------------------------------------------------------------------- #
# Regelbasierter Fallback
# --------------------------------------------------------------------------- #
def test_fallback_navigation_posteingang():
    text, ui = brain.rule_based_reply("Öffne bitte den Posteingang")
    assert ui is not None
    assert ui["action"] == "navigate"
    assert ui["params"]["route"] == "/inbox"


def test_fallback_navigation_finanzen():
    _text, ui = brain.rule_based_reply("Zeig mir die Finanzen")
    assert ui is not None and ui["params"]["route"] == "/finance"


def test_fallback_debrief_startet_agent():
    text, ui = brain.rule_based_reply("Gib mir das Tagesbriefing")
    assert ui is not None
    assert ui["action"] == "run_agent"
    assert ui["params"]["key"] == "debrief"


def test_fallback_unbekannt_gibt_hinweis():
    text, ui = brain.rule_based_reply("Wie ist das Wetter morgen?")
    assert ui is None
    assert "ANTHROPIC_API_KEY" in text


# --------------------------------------------------------------------------- #
# Kontext-Einbettung
# --------------------------------------------------------------------------- #
def test_compose_user_content_haengt_kontext_an():
    out = _compose_user_content(
        "Was ist offen?",
        {"route": "/inbox", "screen_summary": "Posteingang, 7 offene Anfragen"},
    )
    assert "Was ist offen?" in out
    assert "/inbox" in out
    assert "7 offene Anfragen" in out


def test_compose_user_content_ohne_kontext_unveraendert():
    assert _compose_user_content("Hallo", {}) == "Hallo"
