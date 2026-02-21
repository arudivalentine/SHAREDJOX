<?php

namespace App\Domains\Jobs\Policies;

use App\Domains\Jobs\Models\Job;
use App\Models\User;

class JobPolicy
{
    public function view(User $user, Job $job): bool
    {
        return $user->id === $job->client_id ||
               $user->id === $job->claimed_by ||
               $user->is_admin;
    }

    public function update(User $user, Job $job): bool
    {
        return $user->id === $job->client_id && $job->status === 'draft';
    }

    public function delete(User $user, Job $job): bool
    {
        return $user->id === $job->client_id && $job->status === 'draft';
    }

    public function claim(User $user, Job $job): bool
    {
        return $user->id !== $job->client_id && $job->canBeClaimed();
    }

    public function complete(User $user, Job $job): bool
    {
        return $user->id === $job->client_id && $job->status === 'claimed';
    }

    public function viewDiscovery(User $user): bool
    {
        return true;
    }
}
