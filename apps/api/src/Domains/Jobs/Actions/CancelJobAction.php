<?php

namespace App\Domains\Jobs\Actions;

use App\Domains\Jobs\Models\Job;
use App\Domains\Jobs\DTOs\JobDTO;
use App\Models\User;
use App\Events\JobUpdatedEvent;
use Illuminate\Support\Facades\DB;

class CancelJobAction
{
    public function execute(User $client, Job $job): JobDTO
    {
        if ($job->client_id !== $client->id) {
            throw new \DomainException('Only the job client can cancel a job');
        }

        if ($job->status !== 'active') {
            throw new \DomainException('Only active jobs can be cancelled');
        }

        return DB::transaction(function () use ($client, $job) {
            $job->update(['status' => 'cancelled']);

            if ($job->escrow_transaction_id) {
                $escrowTransaction = $client->wallet->transactions()->find($job->escrow_transaction_id);
                if ($escrowTransaction && $escrowTransaction->status === 'pending') {
                    $client->wallet->refundEscrow($escrowTransaction);
                }
            }

            $client->recordEvent('job_cancelled', [
                'job_id' => $job->id,
                'title' => $job->title,
            ]);

            JobUpdatedEvent::dispatch($job);

            return JobDTO::fromModel($job);
        });
    }
}
