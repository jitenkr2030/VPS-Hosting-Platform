<?php

use App\Http\Controllers\Client\VpsController;
use Illuminate\Support\Facades\Route;

// VPS Management Routes
Route::middleware(['auth', 'verified'])->group(function () {
    // VPS management interface
    Route::get('/services/{service}/vps', [VpsController::class, 'show'])->name('services.vps.show');
    
    // VPS API actions
    Route::post('/services/{service}/vps/action', [VpsController::class, 'action'])->name('services.vps.action');
    Route::post('/services/{service}/vps/reinstall', [VpsController::class, 'reinstall'])->name('services.vps.reinstall');
    Route::post('/services/{service}/vps/snapshot', [VpsController::class, 'snapshot'])->name('services.vps.snapshot');
    Route::get('/services/{service}/vps/console', [VpsController::class, 'console'])->name('services.vps.console');
});