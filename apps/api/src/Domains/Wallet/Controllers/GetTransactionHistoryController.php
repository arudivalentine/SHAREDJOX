<?php

namespace App\Domains\Wallet\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\User;
use App\Domains\Wallet\Repositories\WalletRepository;
use App\Domains\Wallet\DTOs\TransactionDTO;

class GetTransactionHistoryController
{
    public function __invoke(Request $request, User $user, WalletRepository $repository): JsonResponse
    {
        $this->authorize('viewTransactions', $user->wallet);

        $wallet = $repository->findOrCreateByUser($user);
        $limit = min((int) $request->query('limit', 50), 100);
        $offset = (int) $request->query('offset', 0);

        $transactions = $repository->getTransactionHistory($wallet, $limit, $offset);

        return response()->json([
            'data' => array_map(
                fn($tx) => TransactionDTO::fromModel($tx),
                $transactions
            ),
        ]);
    }
}
