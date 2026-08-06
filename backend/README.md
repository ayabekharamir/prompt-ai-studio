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
├── app/
│   ├── api/v1/               # Route handlers (one file per resource)
│   ├── models/                # SQLAlchemy ORM models
│   ├── schemas/                # Pydantic request/response schemas
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── otp_service.py     # OTP logic (inactive by default)
│   │   ├── sms/                # SMS provider interface + SMS.ir implementation
│   │   └── ai/                  # AI provider interface (NOT connected yet)
│   └── core/                    # config, database, security, dependencies
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
Alembic is included in `requirements.txt` for future migration management.
Phase 1 ships a plain SQL schema (`database/schema.sql`) as the source of truth;
Alembic migrations can be introduced in Phase 2 once the schema stabilizes.
