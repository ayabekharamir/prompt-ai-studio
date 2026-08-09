# Prompt AI Studio — Frontend (Next.js 15)

Frontend foundation for **Prompt AI Studio (PAS)** — Phase 1 (Development Foundation).

## Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Package Manager:** pnpm

## Project Structure
```
frontend/
├── src/
│   ├── app/                # Next.js App Router (layout, pages, global styles)
│   ├── components/         # Reusable, presentation-only UI components
│   │   └── ui/
│   ├── features/           # Feature modules: auth, workspace, brand, prompts
│   ├── services/           # API client layer (axios) per resource
│   ├── types/               # Shared TypeScript types (mirrors backend schemas)
│   └── utils/                # Generic helper functions
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Getting Started (local, without Docker)
```bash
cd frontend
pnpm install
cp .env.example .env.local     # then edit values if needed
pnpm dev
```

App runs at `http://localhost:3000`.

## Getting Started (Docker)
From the repository root:
```bash
docker compose up --build
```

## API Integration
All backend calls go through `src/services/api.ts`, which reads the
backend base URL from `NEXT_PUBLIC_API_URL` and automatically attaches
the JWT access token (stored in `localStorage` after login) to requests.

## MVP Scope Covered in Phase 1 UI Foundation
1. Account creation (register / login)
2. Workspace creation
3. Brand profile creation
4. Brand Brain data entry (identity + rules)
5. Prompt template browsing
6. Prompt building & saving

> AI-assisted generation is **not** wired to any AI API yet — see the
> backend README for the provider-agnostic architecture prepared for it.

## Future
- Mobile application (separate codebase, will reuse `types/` contracts
  and mirror `services/` API calls).
- OAuth login buttons (Google / Apple / Microsoft) once backend providers
  are activated.
