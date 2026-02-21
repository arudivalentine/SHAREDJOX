<?php

namespace App\Events;

use App\Domains\Jobs\Models\Job;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class JobUpdatedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $jobId;
    public string $status;
    public ?array $deliverables;
    public string $updatedAt;

    public function __construct(Job $job)
    {
        $this->jobId = $job->id;
        $this->status = $job->status;
        $this->deliverables = $job->deliverables_required;
        $this->updatedAt = $job->updated_at->toIso8601String();
    }

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel("job.{$this->jobId}");
    }

    public function broadcastAs(): string
    {
        return 'job.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'jobId' => $this->jobId,
            'status' => $this->status,
            'deliverables' => $this->deliverables,
            'updatedAt' => $this->updatedAt,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
