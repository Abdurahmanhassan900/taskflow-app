# Production smoke test (Render → Supabase → Vercel)

Run this **manually** after deploying or before a demo. Check each box only when you have verified it yourself.

## Prerequisites

- [ ] Backend deployed on Render with `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ALLOWED_ORIGIN`, `NODE_ENV=production`
- [ ] Frontend deployed on Vercel with `VITE_API_URL=https://<render-host>/api/v1`
- [ ] Supabase project running; pooler URL used on Render

## 1. Backend liveness

- [ ] `GET https://<render-host>/health` returns `{"status":"ok",...}`
- [ ] Note: this does **not** prove database connectivity

## 2. Database path (via API)

- [ ] `POST https://<render-host>/api/v1/auth/register` with a new email returns `201` and `accessToken`
- [ ] Or login with an existing test account succeeds

## 3. Authenticated task flow

- [ ] `GET https://<render-host>/api/v1/tasks` with `Authorization: Bearer <token>` returns `200` (array)
- [ ] `POST https://<render-host>/api/v1/tasks` creates a task
- [ ] `DELETE https://<render-host>/api/v1/tasks/<id>` soft-deletes it

## 4. Frontend (Vercel)

- [ ] Open `https://<vercel-host>/login`
- [ ] Register or log in
- [ ] Dashboard loads with task counts
- [ ] Tasks page lists tasks; create and delete work
- [ ] Logout returns to login

## 5. CORS

- [ ] No CORS errors in browser devtools when frontend calls backend
- [ ] `ALLOWED_ORIGIN` on Render exactly matches Vercel URL (no trailing slash)

## 6. Refresh flow (optional)

- [ ] After access token expiry (~15 min), or by forcing 401, frontend refresh interceptor obtains new access token
- [ ] Or `POST /api/v1/auth/refresh` with cookie returns new `accessToken`

## Sign-off

| Check | Date | Result |
|---|---|---|
| Render → Supabase → Vercel smoke test | | Pass / Fail |
| Tester | | |
