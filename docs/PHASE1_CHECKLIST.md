# Phase 1 Verification Checklist

Use this checklist before tagging `v1-platform-hosted`.

**Legend:** `[x]` = verified in repo/CI · `[ ]` = still requires manual confirmation

## Backend (automated in CI)

- [x] `cd backend && npm install`
- [x] `npx prisma validate` (via `npm run lint`)
- [x] `npx prisma migrate deploy` (CI + local)
- [x] `npx prisma db seed` (local; run before manual test)
- [x] `npm test` — 7 integration tests pass
- [x] `npm start` — server boots locally
- [x] `GET /health` returns `{"status":"ok"}` (liveness only)
- [ ] Register + login + create task flow on **deployed** Render URL

## Frontend (automated in CI)

- [x] `cd frontend && npm install`
- [x] `npm run lint` — ESLint passes
- [x] `npm test` — Vitest component tests pass
- [x] `npm run build` — succeeds
- [ ] `npm run dev` — login, dashboard, tasks against **deployed** backend

## Security

- [ ] Secret scan reviewed — see `docs/SECRET_SCAN.md`
- [x] `GET /api/v1/tasks` without token returns 401 (integration test)
- [x] User A cannot access User B's task by ID (integration test)
- [x] Member cannot access `/api/v1/admin/users` (integration test)
- [x] Error responses do not include stack traces (error handler)

## Docker

- [ ] `docker compose up --build` starts backend + database (manual)
- [x] Entrypoint runs `prisma migrate deploy` (see `backend/docker-entrypoint.sh`)
- [ ] Liveness check at `http://localhost:3000/health` after compose up

## Production smoke test

- [ ] Full Render → Supabase → Vercel flow — see `docs/SMOKE_TEST.md`

## CI/CD

- [x] PR triggers CI workflow
- [x] Backend lint, tests, audit in GitHub Actions
- [x] Frontend lint, tests, build, audit in GitHub Actions
- [ ] `RENDER_DEPLOY_HOOK_URL` secret configured (for deploy)

## Documentation

- [x] README accurate
- [x] `docs/DEPLOYMENT.md` accurate
- [x] `docs/api-contract.md` matches implementation
- [x] `.env.example` files complete
- [x] CHANGELOG updated

## E2E (scaffold — not full-stack)

- [x] Playwright runs page-load and auth-redirect tests
- [ ] Playwright full login + task flow against deployed stack (future)

## Release (do not run until above manual items checked)

```bash
git tag -a v1-platform-hosted -m "Phase 1 complete: TaskFlow on Vercel/Render/Supabase"
git push origin v1-platform-hosted
```

## PR status

- [ ] PR #10 reviewed and merged to `main`
- [ ] Draft status removed after approval
