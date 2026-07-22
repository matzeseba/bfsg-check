"""LLM-Provider-Adapter: Provider-Auswahl, Key-Fallback, OpenAI-kompatibler Pfad.

Laeuft ohne echte API-Keys (conftest entfernt ANTHROPIC_API_KEY); der
OpenAI-kompatible HTTP-Call wird gegen ein gemocktes httpx.post getestet.
"""

from __future__ import annotations

import httpx

from app.config import Settings
from app.services import llm_provider


def _settings() -> Settings:
    # Frische Instanz (nicht der gecachte get_settings()), damit monkeypatch-Envs greifen.
    return Settings()


# --------------------------------------------------------------------------- #
# Provider-Auswahl + Key-Fallback
# --------------------------------------------------------------------------- #
def test_provider_default_ist_anthropic(monkeypatch):
    monkeypatch.delenv("AOS_LLM_PROVIDER", raising=False)
    s = _settings()
    assert llm_provider.provider_name(s) == "anthropic"


def test_provider_openai_compatible_und_unbekannter_wert(monkeypatch):
    monkeypatch.setenv("AOS_LLM_PROVIDER", "openai-compatible")
    assert llm_provider.provider_name(_settings()) == "openai-compatible"
    # Unbekannte Werte fallen auf den Default 'anthropic' zurueck.
    monkeypatch.setenv("AOS_LLM_PROVIDER", "irgendwas")
    assert llm_provider.provider_name(_settings()) == "anthropic"


def test_llm_api_key_faellt_auf_anthropic_key_zurueck(monkeypatch):
    monkeypatch.delenv("AOS_LLM_API_KEY", raising=False)
    monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-ant-test")
    s = _settings()
    assert s.llm_api_key == "sk-ant-test"
    assert llm_provider.llm_enabled(s) is True
    # AOS_LLM_API_KEY hat Vorrang.
    monkeypatch.setenv("AOS_LLM_API_KEY", "sk-aos-test")
    assert _settings().llm_api_key == "sk-aos-test"


# --------------------------------------------------------------------------- #
# OpenAI-kompatibler Pfad (httpx gemockt)
# --------------------------------------------------------------------------- #
def test_openai_compatible_complete_parst_antwort(monkeypatch):
    monkeypatch.setenv("AOS_LLM_PROVIDER", "openai-compatible")
    monkeypatch.setenv("AOS_LLM_BASE_URL", "https://llm.example.de/v1/")
    monkeypatch.setenv("AOS_LLM_API_KEY", "sk-test")

    class _Resp:
        def raise_for_status(self):
            return None

        def json(self):
            return {"choices": [{"message": {"content": "  Hallo Welt  "}}]}

    captured: dict = {}

    def _fake_post(url, *, headers, json, timeout):
        captured["url"] = url
        captured["headers"] = headers
        captured["json"] = json
        return _Resp()

    monkeypatch.setattr(httpx, "post", _fake_post)

    text = llm_provider.chat_complete(_settings(), "System", "Frage", max_tokens=50)
    assert text == "Hallo Welt"
    # Trailing-Slash der Base-URL wird normalisiert.
    assert captured["url"] == "https://llm.example.de/v1/chat/completions"
    assert captured["headers"]["Authorization"] == "Bearer sk-test"
    assert captured["json"]["messages"][0]["role"] == "system"
    assert captured["json"]["messages"][1]["content"] == "Frage"


def test_openai_compatible_fehler_und_fehlende_base_url_geben_none(monkeypatch):
    # HTTP-Fehler -> None (Aufrufer faellt auf Heuristik/Demo zurueck).
    monkeypatch.setenv("AOS_LLM_PROVIDER", "openai-compatible")
    monkeypatch.setenv("AOS_LLM_BASE_URL", "https://llm.example.de/v1")
    monkeypatch.setenv("AOS_LLM_API_KEY", "sk-test")

    def _boom(*_a, **_kw):
        raise httpx.ConnectError("nicht erreichbar")

    monkeypatch.setattr(httpx, "post", _boom)
    assert llm_provider.chat_complete(_settings(), "S", "U") is None

    # Fehlende Base-URL -> None.
    monkeypatch.setenv("AOS_LLM_BASE_URL", "")
    assert llm_provider.chat_complete(_settings(), "S", "U") is None

    # Ohne Key ist der LLM-Pfad generell inaktiv.
    monkeypatch.delenv("AOS_LLM_API_KEY", raising=False)
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    s = _settings()
    assert llm_provider.llm_enabled(s) is False
    assert llm_provider.chat_complete(s, "S", "U") is None
