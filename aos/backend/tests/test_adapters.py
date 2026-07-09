"""Adapter im Demo-Modus + Finance/Health-Shapes gegen ARCHITECTURE.md Paragraph 4."""

from __future__ import annotations

from app.adapters import brevo_adapter, host_adapter, scanner_adapter, stripe_adapter
from app.config import get_settings

SETTINGS = get_settings()


# --------------------------------------------------------------------------- #
# Stripe (Demo)
# --------------------------------------------------------------------------- #
def test_stripe_summary_demo_shape(client, auth_headers):
    resp = client.get("/api/finance/summary", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    for key in (
        "gross_30d", "net_30d", "fees_30d", "mrr", "active_subs",
        "refund_rate_pct", "by_package", "source",
    ):
        assert key in data
    assert data["source"] == "demo"
    assert isinstance(data["by_package"], list)
    pkg = data["by_package"][0]
    assert {"name", "count", "eur"}.issubset(pkg.keys())


def test_stripe_invoices_masked(client, auth_headers):
    resp = client.get("/api/finance/invoices?limit=5", headers=auth_headers)
    assert resp.status_code == 200
    invoices = resp.json()["invoices"]
    assert 1 <= len(invoices) <= 5
    inv = invoices[0]
    assert {"id", "date", "amount_eur", "package", "status", "customer_masked"}.issubset(inv)
    assert "***@" in inv["customer_masked"]


def test_finance_thresholds_shape(client, auth_headers):
    resp = client.get("/api/finance/thresholds", headers=auth_headers)
    assert resp.status_code == 200
    ku = resp.json()["kleinunternehmer"]
    for key in (
        "limit_prev_year", "limit_current_year", "ytd_revenue",
        "pct_used", "projected_year_end", "warn",
    ):
        assert key in ku
    assert ku["limit_prev_year"] == 25000
    assert ku["limit_current_year"] == 100000
    assert isinstance(ku["warn"], bool)


# --------------------------------------------------------------------------- #
# Brevo (Demo)
# --------------------------------------------------------------------------- #
def test_brevo_account_demo():
    info = brevo_adapter.account_info(SETTINGS)
    assert info["source"] == "demo"
    assert not brevo_adapter.is_live(SETTINGS)


def test_brevo_send_demo_not_sent():
    res = brevo_adapter.send_transactional(
        SETTINGS, "kunde@example.de", "Betreff", "<p>Hallo</p>"
    )
    assert res["sent"] is False
    assert res["source"] == "demo"


# --------------------------------------------------------------------------- #
# Scanner (nicht erreichbar -> Demo)
# --------------------------------------------------------------------------- #
def test_scanner_health_demo_shape():
    res = scanner_adapter.health(SETTINGS)
    assert res["source"] == "demo"
    assert res["ok"] is True
    assert "health" in res


# --------------------------------------------------------------------------- #
# Host (psutil; containers None ohne Docker-Sock)
# --------------------------------------------------------------------------- #
def test_host_metrics_shape():
    res = host_adapter.host_metrics(SETTINGS)
    for key in ("cpu_pct", "mem_used_mb", "mem_total_mb", "disk_used_pct", "containers"):
        assert key in res
    assert res["containers"] is None  # AOS_DOCKER_SOCK=false
    assert res["mem_total_mb"] > 0


def test_health_services_shape(client, auth_headers):
    resp = client.get("/api/health/services", headers=auth_headers)
    assert resp.status_code == 200
    services = resp.json()["services"]
    assert len(services) == 9
    svc = services[0]
    for key in ("key", "name", "url", "ok", "latency_ms", "checked_at", "detail"):
        assert key in svc
    # Self-Check (aos-backend) muss ok sein.
    self_svc = next(s for s in services if s["key"] == "aos-backend")
    assert self_svc["ok"] is True


def test_health_host_endpoint(client, auth_headers):
    resp = client.get("/api/health/host", headers=auth_headers)
    assert resp.status_code == 200
    assert "containers" in resp.json()
