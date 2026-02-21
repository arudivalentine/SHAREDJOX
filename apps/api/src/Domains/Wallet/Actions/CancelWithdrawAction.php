<?php

namespace App\Domains\Wallet\Actions;

use App\Domains\Wallet\Models\Wallet;
use App\Domains\Wallet\Models\Transaction;

class CancelWithdrawAction
{
    public function execute(Transaction $transaction): void
    {
        if ($transaction->type !== 'withdraw') {
            throw new \DomainException('Only withdrawals can be cancelled');
        }

        if (!$transaction->isPending()) {
            throw new \DomainException('Only pending withdrawals can be cancelled');
        }

        $transaction->wallet->cancelWithdraw($transaction);
    }
}
