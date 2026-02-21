<?php

namespace App\Domains\Wallet\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\User;
use App\Domains\Wallet\Repositories\WalletRepository;
use App\Domains\Wallet\Actions\DepositAction;
use App\Domains\Wallet\DTOs\TransactionDTO;

class InitiateDepositController
{
    public function __invoke(Request $request, User $user, WalletRepository $repository): JsonResponse
    {
        $this->authorize('deposit', $user->wallet);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'reference' => 'required|string|max:255',
            'metadata' => 'nullable|array',
        ]);

        $wallet = $repository->findOrCreateByUser($user);

        $transaction = (new DepositAction())->execute(
            $wallet,
            (float) $validated['amount'],
            $validated['reference'],
            $validated['metadata'] ?? []
        );

        return response()->json([
            'data' => TransactionDTO::fromModel($transaction),
        ], 201);
    }
}
