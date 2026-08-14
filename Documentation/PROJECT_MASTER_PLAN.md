# Prompt AI Studio
## Project Master Plan

## 1. Project Overview

**Product Name:** Prompt AI Studio  
**Short Name:** PAS  
**Persian Name:** استودیو پرامپت هوشمند  
**Tagline:** Build Your Brand's AI Brain  
**Persian Tagline:** مغز هوشمند ساخت محتوای برندها

PAS is a SaaS platform for structured Brand Intelligence, Prompt Management, Prompt Building, and AI Execution.

---

## 2. Product Vision

PAS gives every brand a reusable digital brain containing its identity, rules, products, personas, templates, and prompts.

The product evolves from deterministic brand-aware prompt construction into AI prompt optimization, content generation, and eventually an autonomous AI Brand Agent.

---

## 3. Current Project State

### Phase 0

**Status: Completed ✅**

### Phase 1

**Status: Core Complete ✅**

The working MVP now includes the main backend and frontend product flows.

The remaining Phase 1 work is primarily hardening, UX refinement, testing, and production readiness.

---

## 4. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js + TypeScript + React |
| Styling | Tailwind CSS |
| Frontend Data | Axios + TanStack React Query |
| Validation | Zod / Pydantic |
| Backend | FastAPI + Python |
| ORM | SQLAlchemy |
| Database | PostgreSQL |
| Migrations | Alembic |
| Auth | JWT |
| Architecture | Repository + Service + Provider Patterns |
| Frontend Hosting | Cloudflare / OpenNext |
| Backend Hosting | Railway |
| Version Control | GitHub |

---

## 5. Core Product Model

```text
Workspace
  └── Brand
       ├── Brand Identity
       ├── Brand Rules
       ├── Brand Assets
       ├── Products
       │    └── Product Template
       └── Personas
            └── Persona Template

Workspace
  └── Prompt Library
       ├── Prompt
       ├── Prompt Template
       └── Prompt Execution History
```

---

## 6. Prompt Builder Architecture

The deterministic Prompt Builder does not call an AI provider.

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
Deterministic Prompt Builder
        ↓
Final Prompt Text
```

API:

`POST /api/v1/prompts/build`

This separation allows the deterministic builder to remain stable while Phase 2 adds optional AI optimization on top.

---

## 7. AI Execution Architecture

```text
Saved Prompt
     ↓
Prompt Execution Service
     ↓
Provider Factory
     ↓
┌──────────┬────────────┬──────────┐
│ OpenAI   │ Anthropic  │ Gemini   │
└──────────┴────────────┴──────────┘
     ↓
Normalized Execution Result
     ↓
PromptExecution
```

The provider boundary prevents the core application from being coupled to a single AI vendor.

---

## 8. Phase 1 Functional Scope

Implemented:

- Authentication
- Workspaces
- Brand management
- Brand Brain
- Brand Rules
- Brand Assets
- Products
- Product Templates
- Personas
- Persona Templates
- Prompt Templates
- Prompt CRUD
- Prompt Library UI
- Prompt Builder API
- Prompt Builder UI
- AI Execution API
- Execution history
- Execution UI foundation

---

## 9. Phase 2 Direction

The next major product phase is **AI Prompt Optimization**.

The deterministic builder remains the source of truth for assembling brand context. AI optimization will operate as an additional intelligence layer rather than replacing the builder.

Planned Phase 2 areas:

- Prompt quality analysis
- AI optimization
- Brand-aware recommendations
- Missing information detection
- Prompt comparison
- Optimization history
- Model selection

---

## 10. Development Rules

1. Keep the deterministic core stable.
2. Add AI capabilities behind clear service/provider boundaries.
3. Prefer small, testable modules.
4. Keep frontend/backend contracts explicit.
5. Update documentation after meaningful milestones.
6. Do not move into advanced AI-agent features before the MVP is stable.
