<?php

namespace App\Domains\Wallet\Actions;

use App\Domains\Wallet\Models\Wallet;
use App\Domains\Wallet\Models\Transaction;
use Stripe\Stripe;
use Stripe\Checkout\Session;

class DepositAction
{
    public function execute(Wallet $wallet, float $amount, string $reference, array $metadata = []): array
    {
        if ($amount < 10 || $amount > 10000) {
            throw new \DomainException('Deposit amount must be between $10 and $10,000');
        }

        $transaction = $wallet->deposit($amount, $reference, $metadata);

        Stripe::setApiKey(config('services.stripe.secret'));

        $session = Session::create([
            'payment_method_types' => ['card'],
            'mode' => 'payment',
            'line_items' => [
                [
                    'price_data' => [
                        'currency' => strtolower($wallet->currency),
                        'product_data' => [
                            'name' => 'Wallet Deposit',
                        ],
                        'unit_amount' => (int) ($amount * 100),
                    ],
                    'quantity' => 1,
                ],
            ],
            'success_url' => config('app.url') . '/wallet?deposit=success&session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => config('app.url') . '/wallet?deposit=cancelled',
            'metadata' => [
                'transaction_id' => $transaction->id,
                'wallet_id' => $wallet->id,
                'user_id' => $wallet->user_id,
            ],
        ]);

        $transaction->update([
            'metadata' => array_merge($transaction->metadata ?? [], [
                'stripe_session_id' => $session->id,
            ]),
        ]);

        return [
            'checkoutUrl' => $session->url,
            'sessionId' => $session->id,
            'transaction' => $transaction,
        ];
    }
}
