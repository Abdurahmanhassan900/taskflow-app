# Phase 1 Verification Checklist

Use this checklist before tagging `v1-platform-hosted`.

## Backend

- [ ] `cd backend && npm install`
- [ ] `npx prisma validate`
- [ ] `npx prisma migrate deploy`
- [ ] `npx prisma db seed`
- [ ] `npm test` — all tests pass
- [ ] `npm start` — server boots
- [ ] `GET /health` returns `{"status":"ok"}`
- [ ] Register + login + create task flow works via curl or frontend

## Frontend

- [ ] `cd frontend && npm install`
- [ ] `npm run build` — succeeds
- [ ] `npm run dev` — login, dashboard, tasks work against local backend

## Security

- [ ] No secrets committed (check `git log -p` for passwords)
- [ ] `GET /api/v1/tasks` without token returns 401
- [ ] User A cannot access User B's task by ID
- [ ] Member cannot access `/api/v1/admin/users`
- [ ] Error responses do not include stack traces

## Docker

- [ ] `docker compose up --build` starts backend + database
- [ ] Migrations apply on container startup
- [ ] Health check passes at `http://localhost:3000/health`

## CI/CD

- [ ] PR triggers CI workflow
- [ ] Backend tests pass in GitHub Actions
- [ ] Frontend build passes in GitHub Actions
- [ ] `RENDER_DEPLOY_HOOK_URL` secret configured (for deploy)

## Documentation

- [ ] README accurate
- [ ] `docs/DEPLOYMENT.md` accurate
- [ ] `.env.example` files complete
- [ ] CHANGELOG updated

## Release

```bash
git tag -a v1-platform-hosted -m "Phase 1 complete: TaskFlow on Vercel/Render/Supabase"
git push origin v1-platform-hosted
```

## Known limitations (documented, not blockers)

- Stateless refresh tokens
- No email verification
- No admin UI in frontend
- Render free tier cold starts
