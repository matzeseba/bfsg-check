"""Inbox-CRUD + Draft-Fallback (ohne API-Key -> Heuristik)."""

from __future__ import annotations

_SUMMARY_KEYS = {
    "id", "subject", "sender", "channel", "preview", "priority",
    "priority_reason", "status", "created_at", "source",
}


def test_list_inbox_seeded(client, auth_headers):
    resp = client.get("/api/inbox", headers=auth_headers)
    assert resp.status_code == 200
    items = resp.json()["items"]
    assert len(items) == 8
    first = items[0]
    assert _SUMMARY_KEYS.issubset(first.keys())
    # Nach Prioritaet aufsteigend sortiert (1 = hoechste zuerst).
    priorities = [i["priority"] for i in items]
    assert priorities == sorted(priorities)


def test_list_inbox_filter_status(client, auth_headers):
    resp = client.get("/api/inbox?status=open", headers=auth_headers)
    assert resp.status_code == 200
    items = resp.json()["items"]
    assert all(i["status"] == "open" for i in items)
    assert len(items) == 8


def test_get_inbox_item(client, auth_headers):
    resp = client.get("/api/inbox/1", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "body" in data
    assert "draft" in data
    assert data["draft"] is None


def test_get_inbox_missing_404(client, auth_headers):
    resp = client.get("/api/inbox/9999", headers=auth_headers)
    assert resp.status_code == 404
    assert "detail" in resp.json()


def test_draft_fallback_without_key(client, auth_headers):
    resp = client.post("/api/inbox/1/draft", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["model"] == "heuristik"
    assert isinstance(data["draft"], str) and len(data["draft"]) > 20
    # UWG-kritische Begriffe duerfen nicht vorkommen.
    low = data["draft"].lower()
    for bad in ("bfsg-konform", "rechtssicher", "garantiert"):
        assert bad not in low
    # Status wurde auf drafted gesetzt.
    check = client.get("/api/inbox/1", headers=auth_headers).json()
    assert check["status"] == "drafted"
    assert check["draft"]


def test_patch_status(client, auth_headers):
    resp = client.patch("/api/inbox/2", json={"status": "closed"}, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "closed"


def test_patch_invalid_status(client, auth_headers):
    resp = client.patch("/api/inbox/2", json={"status": "quatsch"}, headers=auth_headers)
    assert resp.status_code == 422
