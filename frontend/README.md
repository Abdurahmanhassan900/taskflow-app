# TaskFlow frontend

React single-page application for TaskFlow. Users register, sign in, view a dashboard, and manage personal tasks through the Express API.

## Environment variable

Copy `.env.example` to `.env`:

| Variable | Example | Purpose |
|----------|---------|---------|
| `VITE_API_URL` | `http://localhost:3000/api/v1` | Base URL for the Express API |

In production (Vercel), set `VITE_API_URL` to your Render API URL including `/api/v1`.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server (default http://localhost:5173) |
| `npm test` | Run Vitest unit tests |
| `npm run lint` | Run ESLint |
| `npm run build` | Type-check and produce production build in `dist/` |

Requires **Node.js 22** (see repo `.nvmrc`).

## Relationship to the Express API

The frontend stores the JWT access token in memory (Zustand) and sends it as `Authorization: Bearer <token>` on protected requests. The refresh token lives in an httpOnly cookie managed by the API; the browser sends it automatically on auth endpoints.

API contract: [../docs/api-contract.md](../docs/api-contract.md)

## Local development

```bash
cp .env.example .env
npm ci
npm run dev
```

Start the backend separately (see [../README.md](../README.md)) or use `docker compose up` from the repository root.
