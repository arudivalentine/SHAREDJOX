<?php

namespace App\Console\Commands;

use App\Domains\Jobs\Models\Job;
use App\Domains\Jobs\Actions\CompleteJobAction;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class AutoCompleteJobs extends Command
{
    protected $signature = 'jobs:auto-complete';
    protected $description = 'Auto-complete jobs pending review for more than 24 hours';

    public function handle(): int
    {
        $this->info('Starting auto-complete job check...');

        $jobs = Job::where('status', 'pending_review')
            ->where('delivered_at', '<', now()->subHours(24))
            ->get();

        if ($jobs->isEmpty()) {
            $this->info('No jobs to auto-complete.');
            return self::SUCCESS;
        }

        $this->info("Found {$jobs->count()} jobs to auto-complete.");

        foreach ($jobs as $job) {
            try {
                $client = $job->client;
                $action = new CompleteJobAction();
                $action->execute($client, $job);

                Log::info('Job auto-completed', [
                    'job_id' => $job->id,
                    'reason' => 'deadline_exceeded',
                    'client_id' => $client->id,
                    'freelancer_id' => $job->claimed_by,
                    'amount' => $job->budget_max,
                ]);

                $this->line("✓ Job {$job->id} auto-completed");
            } catch (\Exception $e) {
                Log::error('Failed to auto-complete job', [
                    'job_id' => $job->id,
                    'error' => $e->getMessage(),
                ]);

                $this->error("✗ Job {$job->id} failed: {$e->getMessage()}");
            }
        }

        $this->info('Auto-complete check completed.');
        return self::SUCCESS;
    }
}
