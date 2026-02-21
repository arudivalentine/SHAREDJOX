<?php

namespace App\Domains\Auth\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Domains\Auth\Actions\VerifyMagicLinkAction;

class VerifyMagicLinkController
{
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => 'required|string',
        ]);

        $token = (new VerifyMagicLinkAction())->execute($validated['token']);

        return response()->json([
            'token' => $token,
        ]);
    }
}
