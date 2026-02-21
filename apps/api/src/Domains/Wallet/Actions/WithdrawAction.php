<?php

namespace App\Domains\Wallet\Actions;

use App\Domains\Wallet\Models\Wallet;
use App\Domains\Wallet\Models\Transaction;

class WithdrawAction
{
    public function execute(Wallet $wallet, float $amount, string $reference, array $metadata = []): Transaction
    {
        if ($amount <= 0) {
            throw new \DomainException('Withdrawal amount must be positive');
        }

        return $wallet->withdraw($amount, $reference, $metadata);
    }
}
