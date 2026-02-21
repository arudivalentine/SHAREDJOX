<?php

namespace App\Domains\Wallet\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\User;
use App\Domains\Wallet\Repositories\WalletRepository;
use App\Domains\Wallet\Actions\WithdrawAction;
use App\Domains\Wallet\DTOs\TransactionDTO;

class InitiateWithdrawController
{
    public function __invoke(Request $request, User $user, WalletRepository $repository): JsonResponse
    {
        $this->authorize('withdraw', $user->wallet);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:10|max:10000',
        ]);

        $wallet = $repository->findOrCreateByUser($user);

        $result = (new WithdrawAction())->execute(
            $wallet,
            (float) $validated['amount'],
            'stripe_transfer_' . uniqid(),
            []
        );

        return response()->json([
            'data' => [
                'transferId' => $result['transferId'],
                'transaction' => TransactionDTO::fromModel($result['transaction']),
            ],
        ], 201);
    }
}
