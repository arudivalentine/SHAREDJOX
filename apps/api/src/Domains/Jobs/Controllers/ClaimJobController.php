<?php

namespace App\Domains\Jobs\Controllers;

use Illuminate\Http\JsonResponse;
use App\Models\User;
use App\Domains\Jobs\Models\Job;
use App\Domains\Jobs\Actions\ClaimJobAction;
use App\Domains\Jobs\DTOs\JobDTO;

class ClaimJobController
{
    public function __invoke(User $user, Job $job): JsonResponse
    {
        $this->authorize('claim', $job);

        $result = (new ClaimJobAction())->execute($job, $user);

        return response()->json(['data' => $result], 200);
    }
}
