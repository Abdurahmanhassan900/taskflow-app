# Changelog

## Unreleased

### Added
- Backend ESLint (`eslint.config.js`) with separate `npm run prisma:validate`
- Security integration tests — cross-user update/delete, refresh/logout, admin RBAC, validation, error sanitization
- Playwright user journey — register, task CRUD, logout, protected redirect
- CI jobs: E2E (Playwright + PostgreSQL) and Docker Compose stack verification
- Deploy workflow uses `curl --fail-with-body` for Render hook
- `frontend/README.md` — TaskFlow frontend guide
- Comprehensive README and Phase 1 checklist with correct pre/post-merge gates
- `.github/CODEOWNERS` — @Abdurahmanhassan900
- MIT `LICENSE`

### Changed
- **Node.js 20 → 22** — `.nvmrc`, Dockerfiles, CI, `engines` in package.json files
- Package metadata — `taskflow-app` / `taskflow-backend` / `taskflow-frontend`
- Neutralized `docs/TECHNICAL_NOTES.md` and redacted `docs/SECRET_SCAN.md`
- Removed obsolete docs (`Deployment_guide`, `Revised_plan`, `docs/E2E.md`)
- API contract and deployment docs aligned with implementation

### Security
- Prisma 7.9.0 — resolves prior `npm audit` findings on backend

## Phase 1 backend (prior)

- Prisma schema, migrations, seed
- JWT auth (access + httpOnly refresh cookie, stateless refresh)
- Task CRUD with ownership checks and soft delete
- Admin RBAC endpoints
- Integration tests, Docker Compose, GitHub Actions CI
