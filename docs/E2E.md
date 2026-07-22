# Playwright E2E (scaffold)

Current E2E tests live in `e2e/` and cover:

- Login and register pages render
- Unauthenticated users are redirected from `/dashboard` to `/login`
- Navigation from login to register

They do **not** yet test login, task CRUD, refresh, or the full Render → Vercel deployed stack.

## Run locally

```bash
# Terminal 1 — frontend dev server
cd frontend && npm run dev

# Terminal 2 — install browsers once, then run tests
npm install
npx playwright install chromium
npm run test:e2e
```

Optional: set `PLAYWRIGHT_BASE_URL` if not using default `http://localhost:5173`.
