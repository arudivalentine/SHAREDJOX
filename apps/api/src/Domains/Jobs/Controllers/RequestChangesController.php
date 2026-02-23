<?php

namespace App\Domains\Jobs\Controllers;

use App\Domains\Jobs\Models\Job;
use App\Domains\Jobs\Actions\RequestChangesAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class RequestChangesController extends Controller
{
    public function __invoke(Request $request, Job $job): JsonResponse
    {
        $this->authorize('update', $job);

        $validated = $request->validate([
            'feedback' => 'required|string|max:1000',
        ]);

        $action = new RequestChangesAction();
        $jobDTO = $action->execute($request->user(), $job, $validated['feedback']);

        return response()->json(['data' => $jobDTO], 200);
    }
}
