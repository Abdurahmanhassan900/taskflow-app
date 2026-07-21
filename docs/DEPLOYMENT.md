# Deployment Guide

Deploy TaskFlow across three platforms: **Supabase** (database), **Render** (backend), and **Vercel** (frontend).

## Architecture

```text
[ Browser ]
    │
    ▼
[ Vercel ] — React frontend (static)
    │
    │ HTTPS API requests
    ▼
[ Render ] — Node.js/Express backend (Docker)
    │
    │ TCP port 6543 (Supabase pooler)
    ▼
[ Supabase ] — PostgreSQL database
```

## Prerequisites

Create accounts at:

- [github.com](https://github.com)
- [supabase.com](https://supabase.com)
- [render.com](https://render.com)
- [vercel.com](https://vercel.com)

## Step 1 — Database (Supabase)

1. Create a new Supabase project and save the database password.
2. Copy the **Transaction pooler** connection string (port **6543**).
3. Set this as `DATABASE_URL` on Render.

Example:

```text
postgresql://postgres.xxxx:[PASSWORD]@aws-0-us-west-2.pooler.supabase.com:6543/postgres
```

## Step 2 — Backend (Render)

1. Create a **Web Service** connected to your GitHub repo.
2. Settings:
   - **Runtime:** Docker
   - **Root Directory:** `backend`
   - **Dockerfile Path:** `Dockerfile`
3. Environment variables:

| Key | Value |
|---|---|
| `DATABASE_URL` | Supabase pooler connection string |
| `JWT_SECRET` | Random 32+ char string (`openssl rand -base64 32`) |
| `JWT_REFRESH_SECRET` | Different random 32+ char string |
| `ALLOWED_ORIGIN` | Your Vercel URL (set after Step 3) |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |

4. Deploy and verify: `GET https://your-render-url.onrender.com/health`

The Docker entrypoint runs `prisma migrate deploy` automatically on startup.

## Step 3 — Frontend (Vercel)

1. Import the repo, set **Root Directory** to `frontend`.
2. Framework: **Vite**.
3. Environment variable:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://your-render-url.onrender.com/api/v1` |

4. Deploy and copy your Vercel URL.

## Step 4 — Wire CORS

On Render, set `ALLOWED_ORIGIN` to your exact Vercel URL (no trailing slash). This triggers a redeploy.

## Step 5 — CI/CD

### CI (Pull Requests)

`.github/workflows/ci.yml` runs on every PR:

- Backend: install, Prisma generate, migrate, tests, npm audit
- Frontend: install, build, npm audit

### Deploy (merge to main)

`.github/workflows/deploy.yml` triggers Render via deploy hook.

Set `RENDER_DEPLOY_HOOK_URL` in GitHub Actions secrets.

## Pre-demo checklist

Render free tier sleeps after 15 minutes of inactivity.

1. Visit `https://your-render-url.onrender.com/health` 5 minutes before demo
2. Wait for `{"status":"ok"}`
3. Open Vercel frontend and log in with a test account

Optional: use [UptimeRobot](https://uptimerobot.com) to ping `/health` every 5 minutes.

## Troubleshooting

| Problem | Fix |
|---|---|
| Database connection fails | Use Supabase **pooler** URL on port 6543, not direct port 5432 |
| CORS errors | `ALLOWED_ORIGIN` must exactly match Vercel URL |
| Blank frontend | Check `VITE_API_URL` includes `/api/v1` |
| 401 on tasks | Log in first; access token expires after 15 minutes |
| Deploy fails | Check Render runtime logs for Prisma migration errors |

## Local Docker alternative

```bash
docker compose up --build
```

Backend: `http://localhost:3000`  
Frontend (manual): `cd frontend && npm run dev`
