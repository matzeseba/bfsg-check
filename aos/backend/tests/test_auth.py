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
    body = resp.json()
    assert body["ok"] is True
    # Ohne gesetztes Passwort erzwingt der erste Login das Setzen.
    assert body["must_set_password"] is True
    set_cookie = resp.headers.get("set-cookie", "")
    assert COOKIE_NAME in set_cookie
    assert "HttpOnly" in set_cookie
    assert "Secure" in set_cookie


def test_me_via_bearer(client, auth_headers):
    resp = client.get("/api/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["authenticated"] is True
    assert body["must_set_password"] is True


def test_me_via_cookie_header(client):
    cookie = make_session_cookie(TEST_SESSION_SECRET)
    resp = client.get("/api/auth/me", headers={"Cookie": f"{COOKIE_NAME}={cookie}"})
    assert resp.status_code == 200
    assert resp.json()["authenticated"] is True


def test_set_password_then_login_with_password(client, auth_headers):
    # Passwort setzen (authentifiziert via Bearer-Token).
    resp = client.post(
        "/api/auth/set-password",
        json={"new_password": "meingeheim123"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json() == {"ok": True}

    # Login mit dem neuen Passwort — must_set_password jetzt False.
    resp2 = client.post("/api/auth/login", json={"token": "meingeheim123"})
    assert resp2.status_code == 200
    assert resp2.json()["must_set_password"] is False

    # Bootstrap-Token bleibt als Recovery-Zugang gueltig.
    resp3 = client.post("/api/auth/login", json={"token": TEST_ADMIN_TOKEN})
    assert resp3.status_code == 200
    assert resp3.json()["must_set_password"] is False


def test_login_wrong_password_after_set(client, auth_headers):
    client.post(
        "/api/auth/set-password",
        json={"new_password": "meingeheim123"},
        headers=auth_headers,
    )
    resp = client.post("/api/auth/login", json={"token": "falschespasswort"})
    assert resp.status_code == 401


def test_set_password_requires_auth(client):
    resp = client.post("/api/auth/set-password", json={"new_password": "meingeheim123"})
    assert resp.status_code == 401


def test_set_password_too_short(client, auth_headers):
    resp = client.post(
        "/api/auth/set-password",
        json={"new_password": "kurz"},
        headers=auth_headers,
    )
    assert resp.status_code == 422


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
