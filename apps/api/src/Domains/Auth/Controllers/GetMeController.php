<?php

namespace App\Domains\Auth\Controllers;

use Illuminate\Http\JsonResponse;
use App\Models\User;
use App\Domains\Auth\DTOs\UserDTO;

class GetMeController
{
    public function __invoke(User $user): JsonResponse
    {
        return response()->json([
            'data' => UserDTO::fromModel($user),
        ]);
    }
}
