<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WalletUpdatedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $userId;
    public float $newBalance;
    public float $availableBalance;
    public string $transactionType;
    public float $amount;

    public function __construct(User $user, string $transactionType, float $amount)
    {
        $this->userId = $user->id;
        $this->newBalance = (float) $user->wallet->balance;
        $this->availableBalance = (float) $user->wallet->available_balance;
        $this->transactionType = $transactionType;
        $this->amount = $amount;
    }

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel("user.{$this->userId}");
    }

    public function broadcastAs(): string
    {
        return 'wallet.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'userId' => $this->userId,
            'newBalance' => $this->newBalance,
            'availableBalance' => $this->availableBalance,
            'transactionType' => $this->transactionType,
            'amount' => $this->amount,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
