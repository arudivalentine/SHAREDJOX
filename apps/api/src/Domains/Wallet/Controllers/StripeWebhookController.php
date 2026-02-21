<?php

namespace App\Domains\Wallet\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Webhook;
use App\Domains\Wallet\Models\Transaction;
use App\Domains\Wallet\Actions\ConfirmTransactionAction;

class StripeWebhookController
{
    public function __invoke(Request $request): JsonResponse
    {
        Stripe::setApiKey(config('services.stripe.secret'));

        $payload = $request->getContent();
        $sig_header = $request->header('Stripe-Signature');
        $endpoint_secret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sig_header, $endpoint_secret);
        } catch (\UnexpectedValueException $e) {
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        match ($event->type) {
            'checkout.session.completed' => $this->handleCheckoutCompleted($event),
            'charge.dispute.created' => $this->handleDisputeCreated($event),
            default => null,
        };

        return response()->json(['success' => true]);
    }

    private function handleCheckoutCompleted($event): void
    {
        $session = $event->data->object;

        $transactionId = $session->metadata->transaction_id ?? null;
        if (!$transactionId) {
            return;
        }

        $transaction = Transaction::find($transactionId);
        if (!$transaction || !$transaction->isPending()) {
            return;
        }

        $transaction->update([
            'metadata' => array_merge($transaction->metadata ?? [], [
                'stripe_charge_id' => $session->payment_intent,
            ]),
        ]);

        (new ConfirmTransactionAction())->execute($transaction);
    }

    private function handleDisputeCreated($event): void
    {
        $dispute = $event->data->object;
        $chargeId = $dispute->charge;

        $transaction = Transaction::where('metadata->stripe_charge_id', $chargeId)->first();
        if ($transaction) {
            $transaction->update([
                'status' => 'failed',
                'metadata' => array_merge($transaction->metadata ?? [], [
                    'dispute_id' => $dispute->id,
                    'dispute_reason' => $dispute->reason,
                ]),
            ]);

            $transaction->wallet->recordEvent('deposit_disputed', [
                'transaction_id' => $transaction->id,
                'dispute_id' => $dispute->id,
                'reason' => $dispute->reason,
            ]);
        }
    }
}
