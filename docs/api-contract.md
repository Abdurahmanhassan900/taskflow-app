# API Contract Document

## Overview
This document describes the backend HTTP API **as implemented** in `backend/`.

- **Base URL (local):** `http://localhost:3000/api/v1`
- **Base URL (prod):** `https://<render-url>/api/v1`
- **Auth scheme:** short-lived JWT **access token** sent as `Authorization: Bearer <token>`.
  A longer-lived **refresh token** is stored in an `httpOnly` cookie and exchanged at `/auth/refresh`.
- **Error shape (all errors):**
  ```json
  { "error": { "message": "human readable reason" } }
  ```
  Common statuses: `400` validation, `401` missing/invalid token or credentials,
  `403` forbidden (role), `404` not found (also returned when you request a
  resource you don't own), `409` conflict, `429` rate limited.

---

## 1. Auth Routes

### 1.1 Register — `POST /auth/register`  (no auth)
Request:
```json
{ "fullName": "Jane Doe", "email": "jane@example.com", "password": "min 8 chars" }
```
`201` response (also sets the `refreshToken` cookie):
```json
{
  "accessToken": "jwt",
  "user": { "id": "uuid", "email": "jane@example.com", "fullName": "Jane Doe", "role": "MEMBER" }
}
```
`409` if the email already exists.

### 1.2 Login — `POST /auth/login`  (no auth)
Request: `{ "email": "...", "password": "..." }`
`200` response: same body as register (`accessToken` + `user`), sets the cookie.
`401` on bad credentials.

### 1.3 Refresh — `POST /auth/refresh`  (uses refresh cookie)
No body. Reads the `refreshToken` cookie and returns a new access token:
```json
{ "accessToken": "jwt" }
```
`401` if the cookie is missing or invalid.

### 1.4 Logout — `POST /auth/logout`
Clears the refresh cookie. `200 { "message": "Logged out successfully" }`.

### 1.5 Current user — `GET /auth/me`  (auth required)
`200 { "user": { "id", "email", "fullName", "role" } }`.

---

## 2. Tasks Routes  (all require `Authorization: Bearer <accessToken>`)

A task object:
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "status": "To Do | In Progress | Completed",
  "priority": "Low | Medium | High",
  "userId": "uuid",
  "createdAt": "ISO timestamp",
  "updatedAt": "ISO timestamp"
}
```
All queries are scoped to the authenticated user — you can only see/modify your own tasks.

| Action | Method & URL | Body | Success |
|---|---|---|---|
| List | `GET /tasks` | — | `200` array of task objects (newest first) |
| Get one | `GET /tasks/:id` | — | `200` task, or `404` |
| Create | `POST /tasks` | `{ title, description?, status?, priority? }` | `201` task |
| Update | `PUT /tasks/:id` | any subset of `{ title, description, status, priority }` | `200` task, or `404` |
| Delete | `DELETE /tasks/:id` | — | `200 { "message": "Task deleted successfully" }`, or `404` |

---

## 3. Admin Routes — *planned, not yet implemented*

The `role` field exists on users (`MEMBER` / `ADMIN`) and a `requireRole('ADMIN')`
middleware is available, but admin endpoints (list users, change role) are not
built in the current MVP.
