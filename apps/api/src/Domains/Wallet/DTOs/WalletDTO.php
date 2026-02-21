<?php

namespace App\Domains\Wallet\DTOs;

class WalletDTO
{
    public function __construct(
        public readonly int $id,
        public readonly int $userId,
        public readonly float $balance,
        public readonly float $availableBalance,
        public readonly float $pendingBalance,
        public readonly string $currency,
        public readonly string $createdAt,
        public readonly string $updatedAt,
    ) {}

    public static function fromModel(\App\Domains\Wallet\Models\Wallet $wallet): self
    {
        return new self(
            id: $wallet->id,
            userId: $wallet->user_id,
            balance: (float) $wallet->balance,
            availableBalance: (float) $wallet->available_balance,
            pendingBalance: (float) $wallet->pending_balance,
            currency: $wallet->currency,
            createdAt: $wallet->created_at->toIso8601String(),
            updatedAt: $wallet->updated_at->toIso8601String(),
        );
    }
}
