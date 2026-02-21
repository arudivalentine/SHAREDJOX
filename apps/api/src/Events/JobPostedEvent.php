<?php

namespace App\Events;

use App\Domains\Jobs\Models\Job;
use App\Domains\Jobs\DTOs\JobDTO;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class JobPostedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public JobDTO $job;
    public int $matchScore;

    public function __construct(Job $job, int $matchScore = 50)
    {
        $this->job = JobDTO::fromModel($job, $matchScore);
        $this->matchScore = $matchScore;
    }

    public function broadcastOn(): Channel
    {
        return new Channel('jobs.discovery');
    }

    public function broadcastAs(): string
    {
        return 'job.posted';
    }

    public function broadcastWith(): array
    {
        return [
            'job' => $this->job,
            'matchScore' => $this->matchScore,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
