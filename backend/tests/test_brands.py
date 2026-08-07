"""Tests for /api/v1/brands and /api/v1/brand-brain."""

from tests.factories import brand_payload, workspace_payload


def _create_workspace(client, auth_headers):
    return client.post(
        "/api/v1/workspaces/", json=workspace_payload(), headers=auth_headers
    ).json()


def test_create_brand(client, auth_headers):
    workspace = _create_workspace(client, auth_headers)

    response = client.post(
        f"/api/v1/brands/workspaces/{workspace['id']}/brands",
        json=brand_payload(),
        headers=auth_headers,
    )

    assert response.status_code == 201
    body = response.json()
    assert body["workspace_id"] == workspace["id"]


def test_list_brands_for_workspace(client, auth_headers):
    workspace = _create_workspace(client, auth_headers)
    client.post(
        f"/api/v1/brands/workspaces/{workspace['id']}/brands",
        json=brand_payload(),
        headers=auth_headers,
    )
    client.post(
        f"/api/v1/brands/workspaces/{workspace['id']}/brands",
        json=brand_payload(),
        headers=auth_headers,
    )

    response = client.get(
        f"/api/v1/brands/workspaces/{workspace['id']}/brands", headers=auth_headers
    )

    assert response.status_code == 200
    assert len(response.json()) == 2


def test_get_brand_by_id(client, auth_headers):
    workspace = _create_workspace(client, auth_headers)
    created = client.post(
        f"/api/v1/brands/workspaces/{workspace['id']}/brands",
        json=brand_payload(),
        headers=auth_headers,
    ).json()

    response = client.get(f"/api/v1/brands/{created['id']}", headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["id"] == created["id"]


def test_get_nonexistent_brand_returns_404(client, auth_headers):
    response = client.get(
        "/api/v1/brands/00000000-0000-0000-0000-000000000000", headers=auth_headers
    )
    assert response.status_code == 404


def test_upsert_and_get_brand_identity(client, auth_headers):
    workspace = _create_workspace(client, auth_headers)
    brand = client.post(
        f"/api/v1/brands/workspaces/{workspace['id']}/brands",
        json=brand_payload(),
        headers=auth_headers,
    ).json()

    identity_payload = {
        "mission": "Make things simple.",
        "tone_of_voice": "Friendly and direct.",
    }
    put_response = client.put(
        f"/api/v1/brand-brain/{brand['id']}/identity",
        json=identity_payload,
        headers=auth_headers,
    )
    assert put_response.status_code == 200
    assert put_response.json()["mission"] == identity_payload["mission"]

    get_response = client.get(
        f"/api/v1/brand-brain/{brand['id']}/identity", headers=auth_headers
    )
    assert get_response.status_code == 200
    assert get_response.json()["tone_of_voice"] == identity_payload["tone_of_voice"]

    # Upsert again - should update the same row, not create a duplicate.
    updated_payload = {"mission": "Make things even simpler."}
    second_put = client.put(
        f"/api/v1/brand-brain/{brand['id']}/identity",
        json=updated_payload,
        headers=auth_headers,
    )
    assert second_put.status_code == 200
    assert second_put.json()["mission"] == updated_payload["mission"]
    assert second_put.json()["id"] == put_response.json()["id"]


def test_create_and_list_brand_rules(client, auth_headers):
    workspace = _create_workspace(client, auth_headers)
    brand = client.post(
        f"/api/v1/brands/workspaces/{workspace['id']}/brands",
        json=brand_payload(),
        headers=auth_headers,
    ).json()

    rule_payload = {"rule_type": "wording", "title": "Never say 'cheap'"}
    create_response = client.post(
        f"/api/v1/brand-brain/{brand['id']}/rules", json=rule_payload, headers=auth_headers
    )
    assert create_response.status_code == 201

    list_response = client.get(
        f"/api/v1/brand-brain/{brand['id']}/rules", headers=auth_headers
    )
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1
    assert list_response.json()[0]["title"] == rule_payload["title"]
