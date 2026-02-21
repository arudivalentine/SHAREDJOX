<?php

namespace App\Domains\Auth\Actions;

use App\Models\User;
use App\Domains\Auth\Models\MagicLink;
use Illuminate\Support\Str;

class SendMagicLinkAction
{
    public function execute(string $email): MagicLink
    {
        $user = User::firstOrCreate(
            ['email' => $email],
            ['name' => $email]
        );

        $link = $user->magicLinks()->create([
            'token' => Str::random(64),
            'expires_at' => now()->addHours(24),
        ]);

        return $link;
    }
}
