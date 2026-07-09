"""Dashboard-Summary-Shape + Agents/Notifications/Library-Grundfunktionen."""

from __future__ import annotations


def test_dashboard_summary_shape(client, auth_headers):
    resp = client.get("/api/dashboard/summary", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    expected = {
        "revenue_30d_eur", "revenue_source", "open_inbox", "leads_today",
        "services_ok", "services_total", "agent_runs_today",
        "notifications_unread", "sparkline_30d",
    }
    assert expected == set(data.keys())
    assert isinstance(data["revenue_30d_eur"], (int, float))
    assert data["revenue_source"] == "demo"
    assert isinstance(data["open_inbox"], int)
    assert data["services_total"] == 9
    assert isinstance(data["sparkline_30d"], list)
    assert len(data["sparkline_30d"]) == 30
    point = data["sparkline_30d"][0]
    assert {"date", "eur"}.issubset(point.keys())


def test_agents_list(client, auth_headers):
    resp = client.get("/api/agents", headers=auth_headers)
    assert resp.status_code == 200
    agents = resp.json()["agents"]
    keys = {a["key"] for a in agents}
    assert keys == {"research", "leadscore", "competitor", "debrief"}
    a = agents[0]
    for key in ("key", "name", "description", "schedule_human", "last_run", "enabled"):
        assert key in a


def test_agent_run_manual_202(client, auth_headers):
    resp = client.post("/api/agents/competitor/run", headers=auth_headers)
    assert resp.status_code == 202
    assert "run_id" in resp.json()


def test_agent_run_unknown_404(client, auth_headers):
    resp = client.post("/api/agents/foobar/run", headers=auth_headers)
    assert resp.status_code == 404


def test_agent_results_shape(client, auth_headers):
    resp = client.get("/api/agents/debrief/results", headers=auth_headers)
    assert resp.status_code == 200
    runs = resp.json()["runs"]
    assert isinstance(runs, list)
    if runs:
        r = runs[0]
        for key in ("id", "started_at", "finished_at", "ok", "summary", "output_md"):
            assert key in r


def test_notifications_unread(client, auth_headers):
    resp = client.get("/api/notifications?unread=true", headers=auth_headers)
    assert resp.status_code == 200
    items = resp.json()["items"]
    assert all(i["read"] is False for i in items)
    if items:
        first_id = items[0]["id"]
        mark = client.post(
            "/api/notifications/read", json={"ids": [first_id]}, headers=auth_headers
        )
        assert mark.status_code == 200
        assert mark.json() == {"ok": True}


def test_library_search_and_create(client, auth_headers):
    # LIKE-Suche
    resp = client.get("/api/library?q=WCAG", headers=auth_headers)
    assert resp.status_code == 200
    items = resp.json()["items"]
    assert len(items) >= 1
    assert {"id", "title", "category", "tags", "preview", "updated_at"}.issubset(items[0])

    # Filter nach Kategorie
    lp = client.get("/api/library?category=linkedin", headers=auth_headers)
    assert all(i["category"] == "linkedin" for i in lp.json()["items"])

    # CRUD: anlegen
    created = client.post(
        "/api/library",
        json={
            "title": "Test-Asset",
            "category": "audit-template",
            "tags": ["test"],
            "body_md": "## Inhalt\nEin WCAG-2.1-AA-Pruefpunkt.",
        },
        headers=auth_headers,
    )
    assert created.status_code == 200
    new_id = created.json()["id"]
    assert created.json()["source"] == "live"

    # aktualisieren
    updated = client.put(
        f"/api/library/{new_id}",
        json={"title": "Test-Asset v2", "category": "sonstiges", "tags": [], "body_md": "neu"},
        headers=auth_headers,
    )
    assert updated.status_code == 200
    assert updated.json()["title"] == "Test-Asset v2"
