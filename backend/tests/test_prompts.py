"""Tests for /api/v1/prompts and /api/v1/prompt-templates."""

from tests.factories import prompt_payload, prompt_template_payload, workspace_payload


def _create_workspace(client, auth_headers):
    return client.post(
        "/api/v1/workspaces/", json=workspace_payload(), headers=auth_headers
    ).json()


def test_create_prompt_template(client, auth_headers):
    response = client.post(
        "/api/v1/prompt-templates/",
        json=prompt_template_payload(),
        headers=auth_headers,
    )

    assert response.status_code == 201
    assert response.json()["category"] == "marketing"


def test_list_prompt_templates_filters_by_category(client, auth_headers):
    client.post(
        "/api/v1/prompt-templates/",
        json=prompt_template_payload(category="marketing"),
        headers=auth_headers,
    )
    client.post(
        "/api/v1/prompt-templates/",
        json=prompt_template_payload(category="sales"),
        headers=auth_headers,
    )

    response = client.get("/api/v1/prompt-templates/", params={"category": "sales"})

    assert response.status_code == 200
    assert all(t["category"] == "sales" for t in response.json())


def test_create_prompt(client, auth_headers):
    workspace = _create_workspace(client, auth_headers)

    response = client.post(
        f"/api/v1/prompts/workspaces/{workspace['id']}/prompts",
        json=prompt_payload(),
        headers=auth_headers,
    )

    assert response.status_code == 201
    body = response.json()
    assert body["workspace_id"] == workspace["id"]
    assert body["status"] == "draft"


def test_create_prompt_requires_authentication(client):
    response = client.post(
        "/api/v1/prompts/workspaces/00000000-0000-0000-0000-000000000000/prompts",
        json=prompt_payload(),
    )
    assert response.status_code == 401


def test_list_prompts_for_workspace(client, auth_headers):
    workspace = _create_workspace(client, auth_headers)
    client.post(
        f"/api/v1/prompts/workspaces/{workspace['id']}/prompts",
        json=prompt_payload(),
        headers=auth_headers,
    )

    response = client.get(
        f"/api/v1/prompts/workspaces/{workspace['id']}/prompts", headers=auth_headers
    )

    assert response.status_code == 200
    assert len(response.json()) == 1


def test_get_prompt_by_id(client, auth_headers):
    workspace = _create_workspace(client, auth_headers)
    created = client.post(
        f"/api/v1/prompts/workspaces/{workspace['id']}/prompts",
        json=prompt_payload(),
        headers=auth_headers,
    ).json()

    response = client.get(f"/api/v1/prompts/{created['id']}", headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["id"] == created["id"]


def test_get_nonexistent_prompt_returns_404(client, auth_headers):
    response = client.get(
        "/api/v1/prompts/00000000-0000-0000-0000-000000000000", headers=auth_headers
    )
    assert response.status_code == 404
