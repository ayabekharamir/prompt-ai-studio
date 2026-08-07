# Changelog — Prompt AI Studio (Repository)

All notable changes to this **repository** are documented here, following the spirit of [Keep a Changelog](https://keepachangelog.com/).

> This is the repository-level changelog (releases, structure, GitHub setup).
> For documentation-content-specific history, see `Documentation/CHANGELOG.md`.

## [Unreleased] — Phase 1 Backend Foundation (hardening)
### Added
- Alembic migrations wired to the existing SQLAlchemy models (`backend/alembic/`), verified with upgrade/downgrade against PostgreSQL. `database/schema.sql` remains the docker-compose bootstrap script and is unchanged.
- `backend/.env.example` documenting every backend environment variable.
- Structured (JSON) logging and global FastAPI exception handlers (`backend/app/core/logging.py`, `exception_handlers.py`).
- Security middleware preparation: `TrustedHostMiddleware` and an in-memory rate limiter, both off by default (`backend/app/core/security_middleware.py`).
- Repository Pattern (`backend/app/repositories/`) - all routers and `auth_service.py` now go through repositories instead of raw `db.query(...)`.
- pytest foundation: 26 tests across auth, workspaces, brands/brand-brain, and prompts/prompt-templates, run against a real PostgreSQL test database (`backend/tests/`).
### Fixed
- `email-validator` was missing from `backend/requirements.txt`, so the app failed to boot (`EmailStr` fields in `schemas/auth.py`/`schemas/user.py`) - added.
- Registering a duplicate email/phone previously crashed with an unhandled 500; now returns 409 Conflict.
### Notes
- No route, request/response schema, or status code was changed for any existing endpoint - verified by diffing the app's route table (27 routes, unchanged) and by frontend/backend contract review (`frontend/src/services/*.ts` and `frontend/src/types/index.ts` already match the backend schemas field-for-field; no frontend changes were needed).

## [Unreleased — superseded above]
- ~~Phase 1 engineering (Next.js frontend, FastAPI backend, PostgreSQL schema) not yet started.~~ (Frontend and initial backend were implemented in a prior iteration of this repository; this changelog entry was stale.)

## [0.1.0] — 2026 — Phase 1: Documentation & Product Foundation
### Added
- Full Phase 1 documentation set across Brand, Product, Strategy, UX, Business, and AI categories (18 core documents).
- GitHub-ready repository setup: `README.md`, `LICENSE` (MIT), `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `.gitignore`.
- High-level public `ROADMAP.md` and detailed `Strategy/ROADMAP.md`.
- Bilingual (English/Persian) documentation throughout, per `Brand/BRAND_VOICE.md` guidelines.

### Scope Notes
- No application source code included in this release — by design.
- No fabricated statistics, customers, or metrics included anywhere in the repository.

## Persian Summary | خلاصه فارسی

این فایل، تاریخچه تغییرات سطح مخزن (نه صرفاً محتوای مستندات) را ثبت می‌کند. نسخه ۰.۱.۰ شامل ایجاد کامل مستندات فاز اول و آماده‌سازی مخزن برای انتشار در گیت‌هاب است. هیچ کد اجرایی در این نسخه گنجانده نشده و توسعه فنی (Phase 1 Engineering) هنوز آغاز نشده است.
