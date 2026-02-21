<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Wallet\Controllers\StripeWebhookController;

Route::prefix('api')->group(function () {
    require __DIR__ . '/auth.php';
    require __DIR__ . '/wallet.php';
    require __DIR__ . '/jobs.php';
});

Route::post('/webhooks/stripe', StripeWebhookController::class)->withoutMiddleware('api');

