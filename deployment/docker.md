# Docker Guide

## Services
Defined in the root `docker-compose.yml`:

| Service    | Description                          | Port  |
|------------|---------------------------------------|-------|
| `postgres` | PostgreSQL 16 database                | 5432  |
| `backend`  | FastAPI application                    | 8000  |
| `frontend` | Next.js application                    | 3000  |

## Quick Start
```bash
# From the repository root
cp .env.example .env
# edit .env with real values

docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API docs: http://localhost:8000/docs
- Postgres: localhost:5432 (credentials from `.env`)

## Database Initialization
On first boot, `postgres` automatically runs `database/schema.sql` then
`database/seed.sql` via the standard Postgres image's
`/docker-entrypoint-initdb.d/` mechanism. To re-apply the schema after
changes, remove the named volume and restart:

```bash
docker compose down -v
docker compose up --build
```

## Rebuilding a Single Service
```bash
docker compose build backend
docker compose up backend
```

## Environment Variables
All services read from the root `.env` file (see `.env.example`).
Never commit a real `.env` file — it's already excluded via `.gitignore`.

## Notes for Future Cloud Deployment
- Replace the `postgres` service with a managed database
  (e.g. RDS, Cloud SQL) and point `DATABASE_URL` to it.
- Build backend/frontend images via the existing Dockerfiles in CI and
  push to a container registry.
- Introduce a reverse proxy / API gateway when adding the future mobile
  application client and additional services.
