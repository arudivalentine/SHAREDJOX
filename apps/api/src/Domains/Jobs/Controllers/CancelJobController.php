<?php

namespace App\Domains\Jobs\Controllers;

use App\Domains\Jobs\Models\Job;
use App\Domains\Jobs\Actions\CancelJobAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class CancelJobController extends Controller
{
    public function __invoke(Job $job): JsonResponse
    {
        $this->authorize('update', $job);

        $action = new CancelJobAction();
        $jobDTO = $action->execute(auth()->user(), $job);

        return response()->json(['data' => $jobDTO], 200);
    }
}
