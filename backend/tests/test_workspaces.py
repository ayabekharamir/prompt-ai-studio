"""Tests for /api/v1/workspaces."""

from tests.factories import workspace_payload


def test_create_workspace(client, auth_headers):
    response = client.post(
        "/api/v1/workspaces/", json=workspace_payload(), headers=auth_headers
    )

    assert response.status_code == 201
    body = response.json()
    assert body["name"]
    assert body["slug"]
    assert body["owner_id"]


def test_create_workspace_requires_authentication(client):
    response = client.post("/api/v1/workspaces/", json=workspace_payload())
    assert response.status_code == 401


def test_list_workspaces_returns_only_own_workspaces(client, auth_headers):
    client.post("/api/v1/workspaces/", json=workspace_payload(), headers=auth_headers)
    client.post("/api/v1/workspaces/", json=workspace_payload(), headers=auth_headers)

    response = client.get("/api/v1/workspaces/", headers=auth_headers)

    assert response.status_code == 200
    assert len(response.json()) == 2


def test_get_workspace_by_id(client, auth_headers):
    created = client.post(
        "/api/v1/workspaces/", json=workspace_payload(), headers=auth_headers
    ).json()

    response = client.get(f"/api/v1/workspaces/{created['id']}", headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["id"] == created["id"]


def test_get_nonexistent_workspace_returns_404(client, auth_headers):
    response = client.get(
        "/api/v1/workspaces/00000000-0000-0000-0000-000000000000", headers=auth_headers
    )
    assert response.status_code == 404
