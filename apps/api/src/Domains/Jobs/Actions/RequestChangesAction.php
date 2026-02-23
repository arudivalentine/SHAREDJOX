<?php

namespace App\Domains\Jobs\Actions;

use App\Domains\Jobs\Models\Job;
use App\Domains\Jobs\DTOs\JobDTO;
use App\Models\User;
use App\Events\JobUpdatedEvent;
use App\Mail\RevisionRequestedMail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class RequestChangesAction
{
    public function execute(User $client, Job $job, string $feedback): JobDTO
    {
        if ($job->client_id !== $client->id) {
            throw new \DomainException('Only the job client can request changes');
        }

        if ($job->status !== 'pending_review') {
            throw new \DomainException('Job must be in pending_review status to request changes');
        }

        if (empty(trim($feedback))) {
            throw new \DomainException('Feedback is required');
        }

        if (strlen($feedback) > 1000) {
            throw new \DomainException('Feedback must be 1000 characters or less');
        }

        return DB::transaction(function () use ($client, $job, $feedback) {
            $job->update([
                'status' => 'revision_requested',
                'revision_notes' => $feedback,
            ]);

            $freelancer = $job->freelancer;

            $client->recordEvent('revision_requested', [
                'job_id' => $job->id,
                'feedback' => $feedback,
            ]);

            $freelancer->recordEvent('revision_requested', [
                'job_id' => $job->id,
                'feedback' => $feedback,
            ]);

            JobUpdatedEvent::dispatch($job);

            Mail::send(new RevisionRequestedMail($job, $feedback));

            return JobDTO::fromModel($job);
        });
    }
}
