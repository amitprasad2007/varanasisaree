<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Testimonial APIs
Route::get('/api/testimonials', [TestimonialController::class, 'apiGetTestimonials']);

// Category APIs
Route::get('/api/categories', [CategoryController::class, 'apiIndex']);



// Product APIs
Route::get('/api/featured-products', [ProductController::class, 'getFeaturedProducts']);
Route::get('/api/bestseller-products', [ProductController::class, 'getBestsellerProducts']);

Route::get('/api/getBanners', [BannerController::class, 'apiGetBanners']);

// API Coupon Validation
Route::post('/api/coupons/validate', [CouponController::class, 'validate'])->name('api.coupons.validate');



