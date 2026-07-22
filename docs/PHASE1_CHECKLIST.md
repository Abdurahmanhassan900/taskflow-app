# Phase 1 release checklist

Use this order before calling Phase 1 complete. Do not tag `v1-platform-hosted` until every step passes.

## 1. Automated verification (CI)

On the release branch, confirm GitHub Actions **CI** is green:

- [ ] Backend: ESLint, Prisma validate, migrations, integration tests, security tests, `npm audit --audit-level=high`
- [ ] Frontend: ESLint, Vitest, production build, audit
- [ ] E2E: Playwright user journey (register → create task → delete → logout)

Local parity (Node 22):

```bash
cd backend && npm ci && npm run lint && npm test && npm audit --audit-level=high
cd frontend && npm ci && npm run lint && npm test && npm run build && npm audit --audit-level=high
npm ci && npx playwright install chromium && npm run test:e2e
```

## 2. Secret scan sign-off

Follow [SECRET_SCAN.md](./SECRET_SCAN.md). Confirm no live credentials in git history or env files committed to the repo.

- [ ] Scan completed and documented

## 3. Production smoke test

Follow [SMOKE_TEST.md](./SMOKE_TEST.md) against **live** Render + Vercel + Supabase URLs (not localhost).

- [ ] Register / login / refresh / logout
- [ ] Task CRUD
- [ ] Admin endpoints (if admin user exists)
- [ ] CORS from Vercel origin to API

## 4. Merge to main

- [ ] PR reviewed and merged to `main`
- [ ] No blocking open issues for Phase 1 scope

## 5. Deploy

- [ ] Deploy runs on push to `main` (or trigger **Deploy** workflow manually)
- [ ] Optional: `RENDER_DEPLOY_HOOK_URL` triggers backend redeploy
- [ ] Optional: `RENDER_HEALTH_URL` returns 200 after deploy
- [ ] Vercel production deploy succeeds

## 6. Tag release

Only after steps 1–5:

```bash
git checkout main && git pull
git tag -a v1-platform-hosted -m "Phase 1: Vercel + Render + Supabase"
git push origin v1-platform-hosted
```

## Post-release

- Monitor Render and Vercel logs for 24h
- File issues for Phase 2 (AWS) separately — not part of this checklist
