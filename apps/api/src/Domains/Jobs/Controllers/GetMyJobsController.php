<?php

namespace App\Domains\Jobs\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\User;
use App\Domains\Jobs\Repositories\JobRepository;
use App\Domains\Jobs\DTOs\JobDTO;

class GetMyJobsController
{
    public function __invoke(Request $request, User $user, JobRepository $repository): JsonResponse
    {
        $type = $request->query('type', 'posted');
        $status = $request->query('status');

        if ($type === 'posted') {
            $jobs = $repository->getJobsPostedByClient($user, $status);
        } else {
            $jobs = $repository->getJobsClaimedByFreelancer($user, $status);
        }

        $dtos = collect($jobs)->map(fn ($job) => JobDTO::fromModel($job));

        return response()->json(['data' => $dtos]);
    }
}
