# Changelog

## Unreleased

### Added
- Backend ESLint (`eslint.config.js`) — lint runs with `prisma validate` in CI
- Security integration tests (`backend/tests/security.test.js`) — invalid JWT, missing refresh cookie, Zod validation, admin RBAC, no stack leak on 500
- Playwright user journey (`e2e/user-journey.spec.ts`) — register, create task, delete, logout
- CI E2E job with PostgreSQL service and Playwright Chromium
- Deploy workflow health polling via optional `RENDER_HEALTH_URL`
- Comprehensive README (problem, architecture, AWS Phase 2, security, deployment, CI/CD, testing, limitations)
- `.github/CODEOWNERS` — @Abdurahmanhassan900

### Changed
- **Node.js 20 → 22** — `.nvmrc`, Dockerfiles, CI, `engines` in package.json files
- Package metadata — `taskflow-app` / `taskflow-backend` / `taskflow-frontend`, author, repository URLs
- Phase 1 checklist release order — CI → secret scan → smoke test → merge → deploy → tag
- Removed obsolete docs (`Deployment_guide`, `Revised_plan`, `frontend/README.md`, `docs/E2E.md`)
- API contract and deployment docs aligned with implementation (no branch-name references)

### Security
- Prisma 7.9.0 — resolves prior `npm audit` findings on backend

## Phase 1 backend (prior)

- Prisma schema, migrations, seed
- JWT auth (access + httpOnly refresh cookie, stateless refresh)
- Task CRUD with ownership checks and soft delete
- Admin RBAC endpoints
- Integration tests, Docker Compose, GitHub Actions CI
