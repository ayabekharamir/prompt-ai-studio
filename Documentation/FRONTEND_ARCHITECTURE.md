# Prompt AI Studio
# Frontend Architecture

## 1. Frontend Overview

Framework: **Next.js**  
Language: **TypeScript**  
UI: **React + Tailwind CSS**  
Data/API: **Axios + TanStack React Query**  
Validation: **Zod**

The frontend follows a component-based structure designed around authenticated workspace flows.

---

## 2. Current Application Areas

```text
Authentication
Dashboard
Workspace
Brand / Brand Brain
Products
Personas
Prompt Library
Prompt Builder
AI Execution
```

---

## 3. Prompt Routes

Current prompt-related routes include:

```text
/workspace/[workspaceId]/prompts
/workspace/[workspaceId]/prompts/new
/workspace/[workspaceId]/prompts/[promptId]/execution
/workspaces/[workspaceId]/prompts/builder
```

The project currently contains both `/workspace/...` and `/workspaces/...` route conventions. This is a known cleanup item for frontend hardening; new routes should follow the convention selected during the final Phase 1 cleanup.

---

## 4. Prompt Builder Frontend

The Prompt Builder is separated into:

```text
src/types/prompts.ts
src/services/prompts.ts
src/hooks/usePromptBuilder.ts
src/components/prompts/PromptSelect.tsx
src/components/prompts/PromptBuilderForm.tsx
src/components/prompts/PromptPreview.tsx
src/app/workspaces/[workspaceId]/prompts/builder/page.tsx
```

The UI calls the deterministic backend endpoint:

`POST /api/v1/prompts/build`

The result is displayed as previewable plain text and can be copied for later use.

---

## 5. Prompt Library UI

The Prompt Library currently supports:

- List prompts
- List prompt templates
- Create prompt navigation
- Edit prompt
- Delete prompt
- Copy prompt content
- Navigate to AI Execution

Search, filtering, favorites, and advanced organization remain future UX enhancements unless explicitly required by the MVP acceptance criteria.

---

## 6. AI Execution UI

The current execution page provides:

- Execute saved prompt
- Loading state
- Error state
- Display execution result
- Load execution history

The current UI is intentionally a foundation and should be refined during Phase 1 hardening.

---

## 7. Shared Architecture

Reusable UI primitives include layout components, navigation, buttons, cards, inputs, alerts, loading states, and authentication guards.

API access is separated into service modules rather than being embedded directly in page components.

---

## 8. Production

The frontend is built with Next.js and deployed through OpenNext/Cloudflare. Backend APIs are hosted separately and accessed through the configured API base URL.
