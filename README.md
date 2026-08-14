# Prompt AI Studio (PAS)

**استودیو پرامپت هوشمند**

**English Tagline:** Build Your Brand's AI Brain  
**Persian Tagline:** مغز هوشمند ساخت محتوای برندها

## 1. About

Prompt AI Studio (PAS) is a brand-intelligence and prompt-management SaaS designed to help brands build, organize, and execute brand-aware AI prompts.

The current MVP is no longer a documentation-only project. The first engineering phase is implemented as a working web application with a Next.js frontend, FastAPI backend, PostgreSQL database, deterministic Prompt Builder, and provider-based AI Execution layer.

**فارسی:**

استودیو پرامپت هوشمند یک SaaS برای مدیریت هوش برند، ساخت پرامپت‌های ساختاریافته و اجرای آن‌ها با مدل‌های هوش مصنوعی است. هسته MVP اکنون پیاده‌سازی شده و شامل فرانت‌اند Next.js، بک‌اند FastAPI، PostgreSQL، Prompt Builder بدون AI و لایه اجرای AI مبتنی بر Provider Pattern است.

## 2. Vision

To become the intelligence layer every brand uses to think, write, and create with AI — evolving from structured brand knowledge and prompt management into an AI Brand Agent platform.

## 3. Current MVP Status

**Phase 0 — Foundation:** ✅ Completed  
**Phase 1 — MVP Web Application:** ✅ Core implementation completed  
**Current focus:** Product hardening, Prompt Library UX completion, Execution UX refinement, testing, and production readiness.

### Implemented in Phase 1

- User registration and authentication
- JWT-based authentication flow
- Workspaces
- Brand management
- Brand Brain / Brand Identity
- Brand Rules
- Brand Assets
- Products and Product Templates
- Personas and Persona Templates
- Prompt Templates
- Prompt CRUD
- Deterministic Prompt Builder without AI
- Prompt Builder UI in Next.js
- Prompt Library UI
- AI Execution endpoint
- Prompt Execution persistence and history
- Provider-based AI architecture for OpenAI, Anthropic, and Gemini
- Repository and service layers
- Alembic migrations
- PostgreSQL-backed automated tests
- Production deployment configuration for Railway and Cloudflare/OpenNext

## 4. Prompt Builder

The Prompt Builder creates a final prompt deterministically from application data. It does **not** call an AI provider.

```text
Brand
+ Brand Brain
+ Brand Rules
+ Product Template + Product
+ Persona Template + Persona
+ Prompt Template
+ Task
+ Extra Context
        ↓
Final Prompt
```

API:

`POST /api/v1/prompts/build`

The generated result can be previewed, copied, edited, and saved for later AI execution.

## 5. AI Execution

Saved prompts can be sent to the AI Execution layer through:

`POST /api/v1/prompts/{prompt_id}/execute`

Execution history is available through:

`GET /api/v1/prompts/{prompt_id}/executions`

The backend uses a provider abstraction so the core execution service is not tied to a single AI vendor.

Current provider implementations include:

- OpenAI
- Anthropic
- Gemini

## 6. Main API Areas

### Authentication

- Register
- Login
- Current user
- JWT access/refresh flow

### Workspaces

- Create workspace
- List workspaces
- Get workspace

### Brands / Brand Brain

- Brand CRUD
- Brand Identity
- Brand Rules
- Brand Assets

### Products / Personas

- Product Templates
- Products
- Persona Templates
- Personas

### Prompts

- Create Prompt
- List Prompts
- Get Prompt
- Update Prompt
- Delete Prompt
- Build Prompt Without AI
- Execute Prompt
- List Prompt Executions

## 7. Frontend

The frontend is built with:

- Next.js
- TypeScript
- React
- Tailwind CSS
- Axios
- TanStack React Query
- Zod

The current frontend contains authentication, dashboard/workspace flows, Brand Brain, products, personas, Prompt Library, Prompt Builder, and AI Execution screens.

## 8. Architecture

```text
Next.js + TypeScript
        │
        │ REST API
        ▼
FastAPI
        │
        ├── API Layer
        ├── Service Layer
        ├── Repository Layer
        └── AI Provider Layer
        │
        ▼
PostgreSQL
```

AI execution is intentionally isolated behind a provider abstraction:

```text
Prompt
  ↓
Prompt Execution Service
  ↓
Provider Factory
  ↓
OpenAI / Anthropic / Gemini
  ↓
Normalized Execution Result
  ↓
PromptExecution
```

## 9. Product Evolution Roadmap

| Phase | Focus | Status |
|---|---|---|
| Phase 0 | Product, brand, UX, architecture, business foundation | ✅ Complete |
| Phase 1 | MVP web application, Brand Brain, Prompt Builder, Prompt Library, AI Execution foundation | ✅ Core complete |
| Phase 2 | AI Prompt Optimization and intelligent suggestions | ⏳ Next |
| Phase 3 | AI Content Generation | ⏳ Planned |
| Phase 4 | AI Brand Agent | ⏳ Planned |
| Phase 5 | Enterprise AI Platform | ⏳ Planned |

## 10. Repository Structure

```text
prompt-ai-studio/
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   ├── core/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   └── services/
│   │       ├── ai/
│   │       ├── sms/
│   │       └── storage/
│   └── tests/
│
├── frontend/
│   └── src/
│       ├── app/
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       ├── services/
│       └── types/
│
├── Brand/
├── Product/
├── Strategy/
├── UX/
├── Business/
├── AI/
├── Documentation/
├── database/
├── prompts/
├── templates/
└── README.md
```

## 11. Development

Backend:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Production frontend builds use OpenNext for Cloudflare.

## 12. Documentation

- `Documentation/PROJECT_MASTER_PLAN.md` — current master project state
- `Documentation/DEVELOPMENT_ROADMAP.md` — implementation roadmap and sprint status
- `Documentation/FINAL_PROJECT_CHECKLIST.md` — current completion checklist
- `Documentation/PRODUCT_ARCHITECTURE.md` — product architecture
- `Documentation/FRONTEND_ARCHITECTURE.md` — frontend architecture
- `Documentation/API_ARCHITECTURE.md` — API architecture
- `Documentation/PROMPT_ENGINE_ARCHITECTURE.md` — Prompt Builder architecture
- `AI/AI_ARCHITECTURE.md` — AI provider and future AI architecture
- `CHANGELOG.md` — repository change history

## 13. Security

See `SECURITY.md` for the repository security policy.

## 14. License

MIT License.
