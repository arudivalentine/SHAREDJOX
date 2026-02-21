<?php

use Illuminate\Support\Facades\Broadcast;
use App\Domains\Jobs\Models\Job;
use App\Models\User;

Broadcast::channel('jobs.discovery', function () {
    return true;
});

Broadcast::channel('job.{jobId}', function (User $user, int $jobId) {
    $job = Job::find($jobId);

    if (!$job) {
        return false;
    }

    return $user->id === $job->client_id || $user->id === $job->claimed_by;
});

Broadcast::channel('user.{userId}', function (User $user, int $userId) {
    return $user->id === $userId;
});
