# TaskFlow

TaskFlow is a full-stack task management application with authentication, role-based access control, and secure API design. It is built for learning backend, DevOps, and DevSecOps practices.

## Architecture

```text
Browser (React + Vite)
        │
        ▼
Express API (Node.js)
        │
        ▼
PostgreSQL (Supabase in production, Docker locally)
```

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind, Zustand, Axios |
| Backend | Node.js, Express, Prisma 7, PostgreSQL |
| Auth | JWT access tokens + httpOnly refresh cookies |
| Validation | Zod |
| Testing | Node test runner, Supertest, Playwright |
| CI/CD | GitHub Actions |
| Hosting | Vercel (frontend), Render (backend), Supabase (database) |

## Quick start (local)

### Prerequisites

- Node.js 20+
- Docker (optional, for PostgreSQL)
- npm

### 1. Start the database

```bash
docker compose up db -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate deploy
npx prisma db seed
npm start
```

API available at `http://localhost:3000/api/v1`

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App available at `http://localhost:5173`

### Seed accounts (development only)

| Email | Password | Role |
|---|---|---|
| `test@taskflow.local` | `local-dev-only-change-me` | MEMBER |
| `admin@taskflow.local` | `local-dev-only-change-me` | ADMIN |

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes (prod) | Access token signing secret |
| `JWT_REFRESH_SECRET` | Yes (prod) | Refresh token signing secret |
| `ALLOWED_ORIGIN` | Yes | Frontend URL for CORS |
| `PORT` | No | Default `3000` |
| `NODE_ENV` | No | `development` or `production` |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Backend API base URL, e.g. `http://localhost:3000/api/v1` |

## API overview

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | No | Liveness check (process only; does not query the database) |
| POST | `/api/v1/auth/register` | No | Create account |
| POST | `/api/v1/auth/login` | No | Login |
| POST | `/api/v1/auth/refresh` | Cookie | Verify refresh cookie; return new access token (no refresh rotation) |
| POST | `/api/v1/auth/logout` | Cookie | Logout |
| PUT | `/api/v1/auth/password` | Yes | Change password |
| GET | `/api/v1/tasks` | Yes | List own tasks |
| POST | `/api/v1/tasks` | Yes | Create task |
| GET | `/api/v1/tasks/:id` | Yes | Get own task |
| PUT | `/api/v1/tasks/:id` | Yes | Update own task |
| DELETE | `/api/v1/tasks/:id` | Yes | Soft-delete own task |
| GET | `/api/v1/admin/users` | Admin | List users |
| PUT | `/api/v1/admin/users/:id/role` | Admin | Change user role |
| DELETE | `/api/v1/admin/users/:id` | Admin | Soft-delete user |

Full contract: `docs/api-contract.md`

## Security features

- bcrypt password hashing (12 rounds)
- Stateless JWT refresh flow: short-lived access tokens + longer-lived refresh token in an httpOnly cookie (refresh endpoint returns a new access token only; no refresh rotation)
- httpOnly refresh cookie: not readable via `document.cookie` (does not eliminate XSS risk entirely)
- Server-side auth on every protected route
- RBAC for admin endpoints
- IDOR prevention: task reads/updates/deletes preceded by ownership-scoped `findFirst` on `userId`
- Soft delete (`deletedAt`) for recoverability — not a full audit trail
- Zod input validation
- Rate limiting on auth routes
- Helmet security headers
- CORS restricted to `ALLOWED_ORIGIN`
- Request ID header (`X-Request-Id`) on every response
- Structured JSON logging (no secrets in logs)
- Safe error responses (no stack traces to clients)

## Testing

```bash
# Backend integration tests (requires PostgreSQL; API-level, not browser E2E)
cd backend && npm test

# Frontend build
cd frontend && npm run build

# Playwright scaffold (page render only; not full-stack auth/task flows yet)
npm run test:e2e
```

## Docker (full stack)

```bash
docker compose up --build
```

## Phase 1 status

Phase 1 is implemented on the `cursor/phase1-complete-e9fa` branch and is **undergoing CI, security, deployment, and end-to-end verification**. Do not merge or tag `v1-platform-hosted` until:

- GitHub Actions CI is green (backend tests + frontend build + audits)
- Manual smoke test passes against deployed backend
- `docs/PHASE1_CHECKLIST.md` is fully checked

## Phase 1 completion checkpoint (after verification)

When Phase 1 is complete, tag the repository:

```bash
git tag -a v1-platform-hosted -m "Phase 1: complete TaskFlow on Vercel/Render/Supabase"
```

## Known limitations

- Stateless JWT refresh flow without refresh-token rotation or server-side revocation list
- `GET /health` is liveness only — does not verify database connectivity
- Soft delete uses `deletedAt`; not a full audit trail (no actor/change history)
- Task updates use find-then-update, not atomic `updateMany` ownership queries
- Playwright tests are a scaffold (login/register pages render only)
- No email verification or password reset flow
- Dashboard charts are summary cards only (no graph library)
- Admin UI page not built in frontend (admin API available via API tools)
- Render free tier cold starts (~30–60s)
- Docker entrypoint runs `migrate deploy` on startup but does not guarantee drift-free production schema

## Documentation

- [Deployment guide](docs/DEPLOYMENT.md)
- [API contract](docs/api-contract.md)
- [Technical notes (accurate claims)](docs/TECHNICAL_NOTES.md)
- [Changelog](CHANGELOG.md)

## License

ISC
