# Phase 1 release checklist

Phase 1 release candidate is undergoing final verification. Production deploys from `main` after merge; **post-merge production smoke testing** is required before tagging `v1-platform-hosted`.

A staging or preview Render service may be exercised before merge if one exists, but Phase 1 does not require a separate staging architecture.

---

## A. Pre-merge automated gates

Confirm on the release branch (locally and/or via GitHub Actions CI):

- [ ] Backend: `npm ci`
- [ ] Backend: JavaScript lint (`npm run lint`)
- [ ] Backend: Prisma validation (`npm run prisma:validate`)
- [ ] Backend: Prisma client generation (`npx prisma generate`)
- [ ] Backend: migrations against test PostgreSQL (`npx prisma migrate deploy`)
- [ ] Backend: integration + security tests (`npm test`)
- [ ] Backend: `npm audit --audit-level=high`
- [ ] Frontend: `npm ci`
- [ ] Frontend: ESLint (`npm run lint`)
- [ ] Frontend: Vitest (`npm test`)
- [ ] Frontend: production build (`npm run build`)
- [ ] Frontend: `npm audit --audit-level=high`
- [ ] Root: Playwright full-stack user journey (`npm run test:e2e`)
- [ ] Docker: `docker compose up --build` — PostgreSQL healthy, migrations succeed, backend starts, `GET /health` returns `status: ok`

Local parity (Node 22):

```bash
cd backend && npm ci && npm run lint && npm run prisma:validate \
  && npx prisma generate && npx prisma migrate deploy && npm test && npm audit --audit-level=high

cd ../frontend && npm ci && npm run lint && npm test && npm run build && npm audit --audit-level=high

cd .. && npm ci && npx playwright install chromium && npm run test:e2e

docker compose up --build -d
curl -fsS http://localhost:3000/health
docker compose down
```

**What CI E2E tests:** register, dashboard, create/delete task, logout, protected redirect — against local backend, frontend, and PostgreSQL service.

**What CI E2E does not test:** production Render/Vercel/Supabase URLs, admin UI, refresh flow in the browser, or cross-browser coverage.

---

## B. Pre-merge manual / configuration gates

- [ ] Secret scan reviewed ([SECRET_SCAN.md](./SECRET_SCAN.md))
- [ ] Historically exposed credentials rotated (if applicable)
- [ ] Render environment variables verified (`DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ALLOWED_ORIGIN`, `NODE_ENV`)
- [ ] GitHub secret `RENDER_DEPLOY_HOOK_URL` configured (deploy workflow will fail without it)
- [ ] Optional: `RENDER_HEALTH_URL` configured for post-deploy liveness polling
- [ ] Diff personally reviewed on the release PR

---

## C. Merge gate

- [ ] All Section A checks green in CI
- [ ] Section B manual/configuration items complete
- [ ] PR marked **Ready for review**
- [ ] Squash merge to `main`

---

## D. Post-merge production gates

After merge, `.github/workflows/deploy.yml` runs on push to `main`. Vercel deploys from `main` when connected via Git integration.

Complete [SMOKE_TEST.md](./SMOKE_TEST.md) against **live** production URLs:

- [ ] Render deploy workflow succeeds
- [ ] Vercel production deployment succeeds
- [ ] Render `GET /health` responds with `status: ok` (liveness only)
- [ ] Registration and login reach Supabase-backed API
- [ ] Create and delete task work in production
- [ ] Logout works
- [ ] No CORS errors in browser console
- [ ] `X-Request-Id` present in API responses and matching logs
- [ ] Production smoke-test record completed and signed off

---

## E. Release gate

Tag only after Section D passes:

```bash
git checkout main && git pull
git tag -a v1-platform-hosted -m "Phase 1: Vercel + Render + Supabase"
git push origin v1-platform-hosted
```

Do **not** tag before post-merge production smoke testing.

---

## Maintainer

Abdurahman Hassan — project owner and primary maintainer; DevOps and security lead; responsible for backend integration, testing, release verification, and deployment.
