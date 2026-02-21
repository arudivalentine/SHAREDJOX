<?php

namespace App\Events;

use App\Domains\Jobs\Models\Job;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class JobClaimedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $jobId;
    public int $claimedBy;
    public string $claimedAt;
    public int $matchScore;
    public int $clientId;

    public function __construct(Job $job, int $matchScore)
    {
        $this->jobId = $job->id;
        $this->claimedBy = $job->claimed_by;
        $this->claimedAt = $job->claimed_at->toIso8601String();
        $this->matchScore = $matchScore;
        $this->clientId = $job->client_id;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("job.{$this->jobId}"),
            new PrivateChannel("user.{$this->clientId}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'job.claimed';
    }

    public function broadcastWith(): array
    {
        return [
            'jobId' => $this->jobId,
            'claimedBy' => $this->claimedBy,
            'claimedAt' => $this->claimedAt,
            'matchScore' => $this->matchScore,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
