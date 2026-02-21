<?php

namespace App\Domains\Wallet\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Wallet extends Model
{
    protected $fillable = [
        'user_id',
        'balance',
        'available_balance',
        'pending_balance',
        'held_balance',
        'currency',
    ];

    protected $casts = [
        'balance' => 'decimal:2',
        'available_balance' => 'decimal:2',
        'pending_balance' => 'decimal:2',
        'held_balance' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(WalletEvent::class);
    }

    public function deposit(float $amount, string $reference, array $metadata = []): Transaction
    {
        $transaction = $this->transactions()->create([
            'type' => 'deposit',
            'amount' => $amount,
            'reference' => $reference,
            'status' => 'pending',
            'metadata' => $metadata,
        ]);

        $this->recordEvent('deposit_initiated', [
            'amount' => $amount,
            'reference' => $reference,
            'transaction_id' => $transaction->id,
        ]);

        return $transaction;
    }

    public function confirmDeposit(Transaction $transaction): void
    {
        $transaction->update(['status' => 'completed']);
        $this->increment('balance', $transaction->amount);
        $this->increment('available_balance', $transaction->amount);

        $this->recordEvent('deposit_confirmed', [
            'amount' => $transaction->amount,
            'transaction_id' => $transaction->id,
            'new_balance' => $this->balance,
        ]);
    }

    public function withdraw(float $amount, string $reference, array $metadata = []): Transaction
    {
        if ($this->available_balance < $amount) {
            throw new \DomainException('Insufficient available balance');
        }

        $transaction = $this->transactions()->create([
            'type' => 'withdraw',
            'amount' => $amount,
            'reference' => $reference,
            'status' => 'pending',
            'metadata' => $metadata,
        ]);

        $this->decrement('available_balance', $amount);
        $this->increment('pending_balance', $amount);

        $this->recordEvent('withdrawal_initiated', [
            'amount' => $amount,
            'reference' => $reference,
            'transaction_id' => $transaction->id,
        ]);

        return $transaction;
    }

    public function confirmWithdraw(Transaction $transaction): void
    {
        $transaction->update(['status' => 'completed']);
        $this->decrement('balance', $transaction->amount);
        $this->decrement('pending_balance', $transaction->amount);

        $this->recordEvent('withdrawal_confirmed', [
            'amount' => $transaction->amount,
            'transaction_id' => $transaction->id,
            'new_balance' => $this->balance,
        ]);
    }

    public function cancelWithdraw(Transaction $transaction): void
    {
        $transaction->update(['status' => 'cancelled']);
        $this->increment('available_balance', $transaction->amount);
        $this->decrement('pending_balance', $transaction->amount);

        $this->recordEvent('withdrawal_cancelled', [
            'amount' => $transaction->amount,
            'transaction_id' => $transaction->id,
        ]);
    }

    public function recordEvent(string $type, array $payload): WalletEvent
    {
        return $this->events()->create([
            'type' => $type,
            'payload' => $payload,
        ]);
    }

    public function holdEscrow(float $amount, string $reference, array $metadata = []): Transaction
    {
        if ($this->available_balance < $amount) {
            throw new \DomainException('Insufficient available balance for escrow hold');
        }

        $transaction = $this->transactions()->create([
            'type' => 'escrow_hold',
            'amount' => $amount,
            'reference' => $reference,
            'status' => 'pending',
            'metadata' => $metadata,
        ]);

        $this->decrement('available_balance', $amount);
        $this->increment('held_balance', $amount);

        $this->recordEvent('escrow_hold_initiated', [
            'amount' => $amount,
            'reference' => $reference,
            'transaction_id' => $transaction->id,
        ]);

        return $transaction;
    }

    public function releaseEscrow(Transaction $transaction): void
    {
        $transaction->update(['status' => 'completed']);
        $this->decrement('held_balance', $transaction->amount);
        $this->increment('balance', $transaction->amount);
        $this->increment('available_balance', $transaction->amount);

        $this->recordEvent('escrow_released', [
            'amount' => $transaction->amount,
            'transaction_id' => $transaction->id,
            'new_balance' => $this->balance,
        ]);
    }

    public function refundEscrow(Transaction $transaction): void
    {
        $transaction->update(['status' => 'cancelled']);
        $this->decrement('held_balance', $transaction->amount);
        $this->increment('available_balance', $transaction->amount);

        $this->recordEvent('escrow_refunded', [
            'amount' => $transaction->amount,
            'transaction_id' => $transaction->id,
        ]);
    }
}
