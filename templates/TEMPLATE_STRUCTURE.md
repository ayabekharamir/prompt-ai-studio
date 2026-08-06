# Template Structure

## Core Fields (matches `prompt_templates` table)

| Field                | Type    | Description                                              |
|-----------------------|---------|--------------------------------------------------------------|
| `id`                    | UUID    | Unique identifier                                            |
| `workspace_id`          | UUID?   | NULL = system/global template, available to all workspaces   |
| `title`                 | string  | Template name                                                |
| `category`              | string  | See `prompts/PROMPT_CATEGORIES.md`                            |
| `description`           | text?   | What this template is for and when to use it                 |
| `template_body`         | text    | The template text containing `{{placeholder}}` tokens         |
| `is_system_template`    | boolean | True for built-in templates shipped with the product          |

## Placeholder Syntax
Templates use double-curly-brace placeholders, resolved at prompt-build
time on the frontend/backend (not by an AI model):

```
Write a {{tone}} social media caption for {{brand_name}} announcing {{topic}}.
Keep it under {{max_length}} characters and align with our brand voice: {{brand_tone_of_voice}}.
```

Two kinds of placeholders:
1. **User-input placeholders** (e.g. `{{topic}}`, `{{tone}}`) — filled in
   directly by the user through a form generated from the template.
2. **Brand Brain placeholders** (e.g. `{{brand_tone_of_voice}}`,
   `{{brand_name}}`) — auto-filled from the selected brand's
   `brand_identity` record.

## Template Lifecycle
1. System templates are seeded/managed by the product team (not fake
   sample data — see `database/seed.sql` notes).
2. Workspace-level custom templates can be created by users
   (`workspace_id` set) for reuse within their own workspace.
3. Templates are never modified by an AI model in Phase 1 — they are
   static text with placeholders, resolved through simple string
   substitution in the application layer.
