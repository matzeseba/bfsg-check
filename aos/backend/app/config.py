"""Env-Parsing (SSOT: aos/ARCHITECTURE.md Paragraph 7).

Bewusst schlank ueber os.environ + python-dotenv gehalten (statt pydantic-settings),
damit die Abhaengigkeitsliste exakt der Vorgabe entspricht. Alle Vars aus Paragraph 7.
"""

from __future__ import annotations

import logging
import os
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()

log = logging.getLogger("aos.config")

# Oeffentlich bekannter Platzhalter — darf NIE als echtes Session-Secret gelten.
# Cookie-Auth wird bei diesem Wert (oder leer) fail-closed abgelehnt (siehe auth.py).
INSECURE_SESSION_SECRET = "dev-insecure-session-secret-change-me"


def _bool(name: str, default: bool = False) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


class Settings:
    """Zentraler, unveraenderlicher Zugriff auf alle Umgebungsvariablen."""

    def __init__(self) -> None:
        # --- Auth / Sessions ---
        self.admin_token: str = os.getenv("AOS_ADMIN_TOKEN", "")
        self.session_secret: str = os.getenv(
            "AOS_SESSION_SECRET", INSECURE_SESSION_SECRET
        )
        if self.session_secret_is_insecure:
            log.warning(
                "AOS_SESSION_SECRET fehlt oder ist der unsichere Platzhalter — "
                "Cookie-Auth wird fail-closed abgelehnt. Ein zufaelliges Secret setzen!"
            )

        # --- KI (Provider-Abstraktion: services/llm_provider.py) ---
        self.llm_provider: str = os.getenv("AOS_LLM_PROVIDER", "anthropic")
        self.llm_base_url: str = os.getenv("AOS_LLM_BASE_URL", "")
        # AOS_LLM_API_KEY hat Vorrang; ANTHROPIC_API_KEY bleibt als Fallback
        # (Bestands-Deployments setzen nur diesen).
        self.anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")
        self.llm_api_key: str = os.getenv("AOS_LLM_API_KEY", "") or self.anthropic_api_key
        self.model_jarvis: str = os.getenv("AOS_MODEL_JARVIS", "claude-sonnet-4-6")
        self.model_agents: str = os.getenv("AOS_MODEL_AGENTS", "claude-sonnet-4-6")
        self.perplexity_api_key: str = os.getenv("PERPLEXITY_API_KEY", "")

        # --- Zahlungen / Mail ---
        self.stripe_secret_key: str = os.getenv("STRIPE_SECRET_KEY", "")
        self.brevo_api_key: str = os.getenv("BREVO_API_KEY", "")
        self.admin_email: str = os.getenv("ADMIN_EMAIL", "")

        # --- Scanner-Anbindung ---
        self.scanner_base_url: str = os.getenv("SCANNER_BASE_URL", "http://app:8080")
        self.scanner_admin_token: str = os.getenv("SCANNER_ADMIN_TOKEN", "")
        self.public_health_url: str = os.getenv(
            "PUBLIC_HEALTH_URL", "https://bfsg-fuchs.de/health"
        )

        # --- Host / Docker ---
        # Container-Uebersicht laeuft NICHT direkt gegen /var/run/docker.sock (voller
        # Daemon-Zugriff = Root-Eskalation), sondern gegen einen read-only
        # docker-socket-proxy (nur GET /containers/json).
        self.docker_sock: bool = _bool("AOS_DOCKER_SOCK", False)
        self.docker_proxy_url: str = os.getenv(
            "AOS_DOCKER_PROXY_URL", "http://aos-docker-proxy:2375"
        )
        self.base_url: str = os.getenv("AOS_BASE_URL", "https://aos.bfsg-fuchs.de")

        # --- MCP-Microservices ---
        self.mcp_research_url: str = os.getenv(
            "MCP_RESEARCH_URL", "http://aos-mcp-research:8101"
        )
        self.mcp_leadscore_url: str = os.getenv(
            "MCP_LEADSCORE_URL", "http://aos-mcp-leadscore:8102"
        )
        self.mcp_competitor_url: str = os.getenv(
            "MCP_COMPETITOR_URL", "http://aos-mcp-competitor:8103"
        )
        self.mcp_debrief_url: str = os.getenv(
            "MCP_DEBRIEF_URL", "http://aos-mcp-debrief:8104"
        )

        self.tz: str = os.getenv("TZ", "Europe/Berlin")

        # --- Betrieb / Tests ---
        self.db_path: str = os.getenv("AOS_DB_PATH", "/data/aos.db")
        self.disable_scheduler: bool = _bool("AOS_DISABLE_SCHEDULER", False)

    @property
    def session_secret_is_insecure(self) -> bool:
        """True, wenn kein echtes Session-Secret gesetzt ist (leer/Platzhalter)."""
        return (not self.session_secret) or self.session_secret == INSECURE_SESSION_SECRET

    def mcp_url(self, key: str) -> str:
        return {
            "research": self.mcp_research_url,
            "leadscore": self.mcp_leadscore_url,
            "competitor": self.mcp_competitor_url,
            "debrief": self.mcp_debrief_url,
        }[key]


@lru_cache
def get_settings() -> Settings:
    """FastAPI-Dependency + globaler Zugriff (gecached)."""
    return Settings()
