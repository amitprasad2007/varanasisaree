<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\TestimonialController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CustomerAuthController;
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\AboutusController as ApiAboutusController;
use App\Http\Controllers\Api\SearchController as ApiSearchController;
use App\Http\Controllers\Api\CollectionController;
use App\Http\Controllers\Api\ProductReviewController;
use App\Http\Controllers\Api\RecentlyViewedController;
use App\Http\Controllers\Api\UserLogController;
use App\Http\Controllers\Api\GuestDataController;

// Testimonial APIs
Route::get('/testimonials', [TestimonialController::class, 'apiGetTestimonials']);

// Category APIs
Route::get('/categories', [CategoryController::class, 'apiIndex']);

// About Us API
Route::get('/aboutus', [ApiAboutusController::class, 'show']);


// Category APIs - products and details
Route::get('/products/{categories}', [CategoryController::class, 'catproducts']);
Route::get('/categories/{categories}/details', [CategoryController::class, 'catdetails']);

Route::get('getcategorybyname/{slug}', [CategoryController::class, 'getcategorybyname']);

// Product APIs
Route::get('/featured-products', [ProductController::class, 'getFeaturedProducts']);
Route::get('/bestseller-products', [ProductController::class, 'getBestsellerProducts']);


Route::get('/getProductDetails/{slug}',[ProductController::class, 'getProductDetails']);
Route::get('/getRelatedProducts/{slug}',[ProductController::class, 'getRelatedProducts']);
Route::get('/getallproducts', [ProductController::class, 'getallproducts']);


// Banner APIs
Route::get('/getBanners', [BannerController::class, 'apiGetBanners']);
Route::get('/getheriBanner', [BannerController::class, 'apiGetheriBanner']);

// Product Review APIs
Route::get('/product-reviews', [ProductReviewController::class, 'getProductReviews']);
Route::get('/product-reviews/stats', [ProductReviewController::class, 'getReviewStats']);

// API Coupon Validation
Route::post('/coupons/validate', [CouponController::class, 'validate'])->name('api.coupons.validate');

// Search suggestions
Route::get('/search/suggestions', [ApiSearchController::class, 'suggestions']);
Route::get('/getcategoryfillters/{slug}', [ApiSearchController::class, 'getcategoryfillters']);
Route::get('/getbestsellerfillters/bestsellers/', [ApiSearchController::class, 'getbestsellerfillters']);

Route::get('/getfeaturedfillters/featured/', [ApiSearchController::class, 'getfeaturedfillters']);
Route::get('/navitems', [ApiSearchController::class, 'navitems']);

// Collections
Route::get('/collection-types', [CollectionController::class, 'types']);
Route::get('/collections', [CollectionController::class, 'index']);
Route::get('/collections/{slug}', [CollectionController::class, 'show']);


//customer forgot password
Route::post('/forgot-password', [CustomerAuthController::class, 'forgotPassword']);
Route::post('/change-token-check',[CustomerAuthController::class, 'changetokencheck']);
Route::post('/changepassword',[CustomerAuthController::class, 'changepassword']);

// Logs: attach guest session to user

Route::post('/guestlogs', [UserLogController::class, 'store']);

// Customer Authentication APIs (separate guard)
Route::post('/register', [CustomerAuthController::class, 'register']);
Route::post('/login', [CustomerAuthController::class, 'login']);

// Protected routes that require authentication
Route::middleware(['auth:sanctum', 'ability:customer'])->group(function () {
    Route::get('/user', [CustomerAuthController::class, 'profile']);
    Route::post('/logout', [CustomerAuthController::class, 'logout']);

    // Cart operations
    Route::post('/cart/add', [CartController::class, 'addToCart']);
    Route::post('/wishcart/add', [CartController::class, 'wishaddToCart']);
    Route::put('/cart/update', [CartController::class, 'updateCart']);
    Route::delete('/cart/remove', [CartController::class, 'removeFromCart']);
    Route::get('/cart/checkout', [CartController::class, 'getCheckoutCart']);
    Route::get('/cart/summary', [CartController::class, 'getCartSummary']);
    Route::get('/recommended-products', [CartController::class, 'getRecommendedProducts']);

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

    // Logs: store user events (also works for guests if token sent)
    Route::post('/logs', [UserLogController::class, 'store']);

    Route::post('/logs/attach-session', [UserLogController::class, 'attachSession']);
    // Wishlist operations
    Route::get('/wishlist', [WishlistController::class, 'getWishlistItems']);
    Route::post('/wishlist', [WishlistController::class, 'add']);
    Route::delete('/wishlist/{productId}', [WishlistController::class, 'remove']);
    Route::post('/sync-wishlist', [WishlistController::class, 'sync']);
    Route::post('/checkwishlist', [WishlistController::class, 'checkwishlist']);


    // Recently viewed operations
    Route::get('/recently-viewed', [RecentlyViewedController::class, 'index']);
    Route::post('/recently-viewed', [RecentlyViewedController::class, 'store']);
    Route::post('/sync-recently-viewed', [RecentlyViewedController::class, 'sync']);


    Route::post('/wishlistremovebyid/{wishlist}',[WishlistController::class, 'wishlistremovebyid' ]);

    // Claim guest data into the authenticated account while keeping session_token
    Route::post('/guest/claim', [GuestDataController::class, 'claim']);

    // Product Review operations (authenticated)
    Route::post('/product-reviews', [ProductReviewController::class, 'storeReview']);

    Route::get('/getrecommededfillters/recommeded/', [ApiSearchController::class, 'getrecommededfillters']);
    Route::get('/recommeded-products', [ProductController::class, 'getRecommededProducts']);

});

// Guest endpoints (no auth): use session_token for identification
Route::prefix('guest')->group(function () {
    // Guest Wishlist
    Route::post('/wishlist', [WishlistController::class, 'guestAdd']);
    Route::delete('/wishlist/{productId}', [WishlistController::class, 'guestRemove']);
    Route::get('/wishlist', [WishlistController::class, 'guestList']);
    Route::post('/checkwishlist', [WishlistController::class, 'guestcheckwishlist']);

    // Guest Recently Viewed
    Route::post('/recently-viewed', [RecentlyViewedController::class, 'guestStore']);
    Route::get('/recently-viewed', [RecentlyViewedController::class, 'guestIndex']);

    // Logs: attach guest session to user
    Route::post('/logs/attach-session', [UserLogController::class, 'attachSession']);

});

// // Protected customer routes
// Route::middleware(['auth:sanctum', 'ability:customer'])->group(function () {
//     Route::get('/customer/me', [CustomerAuthController::class, 'profile']);
//     Route::post('/customer/logout', [CustomerAuthController::class, 'logout']);
// });




