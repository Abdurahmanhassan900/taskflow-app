# TaskFlow — Accurate Technical Notes

Use this document when explaining or interviewing about TaskFlow. Wording here matches the actual implementation.

## Authentication

### Refresh flow (stateless JWT)

TaskFlow has a **stateless JWT refresh flow**.

- On login/register, the API issues a short-lived **access token** (JSON) and sets a longer-lived **refresh token** in an **httpOnly** cookie.
- `POST /api/v1/auth/refresh` verifies the existing refresh cookie and returns a **new access token only**.
- It does **not** issue a new refresh cookie and does **not** implement refresh-token rotation.

Do **not** say: “TaskFlow implements refresh-token rotation.”

### httpOnly cookies

The refresh cookie is `httpOnly`, so **client-side JavaScript cannot read it directly**.

That reduces exposure of the refresh token to typical `document.cookie` access, but it does **not** prevent XSS. Malicious script could still perform actions as the logged-in user (for example, calling the API with existing credentials).

## IDOR prevention (tasks)

Task endpoints enforce ownership by scoping queries to `req.user.id` and `deletedAt: null`.

For update and delete, the code:

1. Runs an **ownership-scoped `findFirst`** (`id` + `userId` + `deletedAt: null`).
2. If found, runs **`update` by `id`** (or sets `deletedAt` for soft delete).

This is **not** an atomic `updateMany`/`deleteMany` with ownership in a single statement. There is a small theoretical race between the read and write; for this app the pattern is acceptable, but describe it accurately.

## Soft delete

`deletedAt` provides **recoverability** and a **deletion state** (records can be hidden without hard delete).

It is **not** a full audit trail. A genuine audit trail would also record who performed the action, what changed, and often when/why.

## Health endpoint

`GET /health` is a **liveness check** only. It returns `{ "status": "ok" }` and does **not** query PostgreSQL.

It confirms the Node process is responding; it does **not** prove the database is currently reachable. Use a separate readiness check or manual DB verification when you need that.

## Docker migrations

The Docker entrypoint runs `prisma migrate deploy` before `node index.js`. If migration fails, startup stops.

That helps apply pending migrations on deploy, but it does **not** guarantee drift-free schema, backward-compatible rollbacks, or that production data matches every edge case. Treat migrations as a deploy step to verify, not a blanket guarantee.

## End-to-end tests

The Playwright suite is a **scaffold only**. Current tests verify that login and register **pages render**.

They do **not** yet test login, task create/delete, refresh, or authorization through the full deployed stack.

## Backend integration tests

`backend/tests/integration.test.js` exercises the API with Supertest against a real PostgreSQL database (auth, IDOR, soft delete, RBAC). These are **not** full-stack E2E tests.
