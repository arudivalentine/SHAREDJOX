<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;
use App\Domains\Wallet\Models\Wallet;
use App\Domains\Auth\Models\MagicLink;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = [
        'email',
        'password',
        'name',
        'stripe_account_id',
    ];

    protected $hidden = [
        'password',
    ];

    public function wallet(): HasOne
    {
        return $this->hasOne(Wallet::class);
    }

    public function magicLinks(): HasMany
    {
        return $this->hasMany(MagicLink::class);
    }
}
