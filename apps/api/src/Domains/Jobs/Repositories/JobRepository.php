<?php

namespace App\Domains\Jobs\Repositories;

use App\Domains\Jobs\Models\Job;
use App\Models\User;
use Illuminate\Pagination\Paginator;

class JobRepository
{
    public function getActiveJobsForDiscovery(User $freelancer, ?string $cursor = null, int $limit = 20): array
    {
        $query = Job::where('status', 'active')
            ->where('client_id', '!=', $freelancer->id)
            ->whereNull('claimed_by')
            ->orderByDesc('created_at')
            ->limit($limit + 1);

        if ($cursor) {
            $query->where('id', '<', $cursor);
        }

        $jobs = $query->get();
        $hasMore = count($jobs) > $limit;

        if ($hasMore) {
            $jobs = $jobs->take($limit);
        }

        $jobsWithScores = $jobs->map(function (Job $job) use ($freelancer) {
            $matchScore = $this->getMatchScore($job, $freelancer);
            return [
                'job' => $job,
                'matchScore' => $matchScore,
            ];
        })->sortByDesc('matchScore')->values();

        return [
            'jobs' => $jobsWithScores,
            'hasMore' => $hasMore,
            'nextCursor' => $hasMore ? $jobs->last()->id : null,
        ];
    }

    public function getJobsPostedByClient(User $client, ?string $status = null): array
    {
        $query = Job::where('client_id', $client->id);

        if ($status) {
            $query->where('status', $status);
        }

        return $query->orderByDesc('created_at')->get()->toArray();
    }

    public function getJobsClaimedByFreelancer(User $freelancer, ?string $status = null): array
    {
        $query = Job::where('claimed_by', $freelancer->id);

        if ($status) {
            $query->where('status', $status);
        }

        return $query->orderByDesc('claimed_at')->get()->toArray();
    }

    public function searchJobs(string $query, int $limit = 20): array
    {
        return Job::where('status', 'active')
            ->whereNull('claimed_by')
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                    ->orWhere('description', 'like', "%{$query}%");
            })
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    public function getMatchScore(Job $job, User $freelancer): int
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
