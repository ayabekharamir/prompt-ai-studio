# Prompt AI Studio — Deployment

Deployment foundation and operational documentation.

## Files
- `docker.md` — how to run the full stack (frontend + backend + database)
  locally and how the Docker setup is structured for cloud deployment.
- `RAILWAY.md` — Phase 2A: production backend deployment on Railway,
  connected to Neon PostgreSQL.

## Current Scope

**Phase 1** focused on local development via Docker Compose
(`docker-compose.yml` at the repository root). The Docker-based
structure was built to translate directly into container deployment
later (e.g. AWS ECS/Fargate, Google Cloud Run, Railway, Render, etc.).

**Phase 2A** (current) adds production backend deployment: the
existing `backend/` service, unchanged, deployed to Railway and
connected to the existing Neon PostgreSQL database. See `RAILWAY.md`
for the full process. Frontend deployment (Cloudflare Workers) and
CI/CD automation remain out of scope for this phase.

## SaaS Scalability Notes
- Backend and frontend are fully decoupled services communicating over
  REST, so they can scale independently.
- UUID primary keys and a modular service-layer architecture (SMS, AI)
  were chosen specifically to support future horizontal scaling and
  microservice extraction without a redesign.
