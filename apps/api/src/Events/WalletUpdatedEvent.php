<?php

namespace App\Events;

use App\Models\User;
use App\Domains\Wallet\Models\Wallet;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WalletUpdatedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $userId;
    public float $balance;
    public float $availableBalance;
    public float $heldBalance;
    public string $updatedAt;

    public function __construct(User $user, Wallet $wallet)
    {
        $this->userId = $user->id;
        $this->balance = (float) $wallet->balance;
        $this->availableBalance = (float) $wallet->available_balance;
        $this->heldBalance = (float) $wallet->held_balance;
        $this->updatedAt = $wallet->updated_at->toIso8601String();
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
            'balance' => $this->balance,
            'availableBalance' => $this->availableBalance,
            'heldBalance' => $this->heldBalance,
            'updatedAt' => $this->updatedAt,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
