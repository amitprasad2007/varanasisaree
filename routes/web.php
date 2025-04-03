<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\AdminAuthController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Admin Auth Routes
Route::get('/admin/login', [AdminAuthController::class, 'showLogin'])->name('admin.login');
Route::post('/admin/login', [AdminAuthController::class, 'login']);
Route::post('/admin/logout', [AdminAuthController::class, 'logout'])->name('admin.logout');

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::get('/analytics', function () {
    return Inertia::render('Analytics');
});

Route::get('/transactions', function () {
    return Inertia::render('Transactions');
});
Route::get('/notifications', function () {
    return Inertia::render('Notifications');
});
Route::get('/profile', function () {
    return Inertia::render('Profile');
});

Route::get('/settings', function () {
    return Inertia::render('Settings');
});


// Subcategories
Route::post('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');

Route::resource('categories', CategoryController::class);
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';