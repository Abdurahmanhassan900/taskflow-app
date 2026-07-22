# API Contract Document

This document describes the **implemented** TaskFlow API. Request and response shapes match the running code.

**Base URL:** `/api/v1` (prepend your host, e.g. `http://localhost:3000/api/v1`)

**Auth header (protected routes):** `Authorization: Bearer <accessToken>`

**Refresh token:** httpOnly cookie named `refreshToken` (not returned in JSON on login/register/refresh)

**Roles (enum):** `ADMIN` | `MEMBER`

**Error format (4xx/5xx):**
```json
{
  "error": {
    "message": "Human-readable message"
  }
}
```

---

## 0. Health

### GET `/health`
- **Auth required:** No
- **Response:** `200`
```json
{
  "status": "ok",
  "requestId": "uuid"
}
```
- **Note:** Liveness only. Does not query PostgreSQL.

---

## 1. Auth Routes

### 1.1 Register
- **URL:** `POST /api/v1/auth/register`
- **Auth required:** No
- **Rate limit:** 5 requests / 15 min / IP
- **Request body:**
```json
{
  "fullName": "John Doe",
  "email": "user@example.com",
  "password": "Password1!"
}
```
- **Validation:** `fullName` required (1–120 chars), `email` valid email, `password` min 8 chars
- **Response:** `201`
```json
{
  "accessToken": "jwt_access_token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "MEMBER"
  }
}
```
- **Side effect:** Sets `refreshToken` httpOnly cookie (7 days). Refresh token is **not** in the JSON body.

### 1.2 Login
- **URL:** `POST /api/v1/auth/login`
- **Auth required:** No
- **Rate limit:** 5 requests / 15 min / IP
- **Request body:**
```json
{
  "email": "user@example.com",
  "password": "Password1!"
}
```
- **Response:** `200`
```json
{
  "accessToken": "jwt_access_token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "MEMBER"
  }
}
```
- **Side effect:** Sets `refreshToken` httpOnly cookie. No refresh token in JSON.

### 1.3 Refresh
- **URL:** `POST /api/v1/auth/refresh`
- **Auth required:** No (requires valid `refreshToken` cookie)
- **Request body:** None
- **Credentials:** `Cookie: refreshToken=...` (browser sends automatically with `credentials: true`)
- **Response:** `200`
```json
{
  "accessToken": "new_jwt_access_token"
}
```
- **Note:** Stateless JWT refresh flow. Returns a new access token only. Does **not** rotate or re-issue the refresh cookie.

### 1.4 Logout
- **URL:** `POST /api/v1/auth/logout`
- **Auth required:** No (clears cookie if present; no Bearer token required)
- **Request body:** None
- **Response:** `200`
```json
{
  "message": "Logged out successfully"
}
```
- **Side effect:** Clears the `refreshToken` cookie.

### 1.5 Change password
- **URL:** `PUT /api/v1/auth/password`
- **Auth required:** Yes (`Authorization: Bearer <accessToken>`)
- **Request body:**
```json
{
  "currentPassword": "Password1!",
  "newPassword": "NewPassword2!"
}
```
- **Response:** `200`
```json
{
  "message": "Password updated successfully"
}
```

---

## 2. Task Routes

All task routes require authentication. Users only see and modify their own tasks (`userId === req.user.id`, `deletedAt: null`).

**Task `status` / `priority` in requests (Zod):** use enum values `TODO` | `IN_PROGRESS` | `COMPLETED` and `LOW` | `MEDIUM` | `HIGH`.

**Task `status` / `priority` in responses:** human-readable labels (`"To Do"`, `"Medium"`, etc.) plus `statusValue` / `priorityValue` with the enum.

### 2.1 List tasks
- **URL:** `GET /api/v1/tasks`
- **Response:** `200` — **JSON array** (not wrapped in `{ tasks: [...] }`)
```json
[
  {
    "id": "uuid",
    "title": "Task title",
    "description": "Task description",
    "status": "To Do",
    "priority": "Medium",
    "statusValue": "TODO",
    "priorityValue": "MEDIUM",
    "userId": "uuid",
    "createdAt": "2026-07-22T10:00:00.000Z",
    "updatedAt": "2026-07-22T10:00:00.000Z"
  }
]
```

### 2.2 Get task by ID
- **URL:** `GET /api/v1/tasks/:id`
- **Response:** `200` — **single task object** (not wrapped in `{ task: ... }`)
```json
{
  "id": "uuid",
  "title": "Task title",
  "description": "Task description",
  "status": "In Progress",
  "priority": "High",
  "statusValue": "IN_PROGRESS",
  "priorityValue": "HIGH",
  "userId": "uuid",
  "createdAt": "2026-07-22T10:00:00.000Z",
  "updatedAt": "2026-07-22T12:00:00.000Z"
}
```

### 2.3 Create task
- **URL:** `POST /api/v1/tasks`
- **Request body:**
```json
{
  "title": "Task title",
  "description": "Optional description",
  "status": "TODO",
  "priority": "MEDIUM"
}
```
- **Response:** `201` — single serialized task object (same shape as 2.2)

### 2.4 Update task
- **URL:** `PUT /api/v1/tasks/:id`
- **Request body:** at least one field
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "COMPLETED",
  "priority": "LOW"
}
```
- **Response:** `200` — single serialized task object

### 2.5 Delete task (soft delete)
- **URL:** `DELETE /api/v1/tasks/:id`
- **Response:** `200`
```json
{
  "message": "Task deleted successfully"
}
```
- **Note:** Sets `deletedAt`; record is not returned in list/get.

---

## 3. Admin Routes

Require `Authorization: Bearer <accessToken>` and role `ADMIN`.

### 3.1 List users
- **URL:** `GET /api/v1/admin/users`
- **Response:** `200`
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "MEMBER",
      "createdAt": "2026-07-22T10:00:00.000Z",
      "updatedAt": "2026-07-22T10:00:00.000Z"
    }
  ]
}
```

### 3.2 Update user role
- **URL:** `PUT /api/v1/admin/users/:id/role`
- **Request body:**
```json
{
  "role": "ADMIN"
}
```
- **Validation:** `role` must be `ADMIN` or `MEMBER` (uppercase)
- **Response:** `200`
```json
{
  "message": "User role updated successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "ADMIN",
    "createdAt": "2026-07-22T10:00:00.000Z",
    "updatedAt": "2026-07-22T12:00:00.000Z"
  }
}
```
- **Errors:** `400` if changing your own role; `404` if user not found

### 3.3 Delete user (soft delete)
- **URL:** `DELETE /api/v1/admin/users/:id`
- **Response:** `200`
```json
{
  "message": "User deleted successfully"
}
```

---

## Common status codes

| Code | Meaning |
|---|---|
| 400 | Validation error or bad request |
| 401 | Missing/invalid token or credentials |
| 403 | Forbidden (e.g. member calling admin route) |
| 404 | Resource not found (including IDOR — other user's task) |
| 409 | Email already registered |
| 429 | Rate limit exceeded |
| 500 | Internal server error (generic message to client) |

---

## Maintainer verification

- [ ] API contract reviewed against implementation (Date: _________)
- [ ] Reviewer: ___________________
