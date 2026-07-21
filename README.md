# TaskFlow

TaskFlow is a full-stack task management application with authentication, role-based access control, and secure API design. It is built for learning backend, DevOps, and DevSecOps practices.

## Architecture

```text
Browser (React + Vite)
        │
        ▼
Express API (Node.js)
        │
        ▼
PostgreSQL (Supabase in production, Docker locally)
```

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind, Zustand, Axios |
| Backend | Node.js, Express, Prisma 7, PostgreSQL |
| Auth | JWT access tokens + httpOnly refresh cookies |
| Validation | Zod |
| Testing | Node test runner, Supertest, Playwright |
| CI/CD | GitHub Actions |
| Hosting | Vercel (frontend), Render (backend), Supabase (database) |

## Quick start (local)

### Prerequisites

- Node.js 20+
- Docker (optional, for PostgreSQL)
- npm

### 1. Start the database

```bash
docker compose up db -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate deploy
npx prisma db seed
npm start
```

API available at `http://localhost:3000/api/v1`

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App available at `http://localhost:5173`

### Seed accounts (development only)

| Email | Password | Role |
|---|---|---|
| `test@taskflow.local` | `local-dev-only-change-me` | MEMBER |
| `admin@taskflow.local` | `local-dev-only-change-me` | ADMIN |

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes (prod) | Access token signing secret |
| `JWT_REFRESH_SECRET` | Yes (prod) | Refresh token signing secret |
| `ALLOWED_ORIGIN` | Yes | Frontend URL for CORS |
| `PORT` | No | Default `3000` |
| `NODE_ENV` | No | `development` or `production` |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Backend API base URL, e.g. `http://localhost:3000/api/v1` |

## API overview

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | No | Health check |
| POST | `/api/v1/auth/register` | No | Create account |
| POST | `/api/v1/auth/login` | No | Login |
| POST | `/api/v1/auth/refresh` | Cookie | Refresh access token |
| POST | `/api/v1/auth/logout` | Cookie | Logout |
| PUT | `/api/v1/auth/password` | Yes | Change password |
| GET | `/api/v1/tasks` | Yes | List own tasks |
| POST | `/api/v1/tasks` | Yes | Create task |
| GET | `/api/v1/tasks/:id` | Yes | Get own task |
| PUT | `/api/v1/tasks/:id` | Yes | Update own task |
| DELETE | `/api/v1/tasks/:id` | Yes | Soft-delete own task |
| GET | `/api/v1/admin/users` | Admin | List users |
| PUT | `/api/v1/admin/users/:id/role` | Admin | Change user role |
| DELETE | `/api/v1/admin/users/:id` | Admin | Soft-delete user |

Full contract: `docs/api-contract.md`

## Security features

- bcrypt password hashing (12 rounds)
- JWT access tokens (15 min) + refresh tokens in httpOnly cookies (7 days)
- Server-side auth on every protected route
- RBAC for admin endpoints
- IDOR prevention: tasks scoped to `req.user.id`
- Soft delete for users and tasks
- Zod input validation
- Rate limiting on auth routes
- Helmet security headers
- CORS restricted to `ALLOWED_ORIGIN`
- Request ID header (`X-Request-Id`) on every response
- Structured JSON logging (no secrets in logs)
- Safe error responses (no stack traces to clients)

## Testing

```bash
# Backend integration tests (requires PostgreSQL)
cd backend && npm test

# Frontend build
cd frontend && npm run build

# E2E (requires backend + frontend running)
npm run test:e2e
```

## Docker (full stack)

```bash
docker compose up --build
```

## Phase 1 completion checkpoint

When Phase 1 is complete, tag the repository:

```bash
git tag -a v1-platform-hosted -m "Phase 1: complete TaskFlow on Vercel/Render/Supabase"
```

## Known limitations

- Refresh tokens are stateless JWTs (cannot be revoked server-side without a token store)
- No email verification or password reset flow
- Dashboard charts are summary cards only (no graph library)
- Admin UI page not built in frontend (admin API available via API tools)
- Render free tier cold starts (~30–60s)

## Documentation

- [Deployment guide](docs/DEPLOYMENT.md)
- [API contract](docs/api-contract.md)
- [Changelog](CHANGELOG.md)

## License

ISC
