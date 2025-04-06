<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;

// Admin Auth Routes
Route::get('/', [AuthenticatedSessionController::class, 'create'])->name('login');


Route::middleware('auth')->group(function () {
    Route::get('dashboard', [AuthenticatedSessionController::class, 'dashboard'] )->name('dashboard');
    // Categories
    Route::post('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::resource('categories', CategoryController::class);

    // SubCategories
    Route::get('subcategories', [CategoryController::class, 'subcatindex'] )->name('subcatindex');
    Route::get('subcategoriescreate', [CategoryController::class, 'createsubcate'] )->name('subcategories.create');
    Route::post('subcategoriesstore', [CategoryController::class, 'substore'] )->name('subcategories.store');
    Route::get('/subcategories/{id}/edit', [CategoryController::class, 'subedit'] )->name('subcategories.edit');
    Route::post('/subcategories/{subcategory}', [CategoryController::class, 'subupdate'])->name('subcategories.update');
    Route::delete('/subcategories/{subcategory}', [CategoryController::class, 'subdestroy'])->name('subcategories.destroy');

    // Brands
    Route::post('/brands/{brand}', [BrandController::class, 'update'])->name('brands.update');
    Route::resource('brands', BrandController::class);

    // Products
    Route::resource('products', ProductController::class);


});

// Dynamic subcategories dropdown
Route::get('get-subcategories/{categoryId}', [ProductController::class, 'getSubcategories'])->name('get.subcategories');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';