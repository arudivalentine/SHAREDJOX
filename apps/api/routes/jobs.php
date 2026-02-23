<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Jobs\Controllers\PostJobController;
use App\Domains\Jobs\Controllers\GetDiscoveryController;
use App\Domains\Jobs\Controllers\GetMyJobsController;
use App\Domains\Jobs\Controllers\ClaimJobController;
use App\Domains\Jobs\Controllers\SubmitDeliverableController;
use App\Domains\Jobs\Controllers\CompleteJobController;
use App\Domains\Jobs\Controllers\CancelJobController;
use App\Domains\Jobs\Controllers\RequestChangesController;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/jobs', PostJobController::class);
    Route::get('/jobs/discovery', GetDiscoveryController::class);
    Route::get('/jobs/my', GetMyJobsController::class);
    Route::post('/jobs/{job}/claim', ClaimJobController::class);
    Route::post('/jobs/{job}/deliver', SubmitDeliverableController::class);
    Route::post('/jobs/{job}/complete', CompleteJobController::class);
    Route::post('/jobs/{job}/cancel', CancelJobController::class);
    Route::post('/jobs/{job}/request-changes', RequestChangesController::class);
});
