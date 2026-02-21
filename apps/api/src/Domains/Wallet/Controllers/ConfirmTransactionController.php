<?php

namespace App\Domains\Wallet\Controllers;

use Illuminate\Http\JsonResponse;
use App\Models\User;
use App\Domains\Wallet\Models\Transaction;
use App\Domains\Wallet\Actions\ConfirmTransactionAction;
use App\Domains\Wallet\DTOs\TransactionDTO;

class ConfirmTransactionController
{
    public function __invoke(User $user, Transaction $transaction): JsonResponse
    {
        $this->authorize('view', $transaction->wallet);

        (new ConfirmTransactionAction())->execute($transaction);

        return response()->json([
            'data' => TransactionDTO::fromModel($transaction->refresh()),
        ]);
    }
}
