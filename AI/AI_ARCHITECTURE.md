# AI Architecture (Directional) — Prompt AI Studio

## 1. Purpose

This document provides a high-level, directional view of how the system architecture is designed to support future AI capabilities. It is **not** an implementation spec or code deliverable — Phase 1 explicitly excludes code (see repository README). It exists so that Phase 1 data structures are designed with future phases in mind.

## 2. Technology Roadmap (Reference)

| Layer | Technology |
|---|---|
| Frontend | Next.js + TypeScript |
| Backend | FastAPI (Python) |
| Database | PostgreSQL |
| Future | Native mobile application |

## 3. Conceptual Data Model (Directional, Not Final Schema)

```
Workspace
  └── Brand Brain
        ├── Identity (name, industry, audience, mission)
        ├── Tone of Voice (attributes, examples)
        ├── Content Rules (do's/don'ts, banned terms)
        └── Version History

  └── Prompt Library
        ├── Prompt
        │     ├── Title, Category, Tags
        │     ├── Body (structured fields + generated text)
        │     ├── Linked Brand Brain reference
        │     └── Version History
        └── Templates (predefined prompt structures)
```

This conceptual model is intentionally decoupled: Brand Brain and Prompt entities are separate but linked, allowing future AI services (optimization, generation) to consume either independently.

## 4. High-Level System Flow (Conceptual)

```
[User Input] 
     │
     ▼
[Frontend — Next.js/TypeScript]
     │  (calls REST API)
     ▼
[Backend — FastAPI]
     │  (business logic, validation)
     ▼
[PostgreSQL — Brand Brain + Prompt data]
     │
     ▼
[Phase 1 Output: Structured Prompt Text — copied to external AI tools]

Future (Phase 2+):
[Backend] ──► [AI Provider API] ──► [Optimization / Generation results] ──► [Stored back into Prompt Library]
```

## 5. Design Principles for AI-Readiness

1. **Decoupled API layer** — frontend and backend communicate through a documented API, allowing future AI services to be added as additional backend modules without frontend rewrites.
2. **Structured, typed data** — Brand Brain fields are structured (not free text blobs) so future AI services can reliably parse and use them.
3. **Versioning built-in** — both Brand Brain and Prompt entities support version history from Phase 1, which will be essential for AI optimization tracking in Phase 2.
4. **Provider-agnostic integration point** — the architecture reserves a clear integration boundary for future AI provider calls (Phase 2–3), rather than hardcoding a specific vendor into the core data model.

## 6. Explicitly Out of Scope (Phase 1)

- No AI model API integrations.
- No inference/generation endpoints.
- No embeddings, vector databases, or retrieval-augmented generation (RAG) infrastructure — these are anticipated in Phase 2/3 but not built in Phase 1.

## 7. Persian Summary | خلاصه فارسی

این سند یک دید معماری کلی و جهت‌گیرانه (نه پیاده‌سازی نهایی) ارائه می‌دهد تا ساختار داده‌های فاز اول از همان ابتدا برای فازهای آینده آماده باشد. پشته فناوری شامل Next.js و TypeScript در فرانت‌اند، FastAPI در بک‌اند، و PostgreSQL به‌عنوان پایگاه داده است. مدل مفهومی داده حول دو موجودیت اصلی «مغز برند» و «کتابخانه پرامپت» شکل گرفته که به‌صورت مستقل اما مرتبط طراحی شده‌اند تا سرویس‌های هوش مصنوعی آینده (بهینه‌سازی و تولید محتوا) بتوانند بدون بازطراحی اساسی به آن‌ها متصل شوند. در فاز اول هیچ اتصال مستقیمی به مدل‌های هوش مصنوعی، endpoint تولید محتوا یا زیرساخت embedding/RAG ایجاد نمی‌شود.
