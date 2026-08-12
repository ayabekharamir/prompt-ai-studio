"""Tests for /api/v1/brands/{brand_id}/assets and /api/v1/assets."""

from tests.factories import brand_payload, register_payload, workspace_payload

_PNG_BYTES = b"\x89PNG\r\n\x1a\n" + b"0" * 64


def _create_workspace(client, auth_headers):
    return client.post(
        "/api/v1/workspaces/", json=workspace_payload(), headers=auth_headers
    ).json()


def _create_brand(client, auth_headers, workspace_id):
    return client.post(
        f"/api/v1/brands/workspaces/{workspace_id}/brands",
        json=brand_payload(),
        headers=auth_headers,
    ).json()


def _second_user_auth_headers(client):
    """Registers and logs in a second, unrelated user."""
    payload = register_payload()
    client.post("/api/v1/auth/register", json=payload)
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": payload["email"], "password": payload["password"]},
    )
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_upload_brand_asset(client, auth_headers):
    workspace = _create_workspace(client, auth_headers)
    brand = _create_brand(client, auth_headers, workspace["id"])

    response = client.post(
        f"/api/v1/brands/{brand['id']}/assets",
        files={"file": ("logo.png", _PNG_BYTES, "image/png")},
        data={"category": "logo"},
        headers=auth_headers,
    )

    assert response.status_code == 201
    body = response.json()
    assert body["brand_id"] == brand["id"]
    assert body["category"] == "logo"
    assert body["mime_type"] == "image/png"
    assert body["url"].endswith("/file")


def test_list_brand_assets(client, auth_headers):
    workspace = _create_workspace(client, auth_headers)
    brand = _create_brand(client, auth_headers, workspace["id"])

    client.post(
        f"/api/v1/brands/{brand['id']}/assets",
        files={"file": ("logo.png", _PNG_BYTES, "image/png")},
        headers=auth_headers,
    )

    response = client.get(
        f"/api/v1/brands/{brand['id']}/assets", headers=auth_headers
    )

    assert response.status_code == 200
    assert len(response.json()) == 1


def test_download_brand_asset_file(client, auth_headers):
    workspace = _create_workspace(client, auth_headers)
    brand = _create_brand(client, auth_headers, workspace["id"])

    uploaded = client.post(
        f"/api/v1/brands/{brand['id']}/assets",
        files={"file": ("logo.png", _PNG_BYTES, "image/png")},
        headers=auth_headers,
    ).json()

    response = client.get(
        f"/api/v1/assets/{uploaded['id']}/file", headers=auth_headers
    )

    assert response.status_code == 200
    assert response.content == _PNG_BYTES
    assert response.headers["content-type"] == "image/png"


def test_delete_brand_asset(client, auth_headers):
    workspace = _create_workspace(client, auth_headers)
    brand = _create_brand(client, auth_headers, workspace["id"])

    uploaded = client.post(
        f"/api/v1/brands/{brand['id']}/assets",
        files={"file": ("logo.png", _PNG_BYTES, "image/png")},
        headers=auth_headers,
    ).json()

    delete_response = client.delete(
        f"/api/v1/assets/{uploaded['id']}", headers=auth_headers
    )
    assert delete_response.status_code == 204

    list_response = client.get(
        f"/api/v1/brands/{brand['id']}/assets", headers=auth_headers
    )
    assert list_response.json() == []


def test_reject_invalid_file_type(client, auth_headers):
    workspace = _create_workspace(client, auth_headers)
    brand = _create_brand(client, auth_headers, workspace["id"])

    response = client.post(
        f"/api/v1/brands/{brand['id']}/assets",
        files={"file": ("evil.exe", b"not a real image", "application/octet-stream")},
        headers=auth_headers,
    )

    assert response.status_code == 400


def test_brand_isolation_across_workspaces(client, auth_headers):
    """A user with no access to Brand A's workspace must not see/upload/delete its assets."""
    workspace = _create_workspace(client, auth_headers)
    brand = _create_brand(client, auth_headers, workspace["id"])

    uploaded = client.post(
        f"/api/v1/brands/{brand['id']}/assets",
        files={"file": ("logo.png", _PNG_BYTES, "image/png")},
        headers=auth_headers,
    ).json()

    other_user_headers = _second_user_auth_headers(client)

    list_response = client.get(
        f"/api/v1/brands/{brand['id']}/assets", headers=other_user_headers
    )
    assert list_response.status_code == 403

    upload_response = client.post(
        f"/api/v1/brands/{brand['id']}/assets",
        files={"file": ("logo2.png", _PNG_BYTES, "image/png")},
        headers=other_user_headers,
    )
    assert upload_response.status_code == 403

    delete_response = client.delete(
        f"/api/v1/assets/{uploaded['id']}", headers=other_user_headers
    )
    assert delete_response.status_code == 403

    file_response = client.get(
        f"/api/v1/assets/{uploaded['id']}/file", headers=other_user_headers
    )
    assert file_response.status_code == 403


def test_upload_requires_authentication(client):
    response = client.post(
        "/api/v1/brands/00000000-0000-0000-0000-000000000000/assets",
        files={"file": ("logo.png", _PNG_BYTES, "image/png")},
    )
    assert response.status_code == 401
