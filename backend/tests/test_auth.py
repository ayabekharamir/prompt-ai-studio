"""Tests for /api/v1/auth (register, login, refresh)."""

from tests.factories import register_payload


def test_register_creates_user(client):
    payload = register_payload()

    response = client.post("/api/v1/auth/register", json=payload)

    assert response.status_code == 201
    body = response.json()
    assert body["email"] == payload["email"]
    assert body["full_name"] == payload["full_name"]
    assert "id" in body
    assert "password" not in body
    assert "hashed_password" not in body


def test_register_duplicate_email_is_rejected(client):
    payload = register_payload()
    client.post("/api/v1/auth/register", json=payload)

    response = client.post("/api/v1/auth/register", json=payload)

    assert response.status_code == 409


def test_login_with_correct_credentials_returns_tokens(client):
    payload = register_payload()
    client.post("/api/v1/auth/register", json=payload)

    response = client.post(
        "/api/v1/auth/login",
        json={"email": payload["email"], "password": payload["password"]},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]
    assert body["refresh_token"]


def test_login_with_wrong_password_is_rejected(client):
    payload = register_payload()
    client.post("/api/v1/auth/register", json=payload)

    response = client.post(
        "/api/v1/auth/login",
        json={"email": payload["email"], "password": "wrong-password"},
    )

    assert response.status_code == 401


def test_refresh_token_issues_new_access_token(client):
    payload = register_payload()
    client.post("/api/v1/auth/register", json=payload)
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": payload["email"], "password": payload["password"]},
    )
    refresh_token = login_response.json()["refresh_token"]

    response = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})

    assert response.status_code == 200
    assert response.json()["access_token"]


def test_refresh_with_access_token_is_rejected(client):
    payload = register_payload()
    client.post("/api/v1/auth/register", json=payload)
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": payload["email"], "password": payload["password"]},
    )
    access_token = login_response.json()["access_token"]

    response = client.post("/api/v1/auth/refresh", json={"refresh_token": access_token})

    assert response.status_code == 401


def test_get_me_requires_authentication(client):
    response = client.get("/api/v1/users/me")
    assert response.status_code == 401


def test_get_me_returns_current_user(client):
    payload = register_payload()
    client.post("/api/v1/auth/register", json=payload)
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": payload["email"], "password": payload["password"]},
    )
    access_token = login_response.json()["access_token"]

    response = client.get(
        "/api/v1/users/me", headers={"Authorization": f"Bearer {access_token}"}
    )

    assert response.status_code == 200
    assert response.json()["email"] == payload["email"]
