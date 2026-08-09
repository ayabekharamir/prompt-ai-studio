"""Tests for POST /api/v1/prompts/{prompt_id}/execute and execution history."""

import pytest

from app.services.ai.base import AIGenerationResult
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


class _FakeProvider:
    """Stand-in AI provider used to test orchestration without real API calls."""

    def __init__(self, text="Generated caption.", model="fake-model", tokens_used=42):
        self.text = text
        self.model = model
        self.tokens_used = tokens_used
        self.last_call = None

    def generate_text(self, prompt, system=None, model=None, options=None):
        self.last_call = {
            "prompt": prompt,
            "system": system,
            "model": model,
            "options": options,
        }
        return AIGenerationResult(
            text=self.text, model=model or self.model, tokens_used=self.tokens_used
        )


def test_execute_prompt_requires_authentication(client):
    response = client.post(
        "/api/v1/prompts/00000000-0000-0000-0000-000000000000/execute"
    )
    assert response.status_code == 401


def test_execute_nonexistent_prompt_returns_404(client, auth_headers, monkeypatch):
    monkeypatch.setattr(
        "app.services.prompt_execution_service.get_ai_provider",
        lambda provider_name=None: _FakeProvider(),
    )
    response = client.post(
        "/api/v1/prompts/00000000-0000-0000-0000-000000000000/execute",
        headers=auth_headers,
    )
    assert response.status_code == 404


def test_execute_prompt_without_ai_provider_configured_returns_502(client, auth_headers):
    workspace = _create_workspace(client, auth_headers)
    prompt = _create_prompt(client, auth_headers, workspace["id"])

    # No AI_PROVIDER / API key configured in the test environment by default.
    response = client.post(
        f"/api/v1/prompts/{prompt['id']}/execute", headers=auth_headers
    )

    assert response.status_code == 502


def test_execute_prompt_returns_generated_text_and_saves_history(
    client, auth_headers, monkeypatch
):
    fake_provider = _FakeProvider(text="Shiny new caption!", tokens_used=17)
    monkeypatch.setattr(
        "app.services.prompt_execution_service.get_ai_provider",
        lambda provider_name=None: fake_provider,
    )

    workspace = _create_workspace(client, auth_headers)
    prompt = _create_prompt(client, auth_headers, workspace["id"])

    response = client.post(
        f"/api/v1/prompts/{prompt['id']}/execute", headers=auth_headers
    )

    assert response.status_code == 201
    body = response.json()
    assert body["prompt_id"] == prompt["id"]
    assert body["output_text"] == "Shiny new caption!"
    assert body["tokens_used"] == 17
    assert body["status"] == "completed"


def test_execute_prompt_injects_brand_brain_into_system_context(
    client, auth_headers, monkeypatch
):
    fake_provider = _FakeProvider()
    monkeypatch.setattr(
        "app.services.prompt_execution_service.get_ai_provider",
        lambda provider_name=None: fake_provider,
    )

    workspace = _create_workspace(client, auth_headers)
    brand = _create_brand(client, auth_headers, workspace["id"])
    client.post(
        f"/api/v1/brand-brain/{brand['id']}/rules",
        json={"rule_type": "tone", "title": "Professional tone", "description": None},
        headers=auth_headers,
    )
    prompt = _create_prompt(
        client, auth_headers, workspace["id"], brand_id=brand["id"]
    )

    response = client.post(
        f"/api/v1/prompts/{prompt['id']}/execute", headers=auth_headers
    )

    assert response.status_code == 201
    system_context = fake_provider.last_call["system"]
    assert brand["name"] in system_context
    assert "Professional tone" in system_context


def test_list_prompt_executions_returns_history(client, auth_headers, monkeypatch):
    fake_provider = _FakeProvider()
    monkeypatch.setattr(
        "app.services.prompt_execution_service.get_ai_provider",
        lambda provider_name=None: fake_provider,
    )

    workspace = _create_workspace(client, auth_headers)
    prompt = _create_prompt(client, auth_headers, workspace["id"])

    client.post(f"/api/v1/prompts/{prompt['id']}/execute", headers=auth_headers)
    client.post(f"/api/v1/prompts/{prompt['id']}/execute", headers=auth_headers)

    response = client.get(
        f"/api/v1/prompts/{prompt['id']}/executions", headers=auth_headers
    )

    assert response.status_code == 200
    assert len(response.json()) == 2
