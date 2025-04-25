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


// Testimonial APIs
Route::get('/testimonials', [TestimonialController::class, 'apiGetTestimonials']);

// Category APIs
Route::get('/categories', [CategoryController::class, 'apiIndex']);

// Product APIs
Route::get('/featured-products', [ProductController::class, 'getFeaturedProducts']);
Route::get('/bestseller-products', [ProductController::class, 'getBestsellerProducts']);

// Banner APIs
Route::get('/getBanners', [BannerController::class, 'apiGetBanners']);
Route::get('/getheriBanner', [BannerController::class, 'apiGetheriBanner']);


// API Coupon Validation
Route::post('/coupons/validate', [CouponController::class, 'validate'])->name('api.coupons.validate');



