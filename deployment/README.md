# Prompt AI Studio — Deployment

Deployment foundation and operational documentation for Phase 1.

## Files
- `docker.md` — how to run the full stack (frontend + backend + database)
  locally and how the Docker setup is structured for future cloud deployment.

## Current Scope (Phase 1)
Phase 1 focuses on local development via Docker Compose
(`docker-compose.yml` at the repository root). Cloud deployment
(CI/CD, hosting provider, secrets management) is intentionally out of
scope until the MVP is validated, but the Docker-based structure is
built to translate directly into container deployment later (e.g. AWS
ECS/Fargate, Google Cloud Run, Railway, Render, etc.).

## SaaS Scalability Notes
- Backend and frontend are fully decoupled services communicating over
  REST, so they can scale independently.
- UUID primary keys and a modular service-layer architecture (SMS, AI)
  were chosen specifically to support future horizontal scaling and
  microservice extraction without a redesign.
