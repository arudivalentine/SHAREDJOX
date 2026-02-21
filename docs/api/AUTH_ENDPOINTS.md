# Auth API Endpoints

## POST /api/auth/send-link

Send magic link to email (creates user if not exists).

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:** 201 Created
```json
{
  "message": "Magic link sent to email",
  "link_id": 1
}
```

In development, retrieve token from database:
```sql
SELECT token FROM magic_links WHERE id = 1;
```

## POST /api/auth/verify-link

Verify magic link token and receive API token.

**Request:**
```json
{
  "token": "random64chartoken..."
}
```

**Response:**
```json
{
  "token": "1|abc123def456..."
}
```

Use this token in subsequent requests:
```
Authorization: Bearer 1|abc123def456...
```

## GET /api/auth/me

Get authenticated user profile.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "user@example.com",
    "createdAt": "2026-02-18T04:59:15Z"
  }
}
```

## Error Responses

**422 Unprocessable Entity**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

**401 Unauthorized (Invalid Token)**
```json
{
  "message": "Invalid or expired magic link"
}
```

**401 Unauthenticated (Missing Token)**
```json
{
  "message": "Unauthenticated."
}
```
