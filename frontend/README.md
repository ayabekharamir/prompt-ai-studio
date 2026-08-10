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

## Bilingual UI, RTL, dark mode & fonts

- **Language:** `src/lib/i18n/` holds the Persian/English dictionary
  (`dictionaries.ts`) and the `LanguageProvider` / `useLanguage()` hook
  (`language-context.tsx`). Every user-facing string goes through
  `t("some.key")`. The switcher lives in `components/LanguageSwitcher.tsx`
  and is wired into the Navbar and the auth pages. The chosen language is
  persisted in `localStorage` (`pas_lang`) and also drives `<html dir>` /
  `<html lang>`, so RTL/LTR now follows the language instead of being
  hardcoded to English.
- **Theme:** `src/lib/theme-context.tsx` is a small `ThemeProvider` /
  `useTheme()` pair using Tailwind's `class` dark mode strategy. Toggle via
  `components/ThemeToggle.tsx`. Persisted in `localStorage` (`pas_theme`),
  defaults to the OS preference on first visit. Components use semantic
  color tokens (`bg-surface`, `text-fg`, `border-border`, ...) defined as
  CSS variables in `globals.css` (`:root` for light, `.dark` for dark)
  instead of hardcoded `gray-*` classes, so new components get dark mode
  automatically.
- **Fonts:** Persian text uses **IRANYekan** with **Vazirmatn**
  (self-hosted via `next/font`, no setup needed) as an automatic fallback
  until you add the licensed IRANYekan files — see
  `public/fonts/iranyekan/README.md`. English text uses **Inter**.
- **RTL fixes:** `layout.tsx` no longer hardcodes `lang="en"` — it sets
  `dir`/`lang` based on the active language (with a tiny inline bootstrap
  script so there's no flash of the wrong direction on load). Components
  avoid one-directional utilities (`ml-*`, `pr-*`, `left-*`, ...) in favor
  of `gap`, logical properties (`start-*`/`end-*`), and flexbox, which
  automatically mirror correctly in both directions.

## Auth: phone number + OTP, and Google

- **Email/password** — unchanged, fully active.
- **Phone number + password** — active. Login/register now have an
  Email / Phone tab; the phone tab calls the same `/auth/login` and
  `/auth/register` endpoints with `phone_number` instead of `email`
  (the backend already supported this).
- **Phone OTP verification** — after registering with a phone number, the
  user is guided through a "verify your number" step
  (`requestPhoneOtp` / `verifyPhoneOtp` in `services/auth.service.ts`),
  calling the existing `/auth/otp/request` and `/auth/otp/verify`
  endpoints. Those endpoints currently only **mock**-send the SMS (see
  `backend/app/services/sms/sms_ir.py`) — the UI already works against
  that mock and needs no changes once a real SMS provider is activated.
- **Google Sign-In** — `components/GoogleLoginButton.tsx` uses Google
  Identity Services and needs `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (see
  `.env.example`). It posts the returned ID token to `POST /auth/google`,
  which **does not exist on the backend yet** — only the
  `oauth_provider` / `oauth_provider_id` columns are reserved on the
  `User` model. The button renders in a disabled state until the client
  ID is configured, and will start working the moment the backend route
  is implemented (contract documented at the top of
  `services/auth.service.ts`).

## Future
- Mobile application (separate codebase, will reuse `types/` contracts
  and mirror `services/` API calls).
- Implement `POST /auth/google` on the backend (Apple / Microsoft OAuth
  can follow the same pattern).
- Activate a real SMS provider for OTP delivery.
