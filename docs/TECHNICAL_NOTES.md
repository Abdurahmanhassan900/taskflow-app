# TaskFlow — Technical notes

Architecture and security behavior as implemented in Phase 1.

## Authentication

### Refresh flow (stateless JWT)

TaskFlow uses a **stateless JWT refresh flow**:

- On login or register, the API issues a short-lived **access token** in JSON and sets a longer-lived **refresh token** in an **httpOnly** cookie.
- `POST /api/v1/auth/refresh` verifies the existing refresh cookie and returns a **new access token only**.
- The endpoint does **not** issue a new refresh cookie and does **not** implement refresh-token rotation.

### httpOnly cookies

The refresh cookie is `httpOnly`, so client-side JavaScript cannot read it through `document.cookie`.

That reduces direct exposure of the refresh token to typical script access, but it does **not** prevent XSS from performing actions as the logged-in user (for example, calling the API with an already-issued access token).

### Logout

`POST /api/v1/auth/logout` clears the refresh cookie in the browser. Access tokens already issued remain valid until they expire; there is no server-side revocation list in Phase 1.

## IDOR prevention (tasks)

Task endpoints enforce ownership by scoping queries to `req.user.id` and `deletedAt: null`.

For update and delete, the code:

1. Runs an **ownership-scoped `findFirst`** (`id` + `userId` + `deletedAt: null`).
2. If found, runs **`update` by `id`** (or sets `deletedAt` for soft delete).

This is **not** an atomic `updateMany`/`deleteMany` with ownership in a single statement. A small theoretical race exists between the read and write; the pattern is acceptable for this application but should be described accurately.

## Soft delete

`deletedAt` provides **recoverability** and a **deletion state** (records can be hidden without hard delete).

It is **not** a full audit trail. A compliance-grade audit trail would also record actor identity, field-level changes, and timestamps independent of the row state.

## Health endpoint

`GET /health` is a **liveness check** only. It returns `{ "status": "ok" }` and does **not** query PostgreSQL.

It confirms the Node process is responding; it does **not** prove the database is reachable. Use a separate readiness check or manual database verification when that matters.

## Docker migrations

The Docker entrypoint runs `prisma migrate deploy` before `node index.js`. If migration fails, startup stops.

That applies pending migrations on deploy but does **not** guarantee drift-free schema, backward-compatible rollbacks, or production data consistency in every edge case.

## Automated testing scope

| Suite | What it covers | What it does not cover |
|-------|----------------|------------------------|
| `backend/tests/integration.test.js` | API auth, IDOR read, soft delete, RBAC denial, password change | Browser UI, CORS in production |
| `backend/tests/security.test.js` | Cross-user update/delete, refresh/logout, validation, admin allow/deny, error sanitization | Refresh rotation, server-side session store |
| `frontend/src/__tests__/` | Component unit tests | Full API integration |
| `e2e/user-journey.spec.ts` | Register → dashboard → create/delete task → logout → protected redirect | Admin UI, password change, refresh flow in browser, cross-browser matrix |
| CI E2E job | Same Playwright journey against local backend + frontend + PostgreSQL service | Production Render/Vercel/Supabase URLs |
| CI Docker job | Compose build, migration on startup, `/health` liveness | Frontend container, database readiness probe |

## Maintainer

Abdurahman Hassan — project owner and primary maintainer; DevOps and security lead; responsible for backend integration, testing, release verification, and deployment.
