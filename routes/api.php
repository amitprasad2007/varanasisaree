<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\BrandController;
use App\HttP\Controllers\Api\CouponController;
use App\HttP\Controllers\Api\TestimonialController;
use App\HttP\Controllers\Api\UserController;
use App\HttP\Controllers\Api\WhishlistController;
use App\HttP\Controllers\Api\ProductController;
use App\HttP\Controllers\Api\CartController;
use App\HttP\Controllers\Api\OrderController;
use App\HttP\Controllers\Api\AddressController;


// Testimonial APIs
Route::get('/testimonials', [TestimonialController::class, 'apiGetTestimonials']);

// Category APIs
Route::get('/categories', [CategoryController::class, 'apiIndex']);

// Product APIs
Route::get('/featured-products', [ProductController::class, 'getFeaturedProducts']);
Route::get('/bestseller-products', [ProductController::class, 'getBestsellerProducts']);
Route::get('/getProductDetails/{slug}',[ProductController::class, 'getProductDetails']);
Route::get('/getRelatedProducts/{slug}',[ProductController::class, 'getRelatedProducts']);

// Banner APIs
Route::get('/getBanners', [BannerController::class, 'apiGetBanners']);
Route::get('/getheriBanner', [BannerController::class, 'apiGetheriBanner']);

// API Coupon Validation
Route::post('/coupons/validate', [CouponController::class, 'validate'])->name('api.coupons.validate');

// Customer Authentication APIs
Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);

// Protected routes that require authentication
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [UserController::class, 'profile']);
    Route::post('/logout', [UserController::class, 'logout']);

    // Cart operations
    Route::post('/cart/add', [CartController::class, 'addToCart']);
    Route::put('/cart/update', [CartController::class, 'updateCart']);
    Route::delete('/cart/remove', [CartController::class, 'removeFromCart']);
    Route::get('/cart/checkout', [CartController::class, 'getCheckoutCart']);

    // Order operations
    Route::post('/order/buy-now', [OrderController::class, 'buyNow']);
    Route::post('/order/checkout', [OrderController::class, 'checkout']);
    Route::get('/orders', [OrderController::class, 'listOrders']);

    // Address operations
    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::put('/addresses/{id}', [AddressController::class, 'update']);
    Route::delete('/addresses/{id}', [AddressController::class, 'destroy']);
});




