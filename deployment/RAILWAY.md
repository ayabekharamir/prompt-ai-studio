# Railway Production Deployment — Phase 2A

Deploys the existing FastAPI backend (`backend/`) to Railway, connected
to the existing Neon PostgreSQL database. This document covers Phase 2A
scope only: it does not change the application, models, migrations, or
frontend.

## Scope

In scope:
- Railway service configuration for `backend/`
- Neon PostgreSQL connection via `DATABASE_URL`
- Production environment variables
- Migration workflow (`alembic upgrade head`, run once per deploy)
- Health check verification
- Production CORS configuration

Out of scope (unchanged): frontend deployment (Cloudflare Workers),
database schema/models, existing API routes, authentication pages, AI
features, Prompt Library / Workspace UI.

## 1. Railway Service Setup

1. Create a new Railway project (or a new service inside an existing
   project) from this GitHub repository.
2. **Root Directory**: set to `backend/` in the service's Settings tab.
   This is a monorepo (frontend + backend in one repo), so Railway must
   be told to build/deploy only the `backend/` subdirectory.
3. Railway will detect `backend/railway.json` automatically once the
   root directory is set. It configures:
   - **Build**: uses the existing `backend/Dockerfile` (no change to
     dependency management - still `pip install -r requirements.txt`
     inside the image).
   - **Deploy**: start command
     `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Pre-deploy**: `alembic upgrade head`, run once per deploy,
     before the app starts (see §4).
   - **Health check**: `GET /health`.

### Why `main:app` and not `app.main:app`

The FastAPI instance is defined in `backend/main.py` (repository root
of the backend, not inside the `app/` package). The existing
`Dockerfile` and `docker-compose.yml` already use `main:app` - this
deployment config matches that, unchanged.

### Why the start command overrides the Dockerfile's `CMD`

The Dockerfile's `CMD` hardcodes `--port 8000`, which works for local
Docker Compose but not for Railway, which assigns a dynamic port via
the `$PORT` environment variable. Rather than editing the Dockerfile
(which would change the local dev/Docker Compose flow), the Railway
`startCommand` explicitly binds to `$PORT`. Railway's deploy config
takes priority over the image's `CMD`, so no Dockerfile change is
needed.

## 2. Environment Variables

Set these in the Railway service's **Variables** tab. See
`backend/.env.production.example` for the full reference with inline
notes. Never commit real values to the repository.

| Variable | Value | Notes |
|---|---|---|
| `ENVIRONMENT` | `production` | |
| `DATABASE_URL` | Neon connection string | From the Neon dashboard -> Connection Details. Must include `?sslmode=require`. |
| `SECRET_KEY` | strong random value | Generate with `openssl rand -hex 32`. Must not be the dev default. |
| `JWT_ALGORITHM` | `HS256` | Matches existing default. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Matches existing default. |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `30` | Matches existing default. |
| `CORS_ORIGINS` | `["https://prompt-ai-studio-page.ayabekharam-ir.workers.dev"]` | **Must be a JSON array string** - `app/core/config.py` declares `CORS_ORIGINS: List[str]`, and pydantic-settings parses list-typed env vars as JSON, not comma-separated text. A bare string here will fail at startup. |
| `ALLOWED_HOSTS` | `*` for the first deploy | See §3. |
| `LOG_LEVEL` | `INFO` | |
| `LOG_JSON` | `true` | |
| `RATE_LIMIT_ENABLED` | `false` | Existing Phase 1 default - the in-memory limiter isn't safe for multi-instance; leave off unless explicitly needed. |

`PORT` is injected automatically by Railway - do not set it manually.

## 3. `ALLOWED_HOSTS` — two-step rollout

The Railway-generated domain (e.g. `your-service.up.railway.app`) is
only known **after** the first successful deploy, so:

1. **First deploy**: leave `ALLOWED_HOSTS=*` (this is also the
   existing code default in `app/core/config.py` — no behavior change
   from Phase 1). `TrustedHostMiddleware` is a no-op while this is `*`
   (see `app/core/security_middleware.py`).
2. **After the first deploy succeeds** and the Railway domain is
   visible in the dashboard, update the `ALLOWED_HOSTS` variable to
   that domain (comma-separated if a custom domain is added later),
   e.g.:
   ```
   ALLOWED_HOSTS=your-service.up.railway.app
   ```
   This is a Railway dashboard variable change only - no code or
   `railway.json` change required, and no redeploy of new code, only
   a restart with the new variable.

## 4. Database Migrations

`backend/railway.json` runs `alembic upgrade head` as a Railway
**pre-deploy command** - a first-class Railway feature that runs
once per deploy, after the build and before the new app instance
starts receiving traffic (not on every container restart or replica
scale-up).

Because `alembic upgrade head` is idempotent (it only applies
revisions after the database's current one), this satisfies "run
once, only actually change things when a new migration exists"
without any extra scripting:
- First production deploy: applies the existing initial migration
  (`3686d8f6d714_initial_schema_users_workspaces_brands_...`) to
  Neon, creating the schema.
- Every subsequent deploy with no new migration: the command runs,
  sees the database is already at `head`, and exits immediately -
  no schema change, no risk.
- A future deploy that includes a new migration file: it's applied
  automatically at that deploy, same as above.

If a pre-deploy command fails, Railway does **not** proceed to start
the app (deployment is aborted, previous version keeps serving) - so
a bad migration cannot take the API down.

No changes were made to `alembic.ini`, `alembic/env.py`, or any
migration file. `alembic/env.py` already reads `settings.DATABASE_URL`
directly, so it automatically uses whatever `DATABASE_URL` Railway
injects at runtime - no separate migration-specific configuration is
needed.

## 5. Health Check

`GET /health` already exists in `backend/main.py` and returns:
```json
{"status": "ok"}
```
Railway's `healthcheckPath` in `railway.json` points at this route
directly - no new endpoint was created.

## 6. Verification Checklist (run after connecting Railway + Neon)

These steps must be run by a human with live access to Railway and
Neon - this deployment config was prepared and statically reviewed,
but not executed against a live Railway/Neon environment.

1. **Backend starts**: Railway deployment logs show
   `app_startup` (JSON log line from `app/core/logging.py`) with no
   traceback, and the deployment status turns "Active".
2. **Database connection works**: the pre-deploy `alembic upgrade
   head` step in the deploy log completes without a connection error
   (a connection failure here means `DATABASE_URL` or Neon SSL/network
   settings are wrong).
3. **Alembic works**: deploy log shows either
   `Running upgrade -> 3686d8f6d714, ...` (first run) or no output
   (already at head) - not an error.
4. **Health endpoint works**:
   ```bash
   curl https://<your-railway-domain>/health
   # Expect: {"status":"ok"}
   ```
5. **CORS works from the real frontend**: open
   `https://prompt-ai-studio-page.ayabekharam-ir.workers.dev`, trigger
   a request to the backend (e.g. the login/register flow) from the
   browser, and confirm no CORS error in the browser console.
6. **Existing test suite still passes** (unchanged by this PR):
   ```bash
   cd backend
   export TEST_DATABASE_URL=<a disposable Postgres database>
   pytest
   ```

## 7. Rollback

Railway keeps previous deployments. If a deploy fails health checks
or the pre-deploy migration fails, Railway does not cut traffic over
to it - the previous deployment keeps serving. To roll back a bad
deploy that did go live, use Railway's "Redeploy" on the last known
good deployment from the service's Deployments tab.
