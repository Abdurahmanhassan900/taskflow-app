# AGENTS.md

## Cursor Cloud specific instructions

TaskFlow is a monorepo with two apps plus a database:

- `frontend/` — React 19 + Vite 8 SPA (dev server on port **5173**).
- `backend/` — Express 5 REST API (port **3000**), talks to PostgreSQL via Prisma + `@prisma/adapter-pg`.
- PostgreSQL — stores tasks. Installed locally (PostgreSQL 16) in this environment.

Node 22 is installed; the dependency refresh (`npm ci` in both apps + `prisma generate` in `backend/`) runs automatically on startup via the update script.

### Standard commands (already documented in `package.json`)
- Frontend: `npm run dev`, `npm run lint`, `npm run build` (build needs `VITE_API_URL`), in `frontend/`.
- Backend: `npm start` (`node index.js`) in `backend/`. There is no real test suite (`npm test` is a placeholder; CI in `.github/workflows/ci.yml` only lints/audits/builds).

### Starting Postgres (not auto-started on boot)
PostgreSQL is installed but its cluster is not started automatically. Start it with:

```
sudo pg_ctlcluster 16 main start
```

SSL is enabled by default (snakeoil cert), which the backend requires (see below). A local login role and seeded `Task` table already exist in the `postgres` database:
- role: `postgres.cwlrardjyfxneexevlmm`, password: `DevSecOps21` (superuser)
- table: `"Task"(id serial pk, title text, completed boolean)`

### Running the backend (important gotchas)
`backend/index.js` does **not** use `dotenv`, so a `.env` file is ignored — pass env vars on the command line. It also **hardcodes** the DB user (`postgres.cwlrardjyfxneexevlmm`) and **always connects with SSL**; it ignores `DATABASE_URL` and instead reads `DB_HOST`/`DB_PORT`/`DB_PASSWORD`/`DB_NAME`. To run against local Postgres:

```
cd backend
DB_HOST=localhost DB_PORT=5432 DB_PASSWORD=DevSecOps21 DB_NAME=postgres \
  ALLOWED_ORIGIN=http://localhost:5173 JWT_SECRET=dev_secret PORT=3000 node index.js
```

Verify: `curl http://localhost:3000/health` → `{"status":"ok"}`, `curl http://localhost:3000/api/tasks` → JSON array of tasks. `npm ci` does NOT regenerate the Prisma client, so run `npx prisma generate` in `backend/` after a fresh install (the update script does this).

### Running the frontend
Create `frontend/.env` with `VITE_API_URL=http://localhost:3000/api`, then `npm run dev`. The `/api` suffix matters: the frontend calls paths like `/tasks`, while the backend serves them under `/api`.

### Known pre-existing app bugs (NOT environment issues — out of scope for setup)
These are code-level issues in the repo that block a full authenticated UI flow; do not "fix" them as part of environment setup:
- The backend only implements `GET /health` and `GET /api/tasks`. The auth routes the frontend calls (`/auth/login`, `/auth/register`, `/auth/refresh`) are not wired up. `backend/controllers/authController.js` is TypeScript written in a `.js` CommonJS file and is never imported.
- `backend/package.json` historically omitted runtime deps that `index.js` requires (`@prisma/client`, `@prisma/adapter-pg`, `helmet`, `cors`, `express-rate-limit`); these are now declared so the API can start.
- `frontend/src/store/authStore.ts` does not persist the token, so protected routes (`/dashboard`, `/tasks`) cannot be reached without a working login. As a result the UI can be exercised up to the login/register screens; the tasks data flow is best demonstrated directly against the backend API.
