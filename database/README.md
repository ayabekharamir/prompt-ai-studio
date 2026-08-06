# Prompt AI Studio — Database

PostgreSQL schema foundation for **Prompt AI Studio (PAS)** — Phase 1.

## Files
- `schema.sql` — full table definitions (DDL) for the MVP data model.
- `seed.sql` — reserved for real reference data only. Contains **no
  fabricated business data**, per project rules.

## Entity Overview

| Table               | Purpose                                                        |
|---------------------|------------------------------------------------------------------|
| `users`              | Accounts. Supports email/password, phone (OTP-ready), OAuth-ready |
| `workspaces`         | Top-level SaaS tenancy unit                                     |
| `workspace_members`  | User ↔ workspace membership + role                               |
| `brands`             | Brand profiles within a workspace                                |
| `brand_identity`     | Brand Brain: descriptive identity (mission, tone, audience...)   |
| `brand_rules`        | Brand Brain: guardrails/constraints for prompt generation        |
| `prompt_templates`   | Reusable prompt skeletons, system or workspace-owned              |
| `prompts`            | Saved/generated prompts, linked to brand + template               |
| `subscriptions`      | Reserved for future billing/plan management                       |

## Conventions
- **Primary keys:** `UUID` (via `gen_random_uuid()`, `pgcrypto` extension) —
  chosen for SaaS scalability, security, and future microservices/public
  API compatibility.
- **Timestamps:** every main table has `created_at` and `updated_at`
  (`TIMESTAMPTZ`).
- **Foreign keys:** cascading deletes where child data is meaningless
  without its parent (e.g. brand data under a deleted brand); `SET NULL`
  where the reference is optional context (e.g. a prompt's template).

## Applying the Schema
Via Docker (automatic on first boot through `docker-compose.yml`):
```bash
docker compose up postgres
```

Manually:
```bash
psql -U pas_user -d prompt_ai_studio -f schema.sql
psql -U pas_user -d prompt_ai_studio -f seed.sql
```

## Migrations
Phase 1 uses this SQL file as the single source of truth. Alembic is
already included in the backend dependencies and can take over
migrations in Phase 2 as the schema evolves.
