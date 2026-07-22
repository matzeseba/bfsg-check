"""LLM-Provider-Abstraktion der MCP-Agenten (common/ai.py).

Provider-Auswahl + Key-Fallback + Routing (die konkreten Provider-Calls
werden durch Fakes ersetzt — kein Netzwerk, keine echten Keys).
"""

from __future__ import annotations

import asyncio

import common.ai as ai


def test_provider_auswahl_default_openai_unbekannt(monkeypatch):
    monkeypatch.delenv("AOS_LLM_PROVIDER", raising=False)
    assert ai.llm_provider_name() == "anthropic"
    monkeypatch.setenv("AOS_LLM_PROVIDER", "openai-compatible")
    assert ai.llm_provider_name() == "openai-compatible"
    monkeypatch.setenv("AOS_LLM_PROVIDER", "irgendwas")
    assert ai.llm_provider_name() == "anthropic"


def test_llm_api_key_fallback_anthropic(monkeypatch):
    monkeypatch.delenv("AOS_LLM_API_KEY", raising=False)
    monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-ant-test")
    assert ai.llm_api_key() == "sk-ant-test"
    assert ai.has_anthropic() is True
    monkeypatch.setenv("AOS_LLM_API_KEY", "sk-aos-test")
    assert ai.llm_api_key() == "sk-aos-test"
    monkeypatch.delenv("AOS_LLM_API_KEY", raising=False)
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    assert ai.llm_api_key() == ""
    assert ai.has_anthropic() is False


def test_chat_complete_routing_nach_provider(monkeypatch):
    monkeypatch.setenv("AOS_LLM_API_KEY", "sk-test")

    calls: list[str] = []

    async def _fake_anthropic(system, user, api_key, *, max_tokens, model):
        calls.append("anthropic")
        return "antwort-anthropic"

    async def _fake_openai(system, user, api_key, *, max_tokens, model):
        calls.append("openai")
        return "antwort-openai"

    monkeypatch.setattr(ai, "_anthropic_complete", _fake_anthropic)
    monkeypatch.setattr(ai, "_openai_compatible_complete", _fake_openai)

    monkeypatch.delenv("AOS_LLM_PROVIDER", raising=False)
    assert asyncio.run(ai.chat_complete("S", "U")) == "antwort-anthropic"

    monkeypatch.setenv("AOS_LLM_PROVIDER", "openai-compatible")
    # Auch der Kompatibilitäts-Alias muss über die Provider-Auswahl laufen.
    assert asyncio.run(ai.anthropic_complete("S", "U")) == "antwort-openai"

    assert calls == ["anthropic", "openai"]
