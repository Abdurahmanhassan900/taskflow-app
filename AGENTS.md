# AGENTS.md

## Cursor Cloud specific instructions

TaskFlow is a monorepo with two apps plus a database:

- `frontend/` — React 19 + Vite 8 SPA (dev server on port **5173**).
- `backend/` — Express 5 REST API (port **3000**), serving routes under **`/api/v1`**, backed by PostgreSQL via Prisma 6.
- PostgreSQL — stores `User` and `Task` records. Installed locally (PostgreSQL 16) in this environment.

Node 22 is installed. The dependency refresh (`npm ci` in both apps + `prisma generate` in `backend/`) runs automatically on startup via the update script.

### Architecture / contract (so the layers stay in sync)
- Backend serves everything under `/api/v1` (e.g. `/api/v1/auth/login`, `/api/v1/tasks`).
- Frontend must set `VITE_API_URL=http://localhost:3000/api/v1` (in `frontend/.env`).
- Auth = JWT access token in the `Authorization` header + a refresh token in an httpOnly cookie (so `withCredentials`/CORS `credentials:true` matter). The full contract lives in `docs/api-contract.md` — keep it in sync when you change endpoints.

### Standard commands (already in `package.json`)
- Frontend (`frontend/`): `npm run dev`, `npm run lint`, `npm run build` (build needs `VITE_API_URL`).
- Backend (`backend/`): `npm start` (= `node index.js`). No automated test suite yet (`npm test` is a placeholder).

### Database setup (one-time) + migrations
PostgreSQL is installed but **not auto-started on boot**. Start it, then ensure the dev DB/role exist and migrations are applied:

```
sudo pg_ctlcluster 16 main start
# create the dev role + db if missing (password-based, used by DATABASE_URL):
sudo -u postgres psql -c "CREATE ROLE taskflow LOGIN CREATEDB PASSWORD 'taskflow';" 2>/dev/null || true
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='taskflow'" | grep -q 1 || sudo -u postgres createdb -O taskflow taskflow
cd backend && npx prisma migrate deploy   # applies committed migrations
```

The dev role/db and any data persist in the VM snapshot; usually you just need `pg_ctlcluster ... start`. Run `npx prisma migrate deploy` after pulling new migrations.

### Running the backend
`backend/index.js` loads `backend/.env` via `dotenv`. Required vars: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ALLOWED_ORIGIN`, `PORT` (see `backend/.env.example`). Local `DATABASE_URL` is `postgresql://taskflow:taskflow@localhost:5432/taskflow`. Then:

```
cd backend && npm start
```

Verify: `curl http://localhost:3000/health` → `{"status":"ok"}`. Note `npm ci` does NOT regenerate the Prisma client, so run `npx prisma generate` after a fresh install (the update script does this).

### Running the frontend
Create `frontend/.env` with `VITE_API_URL=http://localhost:3000/api/v1`, then `npm run dev`. The auth token is held in memory (Zustand, not localStorage), so a full page reload logs you out; navigate within the SPA after logging in.

### DevOps notes (owner: this is the area under active development)
- `backend/Dockerfile` / `docker-compose.yml` predate the current backend. The app now reads `DATABASE_URL` (so compose's DB wiring will work) and needs `npx prisma generate` (and `prisma migrate deploy`) as part of the image/startup — update these when working on containerization.
- CI (`.github/workflows/ci.yml`) currently runs audit + frontend build; lint/test steps are stubbed out.
