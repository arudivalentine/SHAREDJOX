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
            'amount' => 'required|numeric|min:10|max:10000',
        ]);

        $wallet = $repository->findOrCreateByUser($user);

        $result = (new DepositAction())->execute(
            $wallet,
            (float) $validated['amount'],
            'stripe_checkout_' . uniqid(),
            []
        );

        return response()->json([
            'data' => [
                'checkoutUrl' => $result['checkoutUrl'],
                'sessionId' => $result['sessionId'],
                'transaction' => TransactionDTO::fromModel($result['transaction']),
            ],
        ], 201);
    }
}
