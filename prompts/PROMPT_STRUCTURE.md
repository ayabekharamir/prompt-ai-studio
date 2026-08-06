# Prompt Structure

Defines the anatomy of a saved prompt in Prompt AI Studio, matching the
`prompts` table (`database/schema.sql`) and `Prompt` model (backend).

## Core Fields

| Field          | Type      | Description                                                  |
|----------------|-----------|-----------------------------------------------------------------|
| `id`            | UUID      | Unique identifier                                              |
| `workspace_id`  | UUID      | Owning workspace                                                |
| `brand_id`      | UUID?     | Optional linked brand (for Brand Brain context)                 |
| `template_id`   | UUID?     | Optional source template this prompt was built from             |
| `created_by`    | UUID      | User who created the prompt                                     |
| `title`         | string    | Short, human-readable label                                     |
| `content`       | text      | The final, assembled prompt text                                |
| `status`        | enum      | `draft` \| `saved` \| `archived`                                 |
| `created_at`    | timestamp | Creation time                                                    |
| `updated_at`    | timestamp | Last update time                                                 |

## Composition Flow (Phase 1 — no AI call involved)

1. User selects a **Prompt Template** (or starts from a blank prompt).
2. User selects a **Brand** to pull Brand Brain context from
   (`brand_identity` + `brand_rules`).
3. User fills in template placeholders (`{{...}}` tokens) with their
   own input.
4. The system assembles the final `content` text — this is a
   **text-assembly step**, not an AI generation step.
5. The result is saved as a `Prompt` record with `status = "saved"`.

## Future (Phase 2+)
Once AI providers are integrated (see `backend/app/services/ai/`), the
assembled `content` may optionally be sent to an AI provider to produce
a *generated output*, which would be stored as an additional field
(e.g. `generated_output`) — not part of Phase 1 scope.
