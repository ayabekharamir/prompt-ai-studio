# features/

Feature-based modules. Each subfolder groups the components, hooks and
local logic for one product area, matching the MVP flow:

- `auth/` — sign up, login, session handling
- `workspace/` — workspace creation & switching
- `brand/` — brand profile CRUD + Brand Brain (identity & rules) forms
- `prompts/` — template selection, prompt builder, saved prompts list

Keep feature folders self-contained; shared UI goes in `components/`,
shared API calls go in `services/`, shared types go in `types/`.
