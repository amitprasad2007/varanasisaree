<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Vendor\VendorDashboardController;
use App\Http\Controllers\Vendor\VendorController;
use App\Http\Controllers\VendorAuthController;

Route::prefix('vendor')->group(function () {
    Route::get('register', [VendorAuthController::class, 'showRegistrationForm'])->name('vendor.register');
    Route::post('register', [VendorAuthController::class, 'register'])->name('vendor.register.store');
    Route::get('login', [VendorAuthController::class, 'showLoginForm'])->name('vendor.login');
    Route::post('login', [VendorAuthController::class, 'login'])->name('vendor.login.store');
    Route::post('check-subdomain', [VendorAuthController::class, 'checkSubdomain'])->name('vendor.check-subdomain');
});
