<?php

use Illuminate\Support\Facades\Route;

Route::prefix('api')->group(function () {
    require __DIR__ . '/auth.php';
    require __DIR__ . '/wallet.php';
});
