# Changelog

All notable changes to TaskFlow are documented in this file.

## [1.0.0] - Unreleased — Phase 1 (in verification)

Phase 1 is implemented on branch `cursor/phase1-complete-e9fa` and is undergoing CI, security, deployment, and end-to-end verification. **Do not merge or tag until CI is green and manual checks pass.**

### Added

- Prisma 7 schema with User and Task models, enums, UUIDs, soft-delete, and migrations
- JWT authentication (register, login, refresh, logout)
- Password change endpoint (`PUT /api/v1/auth/password`)
- Protected task CRUD with ownership checks (IDOR prevention)
- Admin endpoints: list users, change roles, soft-delete users
- RBAC middleware for admin routes
- Zod input validation on auth and task routes
- Centralized error handling with safe client responses
- Request ID middleware (`X-Request-Id` header)
- Structured JSON logging
- Rate limiting (global + auth routes)
- Backend integration tests (auth, tasks, IDOR, soft-delete, RBAC)
- Docker entrypoint with automatic migrations
- Frontend task create/delete and live dashboard stats
- Playwright E2E test scaffold
- README, DEPLOYMENT.md, and environment variable documentation

### Security

- Removed hardcoded database credentials from application code
- bcrypt password hashing (12 rounds)
- httpOnly refresh token cookies
- Production requires `JWT_SECRET` and `JWT_REFRESH_SECRET`

### Known limitations

- Stateless JWT refresh flow (no refresh-token rotation; no server-side revocation list)
- `GET /health` is liveness only — does not query PostgreSQL
- Soft delete via `deletedAt` — not a full audit trail
- Playwright E2E is a scaffold (page render checks only)
- No email verification or password reset
- Admin UI not implemented in frontend

## [0.2.0] - 2026-07-18

### Added

- Prisma 7 migration and seed data
- Initial JWT auth foundation

## [0.1.0] - 2026-06

### Added

- React frontend with login, register, dashboard, and tasks UI
- Express backend skeleton
- Deployment documentation for Vercel/Render/Supabase
