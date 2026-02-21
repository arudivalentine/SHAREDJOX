<?php

namespace App\Domains\Wallet\Actions;

use App\Domains\Wallet\Models\Wallet;
use App\Domains\Wallet\Models\Transaction;
use Stripe\Stripe;
use Stripe\Transfer;

class WithdrawAction
{
    public function execute(Wallet $wallet, float $amount, string $reference, array $metadata = []): array
    {
        if ($amount < 10 || $amount > 10000) {
            throw new \DomainException('Withdrawal amount must be between $10 and $10,000');
        }

        if ($wallet->available_balance < $amount) {
            throw new \DomainException('Insufficient available balance');
        }

        $pendingWithdrawal = $wallet->transactions()
            ->where('type', 'withdraw')
            ->where('status', 'pending')
            ->first();

        if ($pendingWithdrawal) {
            throw new \DomainException('You have a pending withdrawal. Please wait for it to complete.');
        }

        $transaction = $wallet->withdraw($amount, $reference, $metadata);

        Stripe::setApiKey(config('services.stripe.secret'));

        $transfer = Transfer::create([
            'amount' => (int) ($amount * 100),
            'currency' => strtolower($wallet->currency),
            'destination' => $wallet->user->stripe_account_id,
            'metadata' => [
                'transaction_id' => $transaction->id,
                'wallet_id' => $wallet->id,
                'user_id' => $wallet->user_id,
            ],
        ]);

        $transaction->update([
            'metadata' => array_merge($transaction->metadata ?? [], [
                'stripe_transfer_id' => $transfer->id,
            ]),
        ]);

        return [
            'transferId' => $transfer->id,
            'transaction' => $transaction,
        ];
    }
}
