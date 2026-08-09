"""
Shared pytest fixtures.

Test database: the models use PostgreSQL-specific column types
(sqlalchemy.dialects.postgresql.UUID), so tests run against a real
PostgreSQL database rather than SQLite - this matches production and
avoids subtle dialect differences.

Point TEST_DATABASE_URL at a throwaway database before running pytest, e.g.:

    export TEST_DATABASE_URL=postgresql://pas_user:change_me@localhost:5432/prompt_ai_studio_test
    pytest

If unset, it defaults to the value below (matches the docker-compose
`postgres` service credentials, with a `_test` suffixed database name).
The database itself must already exist; tests create/drop tables in it
but do not create the database.

Isolation: each test runs inside its own transaction that is rolled back
on teardown (nested SAVEPOINT pattern), so tests never see each other's
data and the schema only needs to be created once per test session.
"""

import os

import pytest
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker

os.environ.setdefault(
    "DATABASE_URL",
    os.environ.get(
        "TEST_DATABASE_URL",
        "postgresql://pas_user:change_me@localhost:5432/prompt_ai_studio_test",
    ),
)

from app.core.database import Base, get_db  # noqa: E402

# Import every model so Base.metadata is fully populated before create_all.
from app.models import (  # noqa: E402, F401
    user,
    workspace,
    brand,
    brand_identity,
    brand_rules,
    prompt_template,
    prompt,
    prompt_execution,
)

TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL",
    "postgresql://pas_user:change_me@localhost:5432/prompt_ai_studio_test",
)


@pytest.fixture(scope="session")
def engine():
    engine = create_engine(TEST_DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture()
def db_session(engine):
    connection = engine.connect()
    transaction = connection.begin()
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=connection)
    session = SessionLocal()

    # Support code under test calling session.commit() without actually
    # persisting past the outer transaction - restart a SAVEPOINT each time.
    session.begin_nested()

    @event.listens_for(session, "after_transaction_end")
    def restart_savepoint(sess, trans):
        if trans.nested and not trans._parent.nested:
            sess.begin_nested()

    yield session

    session.close()
    if transaction.is_active:
        transaction.rollback()
    connection.close()


@pytest.fixture()
def client(db_session):
    from fastapi.testclient import TestClient
    from main import app  # backend/main.py - module-level FastAPI() instance

    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def auth_headers(client):
    """Registers a fresh user, logs in, and returns a ready-to-use auth header."""
    from tests.factories import register_payload

    payload = register_payload()
    client.post("/api/v1/auth/register", json=payload)
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": payload["email"], "password": payload["password"]},
    )
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
