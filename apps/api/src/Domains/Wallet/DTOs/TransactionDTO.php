<?php

namespace App\Domains\Wallet\DTOs;

class TransactionDTO
{
    public function __construct(
        public readonly int $id,
        public readonly int $walletId,
        public readonly string $type,
        public readonly float $amount,
        public readonly string $reference,
        public readonly string $status,
        public readonly ?array $metadata,
        public readonly string $createdAt,
        public readonly string $updatedAt,
    ) {}

    public static function fromModel(\App\Domains\Wallet\Models\Transaction $transaction): self
    {
        return new self(
            id: $transaction->id,
            walletId: $transaction->wallet_id,
            type: $transaction->type,
            amount: (float) $transaction->amount,
            reference: $transaction->reference,
            status: $transaction->status,
            metadata: $transaction->metadata,
            createdAt: $transaction->created_at->toIso8601String(),
            updatedAt: $transaction->updated_at->toIso8601String(),
        );
    }
}
