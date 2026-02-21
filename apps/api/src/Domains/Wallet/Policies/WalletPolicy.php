<?php

namespace App\Domains\Wallet\Policies;

use App\Models\User;
use App\Domains\Wallet\Models\Wallet;

class WalletPolicy
{
    public function view(User $user, Wallet $wallet): bool
    {
        return $user->id === $wallet->user_id;
    }

    public function deposit(User $user, Wallet $wallet): bool
    {
        return $user->id === $wallet->user_id;
    }

    public function withdraw(User $user, Wallet $wallet): bool
    {
        return $user->id === $wallet->user_id;
    }

    public function viewTransactions(User $user, Wallet $wallet): bool
    {
        return $user->id === $wallet->user_id;
    }

    public function viewEvents(User $user, Wallet $wallet): bool
    {
        return $user->id === $wallet->user_id;
    }
}
