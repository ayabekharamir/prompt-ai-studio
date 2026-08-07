# Upload Instructions — Phase 2A (GitHub Web)

This zip contains only the 5 final Phase 2A files, at their exact
repository-root-relative paths. No patches, no bundle, no git history
inside.

```
.gitignore                         (modified - 1 line added)
backend/railway.json                (new)
backend/.env.production.example     (new)
deployment/RAILWAY.md               (new)
deployment/README.md                (modified)
```

## 1. Create the branch first

On GitHub: go to the repository → the branch dropdown (currently
showing `main`) → type `phase-2a-backend-deployment` → **Create
branch: phase-2a-backend-deployment from 'main'**.

Make sure you then switch to (are viewing) that new branch before
uploading — check the branch dropdown shows
`phase-2a-backend-deployment`, not `main`.

## 2. Upload the files

Repo → **Add file → Upload files** (while on the
`phase-2a-backend-deployment` branch).

Since 2 of these files go inside subfolders that already exist in
your repo (`backend/`, `deployment/`) and one is at the repo root:

- **Easiest**: drag the whole extracted folder from this zip (the one
  containing `backend/`, `deployment/`, and `.gitignore`) onto the
  GitHub upload page — GitHub preserves the folder structure from a
  dragged folder and will place each file at the matching path
  automatically.
- **If GitHub flattens the paths instead** (depends on browser/OS):
  upload the 3 top-level items separately so the paths stay correct:
  1. Drag `.gitignore` onto the upload page directly (repo root).
  2. Open `backend/railway.json` from this zip and use **Add file →
     Create new file** in your repo, typing the path
     `backend/railway.json`, then paste its contents. Do the same for
     `backend/.env.production.example`.
  3. Same for `deployment/RAILWAY.md` (create new file at that exact
     path, paste contents).
  4. For `deployment/README.md`, it already exists in your repo —
     open it on the `phase-2a-backend-deployment` branch, click the
     pencil (Edit), and replace its contents with the version from
     this zip (don't upload a duplicate).

Either way, double check after uploading that:
- `backend/railway.json` is inside `backend/`, not at repo root.
- `backend/.env.production.example` is inside `backend/`.
- `deployment/RAILWAY.md` is inside `deployment/`.
- `deployment/README.md` replaced (not duplicated) the existing file.
- `.gitignore` at repo root got the one added line
  (`!.env.production.example`), not overwritten in a way that drops
  the rest of its content — compare against what you already have if
  GitHub doesn't diff it inline before commit.

## 3. Commit message

GitHub Web will ask for a commit message on upload/edit screens.
Since this is a single web-upload commit (not 4 separate commits like
the git/patch route), use one combined message:

**Commit message:**
```
chore(deploy): Phase 2A - Railway production deployment configuration

- backend/railway.json: Railway build/deploy config (Dockerfile
  builder, startCommand bound to $PORT, preDeployCommand runs
  `alembic upgrade head` once per deploy, healthcheckPath=/health)
- backend/.env.production.example: production environment variable
  reference (placeholders only, no secrets)
- deployment/RAILWAY.md: full Railway + Neon deployment guide
- deployment/README.md: additive update pointing to RAILWAY.md
- .gitignore: allow the new .env.production.example template file

No application code, models, migrations, existing API routes,
Dockerfile, or frontend files were changed. Backend deployed as-is
per Phase 2A scope.
```

Make sure "Commit directly to the `phase-2a-backend-deployment`
branch" is selected (not "create a new branch" again — you already
made it in step 1).

## 4. Open the Pull Request

Repo → **Pull requests → New pull request** → base: `main`,
compare: `phase-2a-backend-deployment` → **Create pull request**.

**Suggested PR title:**
```
Phase 2A: Production Backend Deployment (Railway + Neon)
```

**Suggested PR description:**
```
## Summary
Prepares the existing FastAPI backend (unchanged) for production
deployment on Railway, connected to the existing Neon PostgreSQL
database. Documentation and deploy configuration only.

## Scope
- Railway build/deploy configuration (backend/railway.json)
- Production environment variable reference (placeholders only)
- Neon PostgreSQL connection via DATABASE_URL (no schema/model changes)
- Migration workflow: `alembic upgrade head` as a Railway pre-deploy
  command, run once per deploy (idempotent)
- Production CORS configuration for the Cloudflare Workers frontend
- Deployment documentation (deployment/RAILWAY.md)

## Not in scope / not changed
- No application code, models, or existing API routes changed
- No migration files changed
- No Dockerfile changes (start command is overridden via Railway
  config instead, so local Docker Compose is unaffected)
- Frontend deployment unchanged

## Notes
- Entry point verified as `main:app` (backend/main.py), matching the
  existing Dockerfile and docker-compose.yml - not `app.main:app`.
- ALLOWED_HOSTS is left at `*` for the first deploy (existing code
  default) and should be locked to the generated Railway domain via
  an env var change after the first successful deploy - see
  deployment/RAILWAY.md §3.
- Manual verification checklist (health check, DB connection, CORS
  from the live frontend, existing test suite) is in
  deployment/RAILWAY.md §6 - to be run after connecting real
  Railway/Neon credentials.

**Do not merge** until the checklist in RAILWAY.md §6 has been run
against the live deployment.
```

Leave the PR open (unmerged) per the Phase 2A scope.
