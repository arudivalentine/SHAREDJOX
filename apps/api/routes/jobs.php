<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Jobs\Controllers\PostJobController;
use App\Domains\Jobs\Controllers\GetDiscoveryController;
use App\Domains\Jobs\Controllers\GetMyJobsController;
use App\Domains\Jobs\Controllers\ClaimJobController;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/jobs', PostJobController::class);
    Route::get('/jobs/discovery', GetDiscoveryController::class);
    Route::get('/jobs/my', GetMyJobsController::class);
    Route::post('/jobs/{job}/claim', ClaimJobController::class);
});
