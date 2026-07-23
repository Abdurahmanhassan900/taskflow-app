# TaskFlow

TaskFlow is a full-stack task manager for small teams: register, sign in, create and manage personal tasks, and (for admins) view aggregate statistics. Phase 1 targets **managed hosting** (Vercel + Render + Supabase). Phase 2 is a planned **AWS migration** documented here for architecture continuity — not yet implemented.

## The problem

Teams need a simple way to track work without heavyweight project-management tooling. TaskFlow focuses on:

- **Identity** — email/password accounts with role-based access (member vs admin).
- **Personal task lists** — each user owns their tasks; cross-user access is denied by design.
- **Operational safety** — validation, rate limits, soft delete, and tests so the API behaves predictably in production.

## Architecture

```
┌─────────────┐     HTTPS      ┌──────────────────┐     SQL       ┌─────────────┐
│   Browser   │ ─────────────► │  Express API     │ ────────────► │ PostgreSQL  │
│  React/Vite │ ◄───────────── │  (Render/Docker) │               │ (Supabase)  │
└─────────────┘   JSON + JWT   └──────────────────┘               └─────────────┘
       │                                  │
       │  Bearer access token             │  Prisma ORM
       │  httpOnly refresh cookie         │  bcrypt, Zod, Helmet
       └──────────────────────────────────┘
```

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite, Tailwind, React Router |
| Backend | Node.js 22, Express 5, Prisma 7, Zod |
| Database | PostgreSQL 15 (local/CI via Docker); Supabase in Phase 1 production |
| Auth | JWT access token (JSON) + refresh token (httpOnly cookie) |
| Containers | Docker Compose for local PostgreSQL + backend API |

**Repository layout**

| Path | Purpose |
|------|---------|
| `frontend/` | SPA — login, register, dashboard, tasks |
| `backend/` | REST API under `/api/v1` |
| `backend/prisma/` | Schema, migrations, seed |
| `e2e/` | Playwright user-journey tests |
| `docs/` | Deployment, API contract, smoke test, secret scan |

## AWS services (Phase 2 — planned)

Phase 1 does **not** run on AWS. The target Phase 2 layout:

| Service | Role |
|---------|------|
| **Route 53** | DNS for `api` / `app` hostnames |
| **ACM** | TLS certificates |
| **CloudFront** | CDN for static frontend |
| **S3** | Frontend build artifacts |
| **ALB** | HTTPS termination and routing to ECS |
| **ECS Fargate** | Containerized API |
| **RDS PostgreSQL** | Managed database |
| **Secrets Manager** | `DATABASE_URL`, JWT secrets |
| **CloudWatch** | Logs and alarms |
| **ECR** | Container images |

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for Phase 1 (Vercel/Render/Supabase) and Phase 2 notes.

## Security decisions

| Decision | Rationale |
|----------|-----------|
| **bcrypt (12 rounds)** | Industry-standard password hashing |
| **Short-lived access JWT** | Limits exposure if leaked from memory or logs |
| **Refresh JWT in httpOnly cookie** | Not readable via `document.cookie`; sent only to the API origin |
| **Stateless refresh (no rotation)** | Simpler Phase 1; refresh returns a new access token only; logout clears the cookie |
| **Ownership-scoped queries** | `findFirst({ id, userId })` before update/delete — mitigates IDOR |
| **Soft delete (`deletedAt`)** | Recoverability; not a compliance audit trail |
| **Zod validation** | Reject bad input before controllers |
| **Helmet + CORS allowlist** | Reduce common web headers/CORS mistakes |
| **Rate limiting** | Brute-force mitigation on auth and global traffic |
| **Generic 500 responses** | No stack traces to clients |
| **`X-Request-Id`** | Correlate logs without exposing internals |

**Limits (honest):** httpOnly cookies do not stop XSS from *using* an already-issued access token. `/health` is **liveness only** — it does not query PostgreSQL. Docker startup runs `prisma migrate deploy` but does not guarantee drift detection beyond migration failure.

Details: [docs/TECHNICAL_NOTES.md](docs/TECHNICAL_NOTES.md), [docs/api-contract.md](docs/api-contract.md).

## Deployment process (Phase 1)

1. **Database** — Supabase project; connection string with `?sslmode=require`.
2. **Backend** — Render Web Service from `backend/Dockerfile`; env: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ALLOWED_ORIGIN`, `NODE_ENV=production`.
3. **Frontend** — Vercel; `VITE_API_URL=https://<api-host>/api/v1`.
4. **Migrations** — `npx prisma migrate deploy` in Render build or via Docker entrypoint.
5. **Smoke test** — [docs/SMOKE_TEST.md](docs/SMOKE_TEST.md) on production URLs before tagging.

Full guide: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## CI/CD process

**CI** (`.github/workflows/ci.yml`) on pull requests to `main`:

| Job | Steps |
|-----|--------|
| `backend` | PostgreSQL service → `npm ci` → ESLint → Prisma validate → generate → migrate → tests → audit |
| `frontend` | `npm ci` → ESLint → Vitest → build → audit |
| `e2e` | PostgreSQL → generate → migrate → seed → Playwright user journey |
| `docker` | `docker compose up --build` → `/health` liveness check → `docker compose down` |

**Deploy** (`.github/workflows/deploy.yml`) on push to `main` only:

1. Requires `RENDER_DEPLOY_HOOK_URL` (workflow fails if missing).
2. Triggers Render deploy via `curl --fail-with-body`.
3. Optional `RENDER_HEALTH_URL` liveness polling after deploy.
4. Vercel production deploy when connected to the `main` branch.

**Release order** — [docs/PHASE1_CHECKLIST.md](docs/PHASE1_CHECKLIST.md):

1. Pre-merge automated gates (CI green)
2. Pre-merge manual gates (secret scan, config review)
3. Merge PR to `main`
4. Post-merge production smoke test ([docs/SMOKE_TEST.md](docs/SMOKE_TEST.md))
5. Tag `v1-platform-hosted`

Phase 1 release candidate is undergoing final verification until all checklist gates pass.

## Testing

| Suite | Command | Location |
|-------|---------|----------|
| Backend lint | `cd backend && npm run lint` | `backend/eslint.config.js` |
| Backend Prisma | `cd backend && npm run prisma:validate` | `backend/prisma/schema.prisma` |
| Backend tests | `cd backend && npm test` | `backend/tests/*.test.js` |
| Frontend unit | `cd frontend && npm test` | `frontend/src/__tests__/` |
| E2E | `npm run test:e2e` (repo root) | `e2e/user-journey.spec.ts` |
| Local Docker | `docker compose up --build` (PostgreSQL + backend only) | `docker-compose.yml` |

CI E2E tests the happy-path browser journey against a local stack. It does **not** replace post-merge production smoke testing.

Requires **Node.js 22** (see `.nvmrc`).

## Maintainer

Abdurahman Hassan — project owner and primary maintainer; DevOps and security lead; responsible for backend integration, testing, release verification, and deployment.

## Known limitations

- No refresh-token rotation or server-side session store.
- No email verification or password reset.
- Admin UI is API-only; dashboard is member-focused.
- E2E covers one happy-path journey; not full cross-browser matrix.
- `/health` does not verify database connectivity.
- Phase 2 AWS infrastructure is documented but not provisioned.

## Future improvements

- AWS Phase 2 (ECS, RDS, CloudFront, Secrets Manager).
- Refresh token rotation and/or opaque server-side sessions.
- Email flows, 2FA, structured audit logging.
- Readiness probe that checks PostgreSQL.
- Expanded E2E (admin RBAC, password change, error states).
- OpenAPI/Swagger from Zod schemas.

## Quick start (local)

**Prerequisites:** Node.js 22+, Docker (optional, for PostgreSQL and/or backend container).

```bash
# Terminal 1 — database (or use docker compose up db -d)
docker compose up db -d

# Terminal 2 — API
cd backend && cp .env.example .env
npm ci && npx prisma migrate deploy && npx prisma db seed && npm run dev

# Terminal 3 — UI (always run separately — not included in Docker Compose)
cd frontend && cp .env.example .env
npm ci && npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3000
- Seed users (password for both): `test@taskflow.local` and `admin@taskflow.local` / `local-dev-only-change-me`

**Docker Compose (PostgreSQL + backend only):**

```bash
docker compose up --build
# Backend: http://localhost:3000
# Start the frontend separately: cd frontend && npm run dev
```

Local development and CI use **PostgreSQL 15** (`postgres:15-alpine`). Supabase in production may run a different managed version.

## API overview

Base path: `/api/v1`. Contract: [docs/api-contract.md](docs/api-contract.md).

| Method | Path | Auth |
|--------|------|------|
| POST | `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout` | Public / cookie |
| PUT | `/auth/password` | Bearer |
| GET, POST | `/tasks` | Bearer |
| GET, PUT, DELETE | `/tasks/:id` | Bearer |
| GET | `/admin/users` | Bearer + ADMIN |
| PUT | `/admin/users/:id/role` | Bearer + ADMIN |
| DELETE | `/admin/users/:id` | Bearer + ADMIN |

## License

MIT — see [LICENSE](LICENSE).
