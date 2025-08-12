<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\TestimonialController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\PaymentController;

// Testimonial APIs
Route::get('/testimonials', [TestimonialController::class, 'apiGetTestimonials']);

// Category APIs
Route::get('/categories', [CategoryController::class, 'apiIndex']);


// Category APIs - products and details
Route::get('/products/{categories}', [CategoryController::class, 'catproducts']);
Route::get('/categories/{categories}/details', [CategoryController::class, 'catdetails']);

// Product APIs
Route::get('/featured-products', [ProductController::class, 'getFeaturedProducts']);
Route::get('/bestseller-products', [ProductController::class, 'getBestsellerProducts']);
Route::get('/getProductDetails/{slug}',[ProductController::class, 'getProductDetails']);
Route::get('/getRelatedProducts/{slug}',[ProductController::class, 'getRelatedProducts']);
Route::get('/getallproducts', [ProductController::class, 'getallproducts']);


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
    Route::get('/cart/summary', [CartController::class, 'getCartSummary']);

    // Order operations
    Route::post('/order/buy-now', [OrderController::class, 'buyNow']);
    Route::post('/order/checkout', [OrderController::class, 'checkout']);
    Route::get('/orders', [OrderController::class, 'listOrders']);
    Route::get('/orders/history', [OrderController::class, 'getOrderHistory']);

    // Payment operations
    Route:: post('createrazorpayorder', [PaymentController::class, 'createOrder']);
    Route:: post('paychecksave', [PaymentController::class, 'paychecksave']);
    Route:: get('orderdetails/{orid}', [OrderController::class, 'orderdetails']);
    Route:: get('order/pdf/{orid}', [OrderController::class, 'generateInvoicePdf'])->name('api.order.pdf');

    // Address operations
    Route::get('/addresses', [AddressController::class, 'getAddresses']);
    Route::get('/addressesind', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::put('/addresses/{id}', [AddressController::class, 'update']);
    Route::delete('/addresses/{id}', [AddressController::class, 'destroy']);

    // Wishlist operations
    Route::get('/wishlist/items', [WishlistController::class, 'getWishlistItems']);
});




