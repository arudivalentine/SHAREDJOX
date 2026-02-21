<?php

namespace App\Domains\Wallet\Actions;

use App\Domains\Wallet\Models\Wallet;
use App\Domains\Wallet\Models\Transaction;

class ConfirmTransactionAction
{
    public function execute(Transaction $transaction): void
    {
        if (!$transaction->isPending()) {
            throw new \DomainException('Only pending transactions can be confirmed');
        }

        $wallet = $transaction->wallet;

        if ($transaction->type === 'deposit') {
            $wallet->confirmDeposit($transaction);
        } elseif ($transaction->type === 'withdraw') {
            $wallet->confirmWithdraw($transaction);
        }
    }
}
