# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Prompt AI Studio — configuration

The frontend talks to the FastAPI backend. Set the API base URL before running:

```sh
cp .env.example .env
# then edit .env
VITE_API_URL=https://<railway-app>.up.railway.app/api/v1
```

Notes:

- This project runs on TanStack Start (Vite), so public env vars use the
  `VITE_` prefix instead of `NEXT_PUBLIC_`. `VITE_API_URL` is the equivalent of
  `NEXT_PUBLIC_API_URL`.
- Include the `/api/v1` suffix in the value — the client appends paths like
  `/auth/login` directly.

Then:

```sh
npm install
npm run dev
```

### Structure

- `src/lib/api.ts` — typed fetch client: base URL, bearer header, and a single
  silent `/auth/refresh` retry on 401 (clears tokens and redirects to `/login`
  when refresh fails). Add new endpoints to the exported `api` object.
- `src/context/auth.tsx` — auth provider holding the current user (`/users/me`),
  loading state, and `login` / `register` / `logout`.
- `src/routes/` — `/` (redirects), `/login`, `/register`, `/dashboard` (protected).
- `src/components/auth/` — small form primitives.
