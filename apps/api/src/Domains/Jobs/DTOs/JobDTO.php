<?php

namespace App\Domains\Jobs\DTOs;

use App\Domains\Jobs\Models\Job;

class JobDTO
{
    public function __construct(
        public int $id,
        public int $clientId,
        public string $title,
        public string $description,
        public string $type,
        public float $budgetMin,
        public float $budgetMax,
        public string $status,
        public ?array $requiredSkills,
        public ?int $estimatedDuration,
        public ?int $claimedBy,
        public ?string $claimedAt,
        public ?array $deliverablesRequired,
        public string $createdAt,
        public string $updatedAt,
        public ?int $matchScore = null,
    ) {}

    public static function fromModel(Job $job, ?int $matchScore = null): self
    {
        return new self(
            id: $job->id,
            clientId: $job->client_id,
            title: $job->title,
            description: $job->description,
            type: $job->type,
            budgetMin: (float) $job->budget_min,
            budgetMax: (float) $job->budget_max,
            status: $job->status,
            requiredSkills: $job->required_skills,
            estimatedDuration: $job->estimated_duration,
            claimedBy: $job->claimed_by,
            claimedAt: $job->claimed_at?->toIso8601String(),
            deliverablesRequired: $job->deliverables_required,
            createdAt: $job->created_at->toIso8601String(),
            updatedAt: $job->updated_at->toIso8601String(),
            matchScore: $matchScore,
        );
    }
}
