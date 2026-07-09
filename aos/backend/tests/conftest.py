"""Test-Setup: Temp-SQLite, deaktivierter Scheduler, keine API-Keys (Demo-Modus).

Wichtig: Umgebungsvariablen MUESSEN vor dem ersten App-Import gesetzt sein, weil
db.py die Engine beim Import anhand von AOS_DB_PATH erzeugt und get_settings() cached.
"""

from __future__ import annotations

import os
import tempfile

# --- Env VOR jedem App-Import setzen ---------------------------------------- #
_TEST_DB = os.path.join(tempfile.gettempdir(), "aos_test.db")
for _suffix in ("", "-wal", "-shm"):
    try:
        os.remove(_TEST_DB + _suffix)
    except OSError:
        pass

TEST_ADMIN_TOKEN = "test-admin-token-123"
TEST_SESSION_SECRET = "test-session-secret-abc"

os.environ["AOS_DB_PATH"] = _TEST_DB
os.environ["AOS_ADMIN_TOKEN"] = TEST_ADMIN_TOKEN
os.environ["AOS_SESSION_SECRET"] = TEST_SESSION_SECRET
os.environ["AOS_DISABLE_SCHEDULER"] = "true"
# Keine externen Keys -> alle Adapter im Demo-Modus.
for _k in ("ANTHROPIC_API_KEY", "STRIPE_SECRET_KEY", "BREVO_API_KEY", "PERPLEXITY_API_KEY"):
    os.environ.pop(_k, None)

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402


@pytest.fixture()
def client():
    # Kontextmanager triggert Lifespan (init_db + Seeds).
    with TestClient(app) as c:
        yield c


@pytest.fixture()
def auth_headers():
    return {"Authorization": f"Bearer {TEST_ADMIN_TOKEN}"}
