<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Vendor\VendorDashboardController;
use App\Http\Controllers\Vendor\VendorController;
use App\Http\Controllers\VendorAuthController;

Route::domain('{domain}.' . env('APP_URL'))->group(function () {
    Route::get('/', [VendorAuthController::class, 'showLoginForm'])->name('vendor.login');
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

require __DIR__.'/pos.php';
