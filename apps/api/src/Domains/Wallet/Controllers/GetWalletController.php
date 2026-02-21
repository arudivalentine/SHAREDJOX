<?php

namespace App\Domains\Wallet\Controllers;

use Illuminate\Http\JsonResponse;
use App\Models\User;
use App\Domains\Wallet\Repositories\WalletRepository;
use App\Domains\Wallet\DTOs\WalletDTO;

class GetWalletController
{
    public function __invoke(User $user, WalletRepository $repository): JsonResponse
    {
        $this->authorize('view', $user->wallet);

        $wallet = $repository->findOrCreateByUser($user);

        return response()->json([
            'data' => WalletDTO::fromModel($wallet),
        ]);
    }
}
