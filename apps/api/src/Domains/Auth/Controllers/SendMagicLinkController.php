<?php

namespace App\Domains\Auth\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Domains\Auth\Actions\SendMagicLinkAction;

class SendMagicLinkController
{
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $link = (new SendMagicLinkAction())->execute($validated['email']);

        return response()->json([
            'message' => 'Magic link sent to email',
            'link_id' => $link->id,
        ], 201);
    }
}
