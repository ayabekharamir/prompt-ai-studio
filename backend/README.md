# Prompt AI Studio — Backend (FastAPI)

REST API foundation for **Prompt AI Studio (PAS)** — Phase 1 (Development Foundation).

## Stack
- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL via SQLAlchemy
- **Auth:** JWT (access + refresh), bcrypt password hashing
- **Architecture:** Modular REST API, provider-pattern service layers for SMS and (future) AI

## Project Structure
```
backend/
├── main.py                  # App entry point, router registration
├── requirements.txt
├── Dockerfile
├── alembic.ini               # Alembic config (reads DATABASE_URL from settings)
├── alembic/
│   ├── env.py
│   └── versions/              # Migration scripts
├── pytest.ini
├── tests/                     # pytest suite (conftest, factories, test_*.py)
├── app/
│   ├── api/v1/               # Route handlers (one file per resource)
│   ├── models/                # SQLAlchemy ORM models
│   ├── schemas/                # Pydantic request/response schemas
│   ├── repositories/            # Repository Pattern - DB access per model
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── otp_service.py     # OTP logic (inactive by default)
│   │   ├── sms/                # SMS provider interface + SMS.ir implementation
│   │   └── ai/                  # AI provider interface (NOT connected yet)
│   └── core/                    # config, database, security, dependencies,
│                                 # logging, exception_handlers, security_middleware
```

## Authentication Strategy
Hybrid authentication, per Phase 1 requirements:

1. **Email + Password** (active) — JWT access & refresh tokens, bcrypt hashing.
2. **Phone + SMS OTP** (architecture ready, inactive) — via a replaceable
   `SMSProviderBase` interface, default implementation for **SMS.ir**.
   Enable by setting real `SMS_*` env vars; endpoints already exist under
   `/api/v1/auth/otp/*` but return mock results until credentials are configured.
3. **OAuth (Google / Apple / Microsoft)** — reserved fields exist on the
   `User` model and config; no provider is wired up yet.

## AI Integration Policy (Important)
**This version is NOT connected to any AI API.** The `app/services/ai/`
package only defines an abstract `AIProviderBase` interface and a factory
that currently returns `None` (`AI_PROVIDER=none`). This lets future work
plug in OpenAI, Anthropic, or others without touching business logic or
API routes.

## Getting Started (local, without Docker)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # then edit values
uvicorn main:app --reload
```

API docs available at `http://localhost:8000/docs`.

## Getting Started (Docker)
From the repository root:
```bash
docker compose up --build
```

## Environment Variables
See `.env.example` in this folder and the root `.env.example` for the full list.

## Database Migrations
Alembic is wired up against the SQLAlchemy models (`app/core/database.Base`)
and reads `DATABASE_URL` from the same settings the app uses - no separate
config to maintain.

```bash
cd backend
alembic upgrade head                 # apply all migrations
alembic revision --autogenerate -m "describe your change"   # after editing a model
alembic downgrade -1                  # roll back one migration
```

`database/schema.sql` is unchanged and remains what `docker-compose.yml`
uses to bootstrap the local Postgres container on first run. Alembic is
additive - the recommended path going forward for anyone running the
backend outside that docker-compose bootstrap (e.g. staging/production)
is `alembic upgrade head` against an empty database.

## Testing
Tests run against a real PostgreSQL database (the models use
`sqlalchemy.dialects.postgresql.UUID`, so SQLite isn't dialect-compatible
here) - point `TEST_DATABASE_URL` at a throwaway database before running:

```bash
export TEST_DATABASE_URL=postgresql://pas_user:change_me@localhost:5432/prompt_ai_studio_test
# create that database once, e.g.:
#   createdb -U pas_user prompt_ai_studio_test
pytest
```

Test tables are created/dropped once per test session; each test runs
inside a transaction that's rolled back afterwards, so tests don't leak
data into each other. See `tests/conftest.py` for the `client` and
`auth_headers` fixtures shared across the suite, and `tests/factories.py`
for request-payload builders.

## Logging & Error Handling
- `app/core/logging.py` configures structured JSON logs at startup
  (`LOG_JSON=false` for human-readable logs locally).
- `app/core/exception_handlers.py` returns a consistent
  `{"error": {"code", "message", "details"}}` envelope for HTTP errors,
  validation errors, and any unhandled exception (logged with a full
  stack trace server-side, never leaked to the client).

## Security Middleware (preparation)
`app/core/security_middleware.py` adds `TrustedHostMiddleware` and a
lightweight rate-limit middleware, both **off by default** - the same
"architecture ready, not activated" pattern already used for OTP/OAuth.
Enable via `.env`:
- `ALLOWED_HOSTS` - comma-separated hostnames (default `*`, disabled)
- `RATE_LIMIT_ENABLED=true` + `RATE_LIMIT_PER_MINUTE` - note the limiter
  is in-memory/per-process; back it with Redis before relying on it under
  multi-worker production load.

## Repository Pattern
`app/repositories/` centralizes SQLAlchemy queries behind small
model-specific classes (`UserRepository`, `WorkspaceRepository`,
`BrandRepository`, `PromptRepository`, ...) built on a generic
`BaseRepository`. `auth_service.py` and all `api/v1/*.py` routers now go
through these instead of calling `db.query(...)` directly - no route,
request/response shape, or status code changed.
