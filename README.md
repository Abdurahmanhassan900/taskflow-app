# taskflow-app
# [Project Name]

> [One sentence: what it is and what it does]

🌐 **Live App:** https://your-app.vercel.app
📹 **Demo Video:** [link]
📚 **API:** https://your-backend.onrender.com/api/v1

---

## Overview

[2 paragraphs: what the app does and what engineering challenges it demonstrates]

## Architecture

[Paste a simple diagram like the one in Section 2 of this document]

The frontend is a React SPA deployed on Vercel. The backend is a Node.js/Express API
deployed on Render as a Docker container. The database is PostgreSQL hosted on Supabase.
Everything is connected via HTTPS. Deployments are automated via GitHub Actions.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js 20, Express, TypeScript, Prisma |
| Database | PostgreSQL (Supabase) |
| Auth | JWT (access + refresh tokens), bcrypt |
| DevOps | Docker, GitHub Actions, Render, Vercel |

## Features

- User registration and login with JWT authentication
- Role-based access control (Admin / Member)
- Full CRUD for [your domain entity]
- Admin panel: user management and role assignment
- Responsive design (mobile + desktop)
- Input validation on frontend and backend
- Rate limiting on auth endpoints
- Structured logging

## Security

- HTTPS enforced on all endpoints (Vercel + Render TLS)
- Security headers set via `helmet` (HSTS, X-Frame-Options, etc.)
- Passwords hashed with bcrypt (10 rounds)
- JWT access tokens expire in 15 minutes; refresh tokens rotate on each use
- CORS restricted to frontend origin only
- Rate limiting: 100 req/min global, 10 req/min on auth routes
- Ownership checks on all resource operations (prevents IDOR)
- Input validated with Zod on all API routes
- No secrets in source code — all environment variables

## Getting Started

### Prerequisites
- Node.js 20+
- Docker Desktop

### Setup
```bash
git clone https://github.com/[org]/[repo]
cd [repo]
make setup        # copies .env.example files, starts Docker
cd frontend && npm run dev
```

Open http://localhost:5173

### Default Test Accounts
| Email | Password | Role |
|-------|----------|------|
| admin@test.com | Password1! | Admin |
| user@test.com | Password1! | Member |

## Running Tests
```bash
make test-backend    # Jest unit + integration tests
make test-frontend   # Vitest component tests
make test-e2e        # Playwright E2E tests
```

## Environment Variables

See `.env.example` files in `/backend` and `/frontend` for required variables.

## Team

| Name | Role |
|------|------|
| [You] | DevOps & Security |
| Abdul | Backend |
| Munir | Frontend |
| Himal | Integration & Testing |
