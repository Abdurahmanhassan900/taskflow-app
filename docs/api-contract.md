# API Contract Document

## Overview
This document defines the backend endpoints for the application.

## 1. Auth Routes

### 1.1 Register
- **URL:** `/api/v1/auth/register`
- **Method:** `POST`
- **Auth required:** No
- **Request body:**
  ```json
  {
    "email": "user@example.com",
    "password": "Password1!",
    "name": "John Doe"
  }
  ```
- **Response format:**
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "Member"
    }
  }
  ```

### 1.2 Login
- **URL:** `/api/v1/auth/login`
- **Method:** `POST`
- **Auth required:** No
- **Request body:**
  ```json
  {
    "email": "user@example.com",
    "password": "Password1!"
  }
  ```
- **Response format:**
  ```json
  {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "Member"
    }
  }
  ```

### 1.3 Refresh Token
- **URL:** `/api/v1/auth/refresh`
- **Method:** `POST`
- **Auth required:** No (but requires valid refresh token in body or HttpOnly cookie)
- **Request body:**
  ```json
  {
    "refreshToken": "jwt_refresh_token"
  }
  ```
- **Response format:**
  ```json
  {
    "accessToken": "new_jwt_access_token",
    "refreshToken": "new_jwt_refresh_token"
  }
  ```

### 1.4 Logout
- **URL:** `/api/v1/auth/logout`
- **Method:** `POST`
- **Auth required:** Yes
- **Request body:**
  ```json
  {
    "refreshToken": "jwt_refresh_token"
  }
  ```
- **Response format:**
  ```json
  {
    "message": "Logged out successfully"
  }
  ```


## 2. Tasks Routes

### 2.1 Get All Tasks
- **URL:** `/api/v1/tasks`
- **Method:** `GET`
- **Auth required:** Yes
- **Request body:** None
- **Response format:**
  ```json
  {
    "tasks": [
      {
        "id": "uuid",
        "title": "Task title",
        "description": "Task description",
        "status": "pending",
        "userId": "uuid",
        "createdAt": "2023-10-27T10:00:00Z",
        "updatedAt": "2023-10-27T10:00:00Z"
      }
    ]
  }
  ```

### 2.2 Get Task by ID
- **URL:** `/api/v1/tasks/:id`
- **Method:** `GET`
- **Auth required:** Yes
- **Request body:** None
- **Response format:**
  ```json
  {
    "task": {
      "id": "uuid",
      "title": "Task title",
      "description": "Task description",
      "status": "pending",
      "userId": "uuid",
      "createdAt": "2023-10-27T10:00:00Z",
      "updatedAt": "2023-10-27T10:00:00Z"
    }
  }
  ```

### 2.3 Create Task
- **URL:** `/api/v1/tasks`
- **Method:** `POST`
- **Auth required:** Yes
- **Request body:**
  ```json
  {
    "title": "Task title",
    "description": "Task description"
  }
  ```
- **Response format:**
  ```json
  {
    "message": "Task created successfully",
    "task": {
      "id": "uuid",
      "title": "Task title",
      "description": "Task description",
      "status": "pending",
      "userId": "uuid",
      "createdAt": "2023-10-27T10:00:00Z",
      "updatedAt": "2023-10-27T10:00:00Z"
    }
  }
  ```

### 2.4 Update Task
- **URL:** `/api/v1/tasks/:id`
- **Method:** `PUT`
- **Auth required:** Yes
- **Request body:**
  ```json
  {
    "title": "Updated title",
    "description": "Updated description",
    "status": "completed"
  }
  ```
- **Response format:**
  ```json
  {
    "message": "Task updated successfully",
    "task": {
      "id": "uuid",
      "title": "Updated title",
      "description": "Updated description",
      "status": "completed",
      "userId": "uuid",
      "createdAt": "2023-10-27T10:00:00Z",
      "updatedAt": "2023-10-27T12:00:00Z"
    }
  }
  ```

### 2.5 Delete Task
- **URL:** `/api/v1/tasks/:id`
- **Method:** `DELETE`
- **Auth required:** Yes
- **Request body:** None
- **Response format:**
  ```json
  {
    "message": "Task deleted successfully"
  }
  ```


## 3. Admin Routes

### 3.1 Get All Users
- **URL:** `/api/v1/admin/users`
- **Method:** `GET`
- **Auth required:** Yes (Admin role)
- **Request body:** None
- **Response format:**
  ```json
  {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "name": "John Doe",
        "role": "Member",
        "createdAt": "2023-10-27T10:00:00Z"
      }
    ]
  }
  ```

### 3.2 Update User Role
- **URL:** `/api/v1/admin/users/:id/role`
- **Method:** `PUT`
- **Auth required:** Yes (Admin role)
- **Request body:**
  ```json
  {
    "role": "Admin"
  }
  ```
- **Response format:**
  ```json
  {
    "message": "User role updated successfully",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "Admin",
      "updatedAt": "2023-10-27T12:00:00Z"
    }
  }
  ```

### 3.3 Delete User
- **URL:** `/api/v1/admin/users/:id`
- **Method:** `DELETE`
- **Auth required:** Yes (Admin role)
- **Request body:** None
- **Response format:**
  ```json
  {
    "message": "User deleted successfully"
  }
  ```


## Approval

- **Backend (Abdul):** ___________________ (Date: _________)
- **Frontend (Munir):** ___________________ (Date: _________)
