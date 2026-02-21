<?php

namespace App\Domains\Auth\DTOs;

class UserDTO
{
    public function __construct(
        public readonly int $id,
        public readonly string $email,
        public readonly ?string $name,
        public readonly string $createdAt,
    ) {}

    public static function fromModel(\App\Models\User $user): self
    {
        return new self(
            id: $user->id,
            email: $user->email,
            name: $user->name,
            createdAt: $user->created_at->toIso8601String(),
        );
    }
}
