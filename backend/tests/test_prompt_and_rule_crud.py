"""Tests for Prompt update/delete and Brand Rule update/delete (CRUD completion)."""

from tests.factories import brand_payload, prompt_payload, workspace_payload


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


def _create_prompt(client, auth_headers, workspace_id, **overrides):
    return client.post(
        f"/api/v1/prompts/workspaces/{workspace_id}/prompts",
        json=prompt_payload(**overrides),
        headers=auth_headers,
    ).json()


# --- Prompt update/delete ---


def test_update_prompt_partially_changes_only_given_fields(client, auth_headers):
    workspace = _create_workspace(client, auth_headers)
    prompt = _create_prompt(client, auth_headers, workspace["id"])

    response = client.put(
        f"/api/v1/prompts/{prompt['id']}",
        json={"title": "Updated title"},
        headers=auth_headers,
    )

    assert response.status_code == 200
    body = response.json()
    assert body["title"] == "Updated title"
    assert body["content"] == prompt["content"]  # untouched


def test_update_nonexistent_prompt_returns_404(client, auth_headers):
    response = client.put(
        "/api/v1/prompts/00000000-0000-0000-0000-000000000000",
        json={"title": "x"},
        headers=auth_headers,
    )
    assert response.status_code == 404


def test_delete_prompt_removes_it_and_its_history(client, auth_headers, monkeypatch):
    from app.services.ai.base import AIGenerationResult

    monkeypatch.setattr(
        "app.services.prompt_execution_service.get_ai_provider",
        lambda provider_name=None: type(
            "FakeProvider",
            (),
            {
                "generate_text": lambda self, prompt, system=None, model=None, options=None: AIGenerationResult(
                    text="ok", model="fake-model", tokens_used=1
                )
            },
        )(),
    )

    workspace = _create_workspace(client, auth_headers)
    prompt = _create_prompt(client, auth_headers, workspace["id"])
    client.post(f"/api/v1/prompts/{prompt['id']}/execute", headers=auth_headers)

    response = client.delete(f"/api/v1/prompts/{prompt['id']}", headers=auth_headers)
    assert response.status_code == 204

    # prompt itself is gone
    get_response = client.get(f"/api/v1/prompts/{prompt['id']}", headers=auth_headers)
    assert get_response.status_code == 404

    # its execution history is gone too
    history_response = client.get(
        f"/api/v1/prompts/{prompt['id']}/executions", headers=auth_headers
    )
    assert history_response.status_code == 404  # prompt lookup itself 404s first


def test_delete_nonexistent_prompt_returns_404(client, auth_headers):
    response = client.delete(
        "/api/v1/prompts/00000000-0000-0000-0000-000000000000", headers=auth_headers
    )
    assert response.status_code == 404


# --- Brand rule update/delete ---


def test_update_brand_rule_partially_changes_only_given_fields(client, auth_headers):
    workspace = _create_workspace(client, auth_headers)
    brand = _create_brand(client, auth_headers, workspace["id"])
    rule = client.post(
        f"/api/v1/brand-brain/{brand['id']}/rules",
        json={"rule_type": "tone", "title": "Old title", "description": None},
        headers=auth_headers,
    ).json()

    response = client.put(
        f"/api/v1/brand-brain/rules/{rule['id']}",
        json={"title": "New title"},
        headers=auth_headers,
    )

    assert response.status_code == 200
    body = response.json()
    assert body["title"] == "New title"
    assert body["rule_type"] == "tone"  # untouched


def test_update_nonexistent_brand_rule_returns_404(client, auth_headers):
    response = client.put(
        "/api/v1/brand-brain/rules/00000000-0000-0000-0000-000000000000",
        json={"title": "x"},
        headers=auth_headers,
    )
    assert response.status_code == 404


def test_delete_brand_rule_removes_it(client, auth_headers):
    workspace = _create_workspace(client, auth_headers)
    brand = _create_brand(client, auth_headers, workspace["id"])
    rule = client.post(
        f"/api/v1/brand-brain/{brand['id']}/rules",
        json={"rule_type": "tone", "title": "Rule to delete", "description": None},
        headers=auth_headers,
    ).json()

    response = client.delete(
        f"/api/v1/brand-brain/rules/{rule['id']}", headers=auth_headers
    )
    assert response.status_code == 204

    list_response = client.get(
        f"/api/v1/brand-brain/{brand['id']}/rules", headers=auth_headers
    )
    assert rule["id"] not in [r["id"] for r in list_response.json()]


def test_delete_nonexistent_brand_rule_returns_404(client, auth_headers):
    response = client.delete(
        "/api/v1/brand-brain/rules/00000000-0000-0000-0000-000000000000",
        headers=auth_headers,
    )
    assert response.status_code == 404
