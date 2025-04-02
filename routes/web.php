<?php

use App\Http\Controllers\CategoryController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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
Route::resource('categories', CategoryController::class);

// Subcategories

