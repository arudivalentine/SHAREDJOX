<?php

namespace App\Domains\Jobs\Controllers;

use App\Domains\Jobs\Models\Job;
use App\Domains\Jobs\Actions\SubmitDeliverableAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SubmitDeliverableController extends Controller
{
    public function __invoke(Request $request, Job $job): JsonResponse
    {
        $this->authorize('claim', $job);

        $validated = $request->validate([
            'files' => 'required|array|min:1|max:5',
            'files.*' => 'file|mimes:jpeg,png,pdf,zip|max:10240',
            'notes' => 'nullable|string|max:1000',
        ]);

        $files = $request->file('files') ?? [];
        $notes = $validated['notes'] ?? null;

        $action = new SubmitDeliverableAction();
        $jobDTO = $action->execute($request->user(), $job, $files, $notes);

        return response()->json(['data' => $jobDTO], 200);
    }
}
