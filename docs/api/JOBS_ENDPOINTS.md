# Jobs API Endpoints

All endpoints require `Authorization: Bearer {token}` header.

## POST /api/jobs

Create a new job posting.

**Request:**
```json
{
  "title": "Build React Dashboard",
  "description": "Need a responsive dashboard with charts and tables",
  "budget_min": 50,
  "budget_max": 150,
  "type": "flash",
  "estimated_duration": 120,
  "required_skills": ["react", "typescript"],
  "deliverables_required": ["source code", "documentation"]
}
```

**Response:** 201 Created
```json
{
  "data": {
    "id": 1,
    "clientId": 1,
    "title": "Build React Dashboard",
    "description": "Need a responsive dashboard with charts and tables",
    "type": "flash",
    "budgetMin": 50.00,
    "budgetMax": 150.00,
    "status": "active",
    "requiredSkills": ["react", "typescript"],
    "estimatedDuration": 120,
    "claimedBy": null,
    "claimedAt": null,
    "deliverablesRequired": ["source code", "documentation"],
    "createdAt": "2026-02-21T10:00:00Z",
    "updatedAt": "2026-02-21T10:00:00Z",
    "matchScore": null
  }
}
```

## GET /api/jobs/discovery

Get active jobs for freelancer discovery feed.

**Query Parameters:**
- `cursor`: Pagination cursor (job ID)
- `limit`: Max results (default: 20, max: 50)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "clientId": 2,
      "title": "Build React Dashboard",
      "description": "Need a responsive dashboard with charts and tables",
      "type": "flash",
      "budgetMin": 50.00,
      "budgetMax": 150.00,
      "status": "active",
      "requiredSkills": ["react", "typescript"],
      "estimatedDuration": 120,
      "claimedBy": null,
      "claimedAt": null,
      "deliverablesRequired": ["source code", "documentation"],
      "createdAt": "2026-02-21T10:00:00Z",
      "updatedAt": "2026-02-21T10:00:00Z",
      "matchScore": 100
    }
  ],
  "pagination": {
    "hasMore": true,
    "nextCursor": 1
  }
}
```

## GET /api/jobs/my

Get jobs posted by client or claimed by freelancer.

**Query Parameters:**
- `type`: "posted" or "claimed" (default: "posted")
- `status`: Filter by status (draft, active, claimed, completed, cancelled)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "clientId": 1,
      "title": "Build React Dashboard",
      "description": "Need a responsive dashboard with charts and tables",
      "type": "flash",
      "budgetMin": 50.00,
      "budgetMax": 150.00,
      "status": "active",
      "requiredSkills": ["react", "typescript"],
      "estimatedDuration": 120,
      "claimedBy": null,
      "claimedAt": null,
      "deliverablesRequired": ["source code", "documentation"],
      "createdAt": "2026-02-21T10:00:00Z",
      "updatedAt": "2026-02-21T10:00:00Z",
      "matchScore": null
    }
  ]
}
```

## POST /api/jobs/{id}/claim

Claim a job as a freelancer.

**Response:** 200 OK
```json
{
  "data": {
    "id": 1,
    "clientId": 2,
    "title": "Build React Dashboard",
    "description": "Need a responsive dashboard with charts and tables",
    "type": "flash",
    "budgetMin": 50.00,
    "budgetMax": 150.00,
    "status": "claimed",
    "requiredSkills": ["react", "typescript"],
    "estimatedDuration": 120,
    "claimedBy": 1,
    "claimedAt": "2026-02-21T10:05:00Z",
    "deliverablesRequired": ["source code", "documentation"],
    "createdAt": "2026-02-21T10:00:00Z",
    "updatedAt": "2026-02-21T10:05:00Z",
    "matchScore": 100
  }
}
```

## Error Responses

**422 Unprocessable Entity**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "budget_min": ["Budget must be between $10 and $10,000"]
  }
}
```

**403 Forbidden**
```json
{
  "message": "This action is unauthorized."
}
```

**409 Conflict**
```json
{
  "message": "Job cannot be claimed. It must be active and not already claimed."
}
```

## Job Status Transitions

```
draft → active (on creation)
active → claimed (when freelancer claims)
claimed → completed (when client marks complete)
completed → paid (automatic wallet transaction)
```

## Skill Matching Algorithm

Match score is calculated as:
```
score = (matching_skills / required_skills) * 100
```

Example:
- Job requires: ["react", "typescript"]
- Freelancer has: ["react", "node", "typescript"]
- Match score: (2 / 2) * 100 = 100%

Discovery feed is sorted by:
1. Match score (descending)
2. Created at (descending) - newer first
3. Budget (descending) - higher paying first
