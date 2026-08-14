# Changelog — Prompt AI Studio

All notable repository changes are documented here.

## [Unreleased] — Phase 1 MVP Core Complete

### Added

- Completed working MVP foundation across authentication, workspaces, brands, Brand Brain, products, personas, prompts, and prompt templates.
- Added deterministic Prompt Builder service with no-AI execution boundary.
- Added `POST /api/v1/prompts/build`.
- Added Brand Identity and Brand Rules injection to generated prompts.
- Added Product/Product Template and Persona/Persona Template context support.
- Added Prompt Builder frontend in Next.js.
- Added Prompt Builder types, service, hook, selector, form, and preview components.
- Added Prompt Library UI with list, edit, delete, copy, and execution navigation.
- Added AI Execution service and provider abstraction.
- Added OpenAI, Anthropic, and Gemini provider implementations.
- Added Prompt Execution persistence and execution history API.
- Added AI Execution frontend foundation.
- Added/updated frontend API infrastructure and TanStack React Query dependency.
- Added production deployment path using Railway for backend and Cloudflare/OpenNext for frontend.

### Fixed

- Fixed Prompt Builder service imports and SQLAlchemy session typing.
- Fixed deterministic Brand Brain/Brand Rules loading so generated prompts can be built from real database data.
- Fixed frontend build dependencies required by Prompt Builder.

### Current Status

Phase 0: **Complete**  
Phase 1 Core: **Complete**  
Phase 1 Hardening: **In Progress**  
Next major phase: **Phase 2 — AI Prompt Optimization**

## [0.1.0] — Documentation & Product Foundation

### Added

- Initial Brand, Product, UX, Business, AI, and technical documentation.
- GitHub repository structure and contribution/security files.

### Historical Note

The original 0.1.0 documentation release was documentation-only. The repository has since evolved into the working MVP described above.
