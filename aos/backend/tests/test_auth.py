"""Auth-Flow: Login (ok/falsch), Cookie-HMAC-Verify, Bearer + Cookie-Zugriff."""

from __future__ import annotations

import time

from app.auth import (
    COOKIE_NAME,
    make_session_cookie,
    verify_session_cookie,
)

from .conftest import TEST_ADMIN_TOKEN, TEST_SESSION_SECRET


def test_cookie_roundtrip_valid():
    cookie = make_session_cookie(TEST_SESSION_SECRET)
    assert "." in cookie
    assert verify_session_cookie(TEST_SESSION_SECRET, cookie) is True


def test_cookie_tampered_signature_fails():
    cookie = make_session_cookie(TEST_SESSION_SECRET)
    payload_b64, _, _sig = cookie.partition(".")
    forged = f"{payload_b64}.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    assert verify_session_cookie(TEST_SESSION_SECRET, forged) is False


def test_cookie_wrong_secret_fails():
    cookie = make_session_cookie(TEST_SESSION_SECRET)
    assert verify_session_cookie("anderes-secret", cookie) is False


def test_cookie_expired_fails():
    cookie = make_session_cookie(TEST_SESSION_SECRET, ttl_seconds=-10)
    assert verify_session_cookie(TEST_SESSION_SECRET, cookie) is False


def test_login_wrong_token(client):
    resp = client.post("/api/auth/login", json={"token": "falsch"})
    assert resp.status_code == 401
    assert "detail" in resp.json()


def test_login_ok_sets_cookie(client):
    resp = client.post("/api/auth/login", json={"token": TEST_ADMIN_TOKEN})
    assert resp.status_code == 200
    assert resp.json() == {"ok": True}
    set_cookie = resp.headers.get("set-cookie", "")
    assert COOKIE_NAME in set_cookie
    assert "HttpOnly" in set_cookie
    assert "Secure" in set_cookie


def test_me_via_bearer(client, auth_headers):
    resp = client.get("/api/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json() == {"authenticated": True}


def test_me_via_cookie_header(client):
    cookie = make_session_cookie(TEST_SESSION_SECRET)
    resp = client.get("/api/auth/me", headers={"Cookie": f"{COOKIE_NAME}={cookie}"})
    assert resp.status_code == 200
    assert resp.json() == {"authenticated": True}


def test_protected_without_auth_401(client):
    resp = client.get("/api/dashboard/summary")
    assert resp.status_code == 401


def test_healthz_open():
    from fastapi.testclient import TestClient

    from app.main import app

    with TestClient(app) as c:
        resp = c.get("/healthz")
    assert resp.status_code == 200
    body = resp.json()
    assert body["ok"] is True
    assert body["service"] == "aos-backend"
