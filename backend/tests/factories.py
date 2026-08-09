"""
Lightweight test data factories.

No factory_boy/Faker dependency - just small helpers that produce unique,
valid payloads for each entity so tests stay readable and don't collide on
unique constraints (email, phone_number, slug, ...).
"""

import uuid


def unique_suffix() -> str:
    return uuid.uuid4().hex[:8]


def register_payload(**overrides) -> dict:
    suffix = unique_suffix()
    payload = {
        "full_name": f"Test User {suffix}",
        "email": f"user_{suffix}@example.com",
        "phone_number": None,
        "password": "StrongPassw0rd!",
    }
    payload.update(overrides)
    return payload


def workspace_payload(**overrides) -> dict:
    suffix = unique_suffix()
    payload = {"name": f"Workspace {suffix}"}
    payload.update(overrides)
    return payload


def brand_payload(**overrides) -> dict:
    suffix = unique_suffix()
    payload = {
        "name": f"Brand {suffix}",
        "industry": "Technology",
        "website": "https://example.com",
        "description": "A test brand.",
    }
    payload.update(overrides)
    return payload


def prompt_template_payload(**overrides) -> dict:
    suffix = unique_suffix()
    payload = {
        "title": f"Template {suffix}",
        "category": "marketing",
        "description": "A test template.",
        "template_body": "Write a {{tone}} post about {{topic}}.",
    }
    payload.update(overrides)
    return payload


def prompt_payload(**overrides) -> dict:
    suffix = unique_suffix()
    payload = {
        "title": f"Prompt {suffix}",
        "content": "Write a friendly post about our new feature.",
        "status": "draft",
    }
    payload.update(overrides)
    return payload


def execute_prompt_payload(**overrides) -> dict:
    payload = {}
    payload.update(overrides)
    return payload
