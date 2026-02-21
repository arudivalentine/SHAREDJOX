<?php

namespace App\Domains\Jobs\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\User;
use App\Domains\Jobs\Actions\PostJobAction;
use App\Domains\Jobs\DTOs\JobDTO;

class PostJobController
{
    public function __invoke(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:5000',
            'budget_min' => 'required|numeric|min:10|max:10000',
            'budget_max' => 'required|numeric|min:10|max:10000',
            'type' => 'required|in:flash,sprint,anchor',
            'estimated_duration' => 'nullable|integer|min:15',
            'required_skills' => 'nullable|array',
            'required_skills.*' => 'string|max:50',
            'deliverables_required' => 'nullable|array',
        ]);

        $job = (new PostJobAction())->execute(
            client: $user,
            title: $validated['title'],
            description: $validated['description'],
            budgetMin: (float) $validated['budget_min'],
            budgetMax: (float) $validated['budget_max'],
            type: $validated['type'],
            estimatedDuration: $validated['estimated_duration'] ?? null,
            requiredSkills: $validated['required_skills'] ?? null,
            deliverablesRequired: $validated['deliverables_required'] ?? null,
        );

        return response()->json(['data' => $job], 201);
    }
}
