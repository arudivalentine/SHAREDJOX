<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Wallet\Controllers\GetWalletController;
use App\Domains\Wallet\Controllers\InitiateDepositController;
use App\Domains\Wallet\Controllers\InitiateWithdrawController;
use App\Domains\Wallet\Controllers\ConfirmTransactionController;
use App\Domains\Wallet\Controllers\GetTransactionHistoryController;
use App\Domains\Wallet\Controllers\GetEventHistoryController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/wallet', GetWalletController::class);
    Route::post('/wallet/deposit', InitiateDepositController::class);
    Route::post('/wallet/withdraw', InitiateWithdrawController::class);
    Route::post('/transactions/{transaction}/confirm', ConfirmTransactionController::class);
    Route::get('/transactions', GetTransactionHistoryController::class);
    Route::get('/wallet/events', GetEventHistoryController::class);
});
