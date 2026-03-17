<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Vendor\VendorDashboardController;
use App\Http\Controllers\Vendor\VendorController;
use App\Http\Controllers\VendorAuthController;
use App\Http\Controllers\VendorRefundController;

Route::get('/vendor/login', [VendorAuthController::class, 'showLoginForm'])->name('vendor.login');

Route::domain('{domain}.' . env('APP_URL'))->group(function () {
    Route::get('/', [VendorAuthController::class, 'showLoginForm'])->name('vendor.login');
    Route::get('/vendor/login', [VendorAuthController::class, 'showLoginForm'])->name('vendor.login');
    Route::post('/vendor/login', [VendorAuthController::class, 'login'])->name('vendor.login.store');
    Route::get('/dashboard',  [VendorDashboardController::class, 'dashboard'])->name('vendor.dashboard');
    
    // Vendor logout route
    Route::post('/logout', [VendorAuthController::class, 'logout'])->name('vendor.logout');
});

Route::prefix('vendor')->group(function () {
    Route::get('register', [VendorAuthController::class, 'showRegistrationForm'])->name('vendor.register');
    Route::post('register', [VendorAuthController::class, 'register'])->name('vendor.register.store');
    Route::get('check-subdomain/{domain}', [VendorAuthController::class, 'checkSubdomain'])->name('vendor.check-subdomain');
});

// Vendor refund management routes
Route::prefix('vendor')->name('vendor.')->middleware(['auth'])->group(function () {
    Route::get('/dashboard', [VendorDashboardController::class, 'index'])->name('dashboard');
    Route::get('/home', [VendorController::class, 'home'])->name('home');
    
    // Vendor Refund Management Routes
    Route::prefix('refunds')->name('refunds.')->group(function () {
        Route::get('/', [VendorRefundController::class, 'index'])->name('index');
        Route::get('/{refund}', [VendorRefundController::class, 'show'])->name('show');
        Route::post('/{refund}/approve', [VendorRefundController::class, 'approve'])->name('approve');
        Route::post('/{refund}/reject', [VendorRefundController::class, 'reject'])->name('reject');
        Route::get('/analytics/data', [VendorRefundController::class, 'analytics'])->name('analytics');
        Route::get('/export/csv', [VendorRefundController::class, 'export'])->name('export');
    });
});

require __DIR__.'/pos.php';
