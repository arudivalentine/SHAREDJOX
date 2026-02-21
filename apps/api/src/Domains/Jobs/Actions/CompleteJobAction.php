<?php

namespace App\Domains\Jobs\Actions;

use App\Domains\Jobs\Models\Job;
use App\Domains\Jobs\DTOs\JobDTO;
use App\Models\User;
use App\Events\JobUpdatedEvent;
use App\Events\WalletUpdatedEvent;
use Illuminate\Support\Facades\DB;

class CompleteJobAction
{
    public function execute(User $client, Job $job): JobDTO
    {
        if ($job->client_id !== $client->id) {
            throw new \DomainException('Only the job client can complete a job');
        }

        if ($job->status !== 'pending_review') {
            throw new \DomainException('Job must be in pending_review status to complete');
        }

        return DB::transaction(function () use ($client, $job) {
            $freelancer = $job->freelancer;
            $budget = $job->budget_max;
            $platformFee = $budget * 0.10;
            $freelancerEarning = $budget * 0.90;

            $job->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);

            $freelancerWallet = $freelancer->wallet;
            $platformWallet = User::find(1)->wallet;

            $earningTransaction = $freelancerWallet->transactions()->create([
                'type' => 'earning',
                'amount' => $freelancerEarning,
                'reference' => "job_{$job->id}_completion",
                'status' => 'completed',
                'metadata' => [
                    'job_id' => $job->id,
                    'job_title' => $job->title,
                ],
            ]);

            $freelancerWallet->increment('balance', $freelancerEarning);
            $freelancerWallet->increment('available_balance', $freelancerEarning);

            $feeTransaction = $platformWallet->transactions()->create([
                'type' => 'fee',
                'amount' => $platformFee,
                'reference' => "job_{$job->id}_fee",
                'status' => 'completed',
                'metadata' => [
                    'job_id' => $job->id,
                    'job_title' => $job->title,
                ],
            ]);

            $platformWallet->increment('balance', $platformFee);
            $platformWallet->increment('available_balance', $platformFee);

            if ($job->escrow_transaction_id) {
                $escrowTransaction = $client->wallet->transactions()->find($job->escrow_transaction_id);
                if ($escrowTransaction) {
                    $client->wallet->releaseEscrow($escrowTransaction);
                }
            }

            $freelancerWallet->recordEvent('job_completed', [
                'job_id' => $job->id,
                'earning' => $freelancerEarning,
                'transaction_id' => $earningTransaction->id,
            ]);

            $client->recordEvent('job_completed', [
                'job_id' => $job->id,
                'freelancer_id' => $freelancer->id,
                'amount_paid' => $freelancerEarning,
            ]);

            JobUpdatedEvent::dispatch($job);
            WalletUpdatedEvent::dispatch($freelancer, $freelancerWallet);

            return JobDTO::fromModel($job);
        });
    }
}
