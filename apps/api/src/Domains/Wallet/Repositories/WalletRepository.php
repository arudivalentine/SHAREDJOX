<?php

namespace App\Domains\Wallet\Repositories;

use App\Domains\Wallet\Models\Wallet;
use App\Domains\Wallet\Models\Transaction;
use App\Models\User;

class WalletRepository
{
    public function findByUser(User $user): ?Wallet
    {
        return $user->wallet;
    }

    public function findOrCreateByUser(User $user): Wallet
    {
        return $user->wallet ??= Wallet::create([
            'user_id' => $user->id,
            'balance' => 0,
            'available_balance' => 0,
            'pending_balance' => 0,
            'currency' => 'USD',
        ]);
    }

    public function getTransactionHistory(Wallet $wallet, int $limit = 50, int $offset = 0): array
    {
        return $wallet->transactions()
            ->orderByDesc('created_at')
            ->limit($limit)
            ->offset($offset)
            ->get()
            ->toArray();
    }

    public function getEventHistory(Wallet $wallet, int $limit = 100): array
    {
        return $wallet->events()
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    public function getPendingTransactions(Wallet $wallet): array
    {
        return $wallet->transactions()
            ->where('status', 'pending')
            ->get()
            ->toArray();
    }
}
