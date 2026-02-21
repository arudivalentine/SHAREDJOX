<?php

namespace App\Domains\Jobs\Actions;

use App\Domains\Jobs\Models\Job;
use App\Domains\Jobs\DTOs\JobDTO;
use App\Models\User;
use App\Events\JobPostedEvent;

class PostJobAction
{
    public function execute(
        User $client,
        string $title,
        string $description,
        float $budgetMin,
        float $budgetMax,
        string $type = 'flash',
        ?int $estimatedDuration = null,
        ?array $requiredSkills = null,
        ?array $deliverablesRequired = null,
    ): JobDTO {
        if ($budgetMin < 10 || $budgetMax > 10000) {
            throw new \DomainException('Budget must be between $10 and $10,000');
        }

        if ($budgetMin > $budgetMax) {
            throw new \DomainException('Minimum budget cannot exceed maximum budget');
        }

        if (empty(trim($title)) || empty(trim($description))) {
            throw new \DomainException('Title and description are required');
        }

        $job = Job::create([
            'client_id' => $client->id,
            'title' => $title,
            'description' => $description,
            'type' => $type,
            'budget_min' => $budgetMin,
            'budget_max' => $budgetMax,
            'status' => 'active',
            'required_skills' => $requiredSkills,
            'estimated_duration' => $estimatedDuration,
            'deliverables_required' => $deliverablesRequired,
        ]);

        $client->recordEvent('job_posted', [
            'job_id' => $job->id,
            'title' => $title,
            'budget_min' => $budgetMin,
            'budget_max' => $budgetMax,
            'type' => $type,
        ]);

        JobPostedEvent::dispatch($job, 50);

        return JobDTO::fromModel($job);
    }
}
