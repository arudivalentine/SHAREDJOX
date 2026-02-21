<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Auth\Controllers\SendMagicLinkController;
use App\Domains\Auth\Controllers\VerifyMagicLinkController;
use App\Domains\Auth\Controllers\GetMeController;

Route::post('/auth/send-link', SendMagicLinkController::class);
Route::post('/auth/verify-link', VerifyMagicLinkController::class);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', GetMeController::class);
});
