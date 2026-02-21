<?php

namespace App\Domains\Auth\Actions;

use App\Domains\Auth\Models\MagicLink;
use Illuminate\Support\Facades\Auth;

class VerifyMagicLinkAction
{
    public function execute(string $token): string
    {
        $link = MagicLink::where('token', $token)->first();

        if (!$link || !$link->isValid()) {
            throw new \DomainException('Invalid or expired magic link');
        }

        $link->consume();

        $token = $link->user->createToken('auth_token')->plainTextToken;

        return $token;
    }
}
