# Jobs Domain - Phase 3 Implementation

## Overview

The Jobs domain implements a Flash job marketplace where clients post short-term tasks and freelancers claim them. Phase 3 focuses on the core marketplace mechanics without AI matching.

## Job Model

### Fields
- `id` - Primary key
- `client_id` - Foreign key to user (job creator)
- `title` - Job title (max 255 chars)
- `description` - Full job description (max 5000 chars)
- `type` - Job type: 'flash' (< 4 hours), 'sprint' (1-2 weeks), 'anchor' (ongoing)
- `budget_min` - Minimum budget ($10-$10,000)
- `budget_max` - Maximum budget ($10-$10,000)
- `status` - Job status (draft, active, claimed, completed, cancelled)
- `required_skills` - JSON array of skill tags (e.g., ["react", "typescript"])
- `estimated_duration` - Duration in minutes (for Flash jobs)
- `claimed_by` - Foreign key to user (freelancer who claimed)
- `claimed_at` - Timestamp when claimed
- `deliverables_required` - JSON array of deliverable types
- `created_at`, `updated_at`, `deleted_at` - Timestamps

### Status Transitions

```
draft → active (on creation, auto-publish)
active → claimed (freelancer claims job)
claimed → completed (client marks complete or auto-release after 24h)
completed → paid (automatic wallet transaction)
any → cancelled (client cancels before claim)
```

## Actions

### PostJobAction
Creates a new job posting.

**Validation:**
- Budget between $10-$10,000
- Budget min ≤ budget max
- Title and description required
- Type must be valid (flash, sprint, anchor)

**Behavior:**
- Creates job with status "active"
- Records event for audit trail
- Returns JobDTO

**Example:**
```php
$job = (new PostJobAction())->execute(
    client: $user,
    title: "Build React Dashboard",
    description: "Need responsive dashboard with charts",
    budgetMin: 50,
    budgetMax: 150,
    type: 'flash',
    estimatedDuration: 120,
    requiredSkills: ['react', 'typescript'],
);
```

### ClaimJobAction
Freelancer claims a job.

**Validation:**
- Job must be active and not claimed
- Freelancer cannot claim own job
- Atomic update (prevents double-claims)

**Behavior:**
- Calculates match score
- Updates job: claimed_by, claimed_at, status
- Records event
- Returns JobDTO with match score

**Atomic Transaction:**
```php
DB::transaction(function () {
    $job->update([
        'claimed_by' => $freelancer->id,
        'claimed_at' => now(),
        'status' => 'claimed',
    ]);
    // Event recording
});
```

## Skill Matching Algorithm

Simple intersection-based matching (no AI yet).

**Formula:**
```
match_score = (matching_skills / required_skills) * 100
```

**Example:**
- Job requires: ["react", "typescript"]
- Freelancer has: ["react", "node", "typescript"]
- Matching: ["react", "typescript"] (2 skills)
- Score: (2 / 2) * 100 = 100%

**Edge Cases:**
- No required skills: score = 50 (neutral)
- No freelancer skills: score = 0
- Partial match: proportional score

**Discovery Feed Sorting:**
1. Match score (descending)
2. Created at (descending) - newer first
3. Budget (descending) - higher paying first

## Repository Methods

### getActiveJobsForDiscovery
Fetch active jobs for freelancer discovery feed.

**Parameters:**
- `$freelancer` - User object
- `$cursor` - Pagination cursor (job ID)
- `$limit` - Results per page (default: 20)

**Returns:**
```php
[
    'jobs' => [
        ['job' => Job, 'matchScore' => int],
        ...
    ],
    'hasMore' => bool,
    'nextCursor' => ?int,
]
```

**Query:**
- Status = 'active'
- Exclude client's own jobs
- Exclude claimed jobs
- Order by created_at DESC
- Calculate match score for each

### getJobsPostedByClient
Get jobs posted by a specific client.

**Parameters:**
- `$client` - User object
- `$status` - Optional status filter

**Returns:** Array of Job models

### getJobsClaimedByFreelancer
Get jobs claimed by a specific freelancer.

**Parameters:**
- `$freelancer` - User object
- `$status` - Optional status filter

**Returns:** Array of Job models

### searchJobs
Simple text search on title and description.

**Parameters:**
- `$query` - Search string
- `$limit` - Results limit (default: 20)

**Returns:** Array of Job models

### getMatchScore
Calculate match score between job and freelancer.

**Parameters:**
- `$job` - Job model
- `$freelancer` - User model

**Returns:** Integer (0-100)

## Authorization Policy

### view
- Client can view own jobs
- Freelancer can view active jobs
- Claimed freelancer can view claimed job
- Admin can view all

### claim
- Freelancer can claim if job is active and not claimed
- Cannot claim own job

### complete
- Only client can mark complete
- Job must be claimed

### viewDiscovery
- All authenticated users can view discovery feed

## Database Indexes

```sql
INDEX (client_id)
INDEX (claimed_by)
INDEX (status, type)
INDEX (status, created_at)
INDEX (created_at)
```

These optimize:
- Finding jobs by client
- Finding jobs by freelancer
- Filtering by status
- Pagination by created_at

## API Endpoints

### POST /api/jobs
Create job posting

### GET /api/jobs/discovery
Get discovery feed with cursor pagination

### GET /api/jobs/my
Get user's jobs (posted or claimed)

### POST /api/jobs/{id}/claim
Claim a job

See `docs/api/JOBS_ENDPOINTS.md` for full endpoint documentation.

## User Work Graph

Freelancer skills are stored in `users.work_graph` JSON field:

```json
{
  "skills": ["react", "typescript", "node"],
  "rating": 4.8,
  "completed_jobs": 42,
  "response_time_hours": 2
}
```

This is used for:
- Skill matching in discovery feed
- Freelancer profile display
- Future AI matching

## Future Enhancements

### Phase 4
- AI matching engine (replaces simple skill intersect)
- Sprint tier with milestones
- Interview bot for pre-screening
- Dispute resolution system

### Phase 5
- Anchor tier with recurring payments
- Freelancer reputation system
- Client verification
- Advanced search filters

## Testing

### Manual Test Flow
1. Client posts Flash job ($50, 30 min, needs "react")
2. Freelancer with "react" skill sees it in discovery
3. Freelancer claims job (atomic update)
4. Client receives notification
5. Freelancer submits deliverable
6. Client marks complete
7. Freelancer wallet increases by $50

### Verification Points
- No double-claims (atomic transaction)
- Match score calculated correctly
- Discovery feed excludes claimed jobs
- Status transitions work correctly
- Authorization policies enforced

## Performance Considerations

### Queries
- Discovery feed uses cursor pagination (not offset)
- Indexes on status, created_at for fast filtering
- Eager loading of relationships

### Caching
- Discovery feed can be cached per freelancer
- Match scores cached during session
- Invalidate on new job posted

### Scaling
- Partition jobs table by created_at for large datasets
- Archive completed jobs to separate table
- Use Redis for real-time job feed updates
