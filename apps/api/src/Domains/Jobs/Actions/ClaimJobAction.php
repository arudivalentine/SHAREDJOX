<?php

namespace App\Domains\Jobs\Actions;

use App\Domains\Jobs\Models\Job;
use App\Domains\Jobs\DTOs\JobDTO;
use App\Models\User;
use App\Events\JobClaimedEvent;
use App\Mail\JobClaimedMail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class ClaimJobAction
{
    public function execute(Job $job, User $freelancer): JobDTO
    {
        if (!$job->canBeClaimed()) {
            throw new \DomainException('Job cannot be claimed. It must be active and not already claimed.');
        }

        if ($job->client_id === $freelancer->id) {
            throw new \DomainException('You cannot claim your own job.');
        }

        $matchScore = $this->calculateMatchScore($job, $freelancer);

        DB::transaction(function () use ($job, $freelancer, $matchScore) {
            $job->update([
                'claimed_by' => $freelancer->id,
                'claimed_at' => now(),
                'status' => 'claimed',
            ]);

            $job->client->recordEvent('job_claimed', [
                'job_id' => $job->id,
                'claimed_by_user_id' => $freelancer->id,
                'claimed_at' => now()->toIso8601String(),
                'match_score' => $matchScore,
            ]);

            JobClaimedEvent::dispatch($job, $matchScore);
        });

        Mail::send(new JobClaimedMail($job, $freelancer->name));

        return JobDTO::fromModel($job->fresh(), $matchScore);
    }

    private function calculateMatchScore(Job $job, User $freelancer): int
    {
        $required = $job->required_skills ?? [];

        if (empty($required)) {
            return 50;
        }

        $freelancerSkills = $freelancer->work_graph['skills'] ?? [];

        if (empty($freelancerSkills)) {
            return 0;
        }

        $intersect = array_intersect($required, $freelancerSkills);
        $score = (count($intersect) / count($required)) * 100;

        return min(100, max(0, (int) round($score)));
    }
}
