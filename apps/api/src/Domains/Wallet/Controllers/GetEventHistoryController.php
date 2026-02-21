<?php

namespace App\Domains\Wallet\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\User;
use App\Domains\Wallet\Repositories\WalletRepository;

class GetEventHistoryController
{
    public function __invoke(Request $request, User $user, WalletRepository $repository): JsonResponse
    {
        $this->authorize('viewEvents', $user->wallet);

        $wallet = $repository->findOrCreateByUser($user);
        $limit = min((int) $request->query('limit', 100), 500);

        $events = $repository->getEventHistory($wallet, $limit);

        return response()->json([
            'data' => $events,
        ]);
    }
}
