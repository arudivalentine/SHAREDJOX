<?php

namespace App\Domains\Wallet\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WalletEvent extends Model
{
    protected $fillable = [
        'wallet_id',
        'type',
        'payload',
    ];

    protected $casts = [
        'payload' => 'json',
    ];

    public const UPDATED_AT = null;

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }
}
