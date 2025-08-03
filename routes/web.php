<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\ImageProductController;
use App\Http\Controllers\ProductSpecificationController;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\VideoProviderController;
use App\Http\Controllers\ProductVideoController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\TestimonialController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ColorController;
use App\Http\Controllers\SizeController;
use App\Http\Controllers\ProductVariantController;
use App\Http\Controllers\ProductBulkUploadController;

// Admin Auth Routes
Route::get('/', [AuthenticatedSessionController::class, 'create'])->name('login');


Route::middleware('auth')->group(function () {
    Route::get('dashboard', [AuthenticatedSessionController::class, 'dashboard'] )->name('dashboard');
    // Categories
    Route::post('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::resource('categories', CategoryController::class);

    // SubCategories
    Route::get('get-subcategories/{categoryId}', [CategoryController::class, 'getSubcategories'])->name('get.subcategories');
    Route::get('subcategories', [CategoryController::class, 'subcatindex'] )->name('subcatindex');
    Route::get('subcategoriescreate', [CategoryController::class, 'createsubcate'] )->name('subcategories.create');
    Route::post('subcategoriesstore', [CategoryController::class, 'substore'] )->name('subcategories.store');
    Route::get('/subcategories/{id}/edit', [CategoryController::class, 'subedit'] )->name('subcategories.edit');
    Route::post('/subcategories/{subcategory}', [CategoryController::class, 'subupdate'])->name('subcategories.update');
    Route::delete('/subcategories/{subcategory}', [CategoryController::class, 'subdestroy'])->name('subcategories.destroy');

    // Brands
    Route::post('/brands/{brand}', [BrandController::class, 'update'])->name('brands.update');
    Route::resource('brands', BrandController::class);

    // Product Bulk Upload
    Route::get('products/bulkupload', [ProductBulkUploadController::class, 'index'])->name('products.bulkupload');
    Route::post('products/bulkupload', [ProductBulkUploadController::class, 'upload'])->name('products.bulkupload.store');
    Route::get('products/bulkupload/template', [ProductBulkUploadController::class, 'downloadTemplate'])->name('products.bulkupload.template');

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

    // Product Specifications
    Route::get('products/{product}/specifications', [ProductSpecificationController::class, 'index'])->name('product-specifications.index');
    Route::get('products/{product}/specifications/create', [ProductSpecificationController::class, 'create'])->name('product-specifications.create');
    Route::post('products/{product}/specifications', [ProductSpecificationController::class, 'store'])->name('product-specifications.store');
    Route::get('products/{product}/specifications/{productSpecification}/edit', [ProductSpecificationController::class, 'edit'])->name('product-specifications.edit');
    Route::put('products/{product}/specifications/{productSpecification}', [ProductSpecificationController::class, 'update'])->name('product-specifications.update');
    Route::delete('products/{product}/specifications/{productSpecification}', [ProductSpecificationController::class, 'destroy'])->name('product-specifications.destroy');
    // Video Providers

    Route::resource('video-providers', VideoProviderController::class);

    // Product Videos
    Route::get('products/{product}/videos', [ProductVideoController::class, 'index'])->name('product-videos.index');
    Route::get('products/{product}/videos/create', [ProductVideoController::class, 'create'])->name('product-videos.create');
    Route::post('products/{product}/videos', [ProductVideoController::class, 'store'])->name('product-videos.store');
    Route::get('products/{product}/videos/{video}/edit', [ProductVideoController::class, 'edit'])->name('product-videos.edit');
    Route::put('products/{product}/videos/{video}', [ProductVideoController::class, 'update'])->name('product-videos.update');
    Route::delete('products/{product}/videos/{productVideo}', [ProductVideoController::class, 'destroy'])->name('product-videos.destroy');
    Route::post('products/{product}/videos/update-order', [ProductVideoController::class, 'updateOrder'])->name('product-videos.update-order');
    Route::post('product-videos/{video}/set-featured', [ProductVideoController::class, 'setFeatured'])->name('product-videos.set-featured');

    // Banners
    Route::resource('banners', BannerController::class);
    Route::post('banners/update-order', [BannerController::class, 'updateOrder'])->name('banners.update-order');
    Route::post('banners/{banner}/update-status', [BannerController::class, 'updateStatus'])->name('banners.update-status');

    // Coupons
    Route::resource('coupons', CouponController::class);
    Route::post('coupons/{coupon}/update-status', [CouponController::class, 'updateStatus'])->name('coupons.update-status');

    // Testimonials
    Route::resource('testimonials', TestimonialController::class);
    Route::post('testimonials/{testimonial}/update-status', [TestimonialController::class, 'updateStatus'])->name('testimonials.update-status');
    Route::post('testimonials/{testimonial}/update-approval-status', [TestimonialController::class, 'updateApprovalStatus'])->name('testimonials.update-approval-status');

    // Colors
    Route::resource('colors', ColorController::class);
    // Sizes
    Route::resource('sizes', SizeController::class);
    // Product Variants
    Route::get('products/{product}/variants', [ProductVariantController::class, 'index'])->name('product-variants.index');
    Route::get('products/{product}/variants/create', [ProductVariantController::class, 'create'])->name('product-variants.create');
    Route::post('products/{product}/variants', [ProductVariantController::class, 'store'])->name('product-variants.store');
    Route::get('products/{product}/variants/{variant}/edit', [ProductVariantController::class, 'edit'])->name('product-variants.edit');
    Route::put('products/{product}/variants/{variant}', [ProductVariantController::class, 'update'])->name('product-variants.update');
    Route::delete('products/{product}/variants/{variant}', [ProductVariantController::class, 'destroy'])->name('product-variants.destroy');



    Route::resource('users', UserManagementController::class);

});











require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
