<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\ImageProductController;

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
    // Products Images
    Route::get('products/{product}/images', [ImageProductController::class, 'index'])->name('product-images.index');
    Route::get('products/{product}/images/create', [ImageProductController::class, 'create'])->name('product-images.create');
    Route::post('products/{product}/images', [ImageProductController::class, 'store'])->name('product-images.store');
    Route::put('product-images/{imageProduct}', [ImageProductController::class, 'update'])->name('product-images.update');
    Route::delete('product-images/{imageProduct}', [ImageProductController::class, 'destroy'])->name('product-images.destroy');
    Route::post('product-images/{imageProduct}/set-primary', [ImageProductController::class, 'setPrimary'])->name('product-images.set-primary');
    Route::post('products/{product}/images/update-order', [ImageProductController::class, 'updateOrder'])->name('product-images.update-order');
});

// Dynamic subcategories dropdown
Route::get('get-subcategories/{categoryId}', [ProductController::class, 'getSubcategories'])->name('get.subcategories');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';