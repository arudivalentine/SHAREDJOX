<?php

namespace App\Domains\Jobs\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\User;
use App\Domains\Jobs\Repositories\JobRepository;
use App\Domains\Jobs\DTOs\JobDTO;

class GetDiscoveryController
{
    public function __invoke(Request $request, User $user, JobRepository $repository): JsonResponse
    {
        $this->authorize('viewDiscovery', \App\Domains\Jobs\Models\Job::class);

        $cursor = $request->query('cursor');
        $limit = min((int) $request->query('limit', 20), 50);

        $result = $repository->getActiveJobsForDiscovery($user, $cursor, $limit);

        $jobs = collect($result['jobs'])->map(function ($item) {
            return JobDTO::fromModel($item['job'], $item['matchScore']);
        });

        return response()->json([
            'data' => $jobs,
            'pagination' => [
                'hasMore' => $result['hasMore'],
                'nextCursor' => $result['nextCursor'],
            ],
        ]);
    }
}
