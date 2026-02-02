<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductReviewController;
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
use App\Http\Controllers\ApiPlaygroundController;
use App\Http\Controllers\RoleManagementController;
use App\Http\Controllers\PermissionManagementController;
use App\Http\Controllers\AboutusController ;
use App\Http\Controllers\AboutusSectionController;
use App\Http\Controllers\BarcodeController;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\ProductVariantImageController;
use App\Http\Controllers\CollectionTypeController as AdminCollectionTypeController;
use App\Http\Controllers\CollectionController as AdminCollectionController;
use App\Http\Controllers\Api\CustomerAuthController;
use App\Http\Controllers\OrderManagementController;
use App\Http\Controllers\UnifiedDashboardController;
use App\Http\Controllers\SalesManagementController;
use App\Http\Controllers\RefundManagementController;



require __DIR__.'/vendor.php';

// OAuth routes (require session support)
Route::get('/auth/{provider}', [CustomerAuthController::class, 'redirectToGoogle']);
Route::get('/auth/{provider}/callback', [CustomerAuthController::class, 'handleGoogleCallback']);

// Admin Auth Routes
// Show login form at root, but avoid conflicting with auth 'login' route name
Route::get('/', [AuthenticatedSessionController::class, 'create'])->name('login.form');


Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [AuthenticatedSessionController::class, 'dashboard'] )->name('dashboard');
    // API Playground
    Route::get('api-playground', [ApiPlaygroundController::class, 'index'])->name('api.playground');
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
    // Product Barcode & QR
    Route::get('products/{product}/barcode', [BarcodeController::class, 'productBarcode'])->name('products.barcode');
    Route::get('products/{product}/qr', [BarcodeController::class, 'productQr'])->name('products.qr');
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

    // About Us (single or multiple records with sections)
    Route::resource('aboutus', AboutusController::class)->parameters([
        'aboutus' => 'aboutus'
    ]);
    Route::get('aboutus/{aboutus}/sections', [AboutusSectionController::class, 'index'])->name('aboutus.sections.index');
    Route::get('aboutus/{aboutus}/sections/create', [AboutusSectionController::class, 'create'])->name('aboutus.sections.create');
    Route::post('aboutus/sections', [AboutusSectionController::class, 'store'])->name('aboutus.sections.store');
    Route::get('aboutus/{aboutus}/sections/{section}/edit', [AboutusSectionController::class, 'edit'])->name('aboutus.sections.edit');
    Route::put('aboutus/{aboutus}/sections/{section}', [AboutusSectionController::class, 'update'])->name('aboutus.sections.update');
    Route::delete('aboutus/{aboutus}/sections/{section}', [AboutusSectionController::class, 'destroy'])->name('aboutus.sections.destroy');

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

    // Content Management - Blog
    Route::resource('blogposts', \App\Http\Controllers\PostController::class);
    Route::resource('blogpost-categories', \App\Http\Controllers\PostCategoryController::class);

    // Content Management - Pages & Policies
    Route::resource('pages', \App\Http\Controllers\PageController::class);

    // Content Management - FAQs
    Route::resource('faqs', \App\Http\Controllers\FaqManagementController::class);
    Route::post('faqs/{faq}/update-status', [\App\Http\Controllers\FaqManagementController::class, 'updateStatus'])->name('faqs.update-status');
    Route::post('faqs/update-order', [\App\Http\Controllers\FaqManagementController::class, 'updateOrder'])->name('faqs.update-order');

    // Content Management - Company Information
    Route::resource('company-info', \App\Http\Controllers\CompanyInfoManagementController::class);

    // Product Variants
    Route::get('products/{product}/variants', [ProductVariantController::class, 'index'])->name('product-variants.index');
    Route::get('products/{product}/variants/create', [ProductVariantController::class, 'create'])->name('product-variants.create');
    Route::post('products/{product}/variants', [ProductVariantController::class, 'store'])->name('product-variants.store');
    Route::get('products/{product}/variants/{variant}/edit', [ProductVariantController::class, 'edit'])->name('product-variants.edit');
    Route::put('products/{product}/variants/{variant}', [ProductVariantController::class, 'update'])->name('product-variants.update');
    Route::delete('products/{product}/variants/{variant}', [ProductVariantController::class, 'destroy'])->name('product-variants.destroy');
    // Variant Barcode & QR
    Route::get('variants/{variant}/barcode', [BarcodeController::class, 'variantBarcode'])->name('variants.barcode');
    Route::get('variants/{variant}/qr', [BarcodeController::class, 'variantQr'])->name('variants.qr');

    // Product Variant Images
    Route::get('variants/{variant}/images', [ProductVariantImageController::class, 'index'])->name('product-variant-images.index');
    Route::get('variants/{variant}/images/create', [ProductVariantImageController::class, 'create'])->name('product-variant-images.create');
    Route::post('variants/{variant}/images', [ProductVariantImageController::class, 'store'])->name('product-variant-images.store');
    Route::put('variant-images/{image}', [ProductVariantImageController::class, 'update'])->name('product-variant-images.update');
    Route::delete('variant-images/{image}', [ProductVariantImageController::class, 'destroy'])->name('product-variant-images.destroy');
    Route::post('variant-images/{image}/set-primary', [ProductVariantImageController::class, 'setPrimary'])->name('product-variant-images.set-primary');
    Route::post('variants/{variant}/images/update-order', [ProductVariantImageController::class, 'updateOrder'])->name('product-variant-images.update-order');

    // Users
    Route::resource('users', UserManagementController::class);

    // Roles
    Route::resource('roles', RoleManagementController::class);

    // Permissions
    Route::resource('permissions', PermissionManagementController::class);

    // Admin controlle Vendors routes
    Route::get('admin/vendors', [VendorController::class, 'index'])->name('admin.vendors.index');   
    Route::get('admin/vendors/create', [VendorController::class, 'create'])->name('admin.vendors.create');
    Route::post('admin/vendors', [VendorController::class, 'store'])->name('admin.vendors.store');
    Route::get('admin/vendors/{id}', [VendorController::class, 'show'])->name('admin.vendors.show');   
    Route::get('admin/vendors/{id}/edit', [VendorController::class, 'edit'])->name('admin.vendors.edit');
    Route::post('admin/vendors/{id}/approve', [VendorController::class, 'approve'])->name('admin.vendors.approve');
    Route::post('admin/vendors/{id}/suspend', [VendorController::class, 'suspend'])->name('admin.vendors.suspend');
    Route::post('admin/vendors/{id}/activate', [VendorController::class, 'activate'])->name('admin.vendors.activate');
    Route::post('admin/vendors/{id}/reject', [VendorController::class, 'reject'])->name('admin.vendors.reject');
    Route::put('admin/vendors/{id}/commission', [VendorController::class, 'updateCommission'])->name('admin.vendors.commission');
    Route::put('admin/vendors/{id}/payment-terms', [VendorController::class, 'updatePaymentTerms'])->name('admin.vendors.payment-terms');
    Route::delete('admin/vendors/{id}', [VendorController::class, 'destroy'])->name('admin.vendors.destroy');
    Route::post('admin/vendors/bulk-action', [VendorController::class, 'bulkAction'])->name('admin.vendors.bulk-action');

    // Vendor Permissions
    Route::get('admin/vendors/{vendor}/permissions', [\App\Http\Controllers\VendorPermissionController::class, 'edit'])->name('admin.vendors.permissions');
    Route::post('admin/vendors/{vendor}/permissions', [\App\Http\Controllers\VendorPermissionController::class, 'update'])->name('admin.vendors.permissions.update');

    // Collection Types
    Route::resource('collection-types', AdminCollectionTypeController::class);

    // Collections
    Route::resource('collections', AdminCollectionController::class);
    Route::post('collections/bulk-update', [AdminCollectionController::class, 'bulkUpdate'])->name('collections.bulk-update');
    Route::get('collections/{collection}/products', [AdminCollectionController::class, 'products'])->name('collections.products');
    Route::post('collections/{collection}/products', [AdminCollectionController::class, 'addProduct'])->name('collections.addProduct');
    Route::delete('collections/{collection}/products/{product}', [AdminCollectionController::class, 'removeProduct'])->name('collections.removeProduct');
    Route::put('collections/{collection}/products/order', [AdminCollectionController::class, 'updateProductOrder'])->name('collections.products.order');

    // Order Management
    Route::get('orders', [OrderManagementController::class, 'index'])->name('orders.index');
    Route::get('orders/{order}', [OrderManagementController::class, 'show'])->name('orders.show');
    Route::put('orders/{order}/status', [OrderManagementController::class, 'updateStatus'])->name('orders.update-status');
    Route::put('orders/{order}/awb', [OrderManagementController::class, 'assignAwb'])->name('orders.assign-awb');
    Route::put('orders/{order}/assign', [OrderManagementController::class, 'assignOrder'])->name('orders.assign');
    Route::put('orders/{order}/priority', [OrderManagementController::class, 'updatePriority'])->name('orders.update-priority');
    Route::put('orders/bulk-status', [OrderManagementController::class, 'bulkUpdateStatus'])->name('orders.bulk-update-status');
    Route::get('orders-statistics', [OrderManagementController::class, 'getStatistics'])->name('orders.statistics');
    Route::get('orders-export', [OrderManagementController::class, 'export'])->name('orders.export');

    // Unified Dashboard
    Route::get('unified-dashboard', [UnifiedDashboardController::class, 'index'])->name('unified-dashboard');
    Route::get('unified-statistics', [UnifiedDashboardController::class, 'getStatistics'])->name('unified-statistics');

     //  Sales Management
     Route::get('sales', [SalesManagementController::class, 'index'])->name('sales.index');
     Route::get('sales/{sale}', [SalesManagementController::class, 'show'])->name('sales.show');
     Route::put('sales/{sale}/status', [SalesManagementController::class, 'updateStatus'])->name('sales.update-status');
     Route::post('sales/{sale}/return', [SalesManagementController::class, 'processReturn'])->name('sales.processReturn');
     Route::post('sales/{sale}/attach-customer', [SalesManagementController::class, 'attachCustomer'])->name('sales.attachCustomer');
     Route::get('sales/{sale}/invoice', [SalesManagementController::class, 'generateInvoice'])->name('sales.invoice');
     Route::get('sales-statistics', [SalesManagementController::class, 'getStatistics'])->name('sales.statistics');
     Route::get('sales-export', [SalesManagementController::class, 'export'])->name('sales.export');

    // Refund Management
    Route::get('refunds/report', [RefundManagementController::class, 'report'])->name('refunds.report');
    Route::get('refunds/export', [RefundManagementController::class, 'export'])->name('refunds.export');
    Route::get('refunds', [RefundManagementController::class, 'index'])->name('refunds.index');
    Route::get('refunds/create', [RefundManagementController::class, 'create'])->name('refunds.create');
    Route::post('refunds', [RefundManagementController::class, 'store'])->name('refunds.store');
    Route::get('refunds/{refund}', [RefundManagementController::class, 'show'])->name('refunds.show');
    Route::post('refunds/{refund}/approve', [RefundManagementController::class, 'approve'])->name('refunds.approve');
    Route::post('refunds/{refund}/reject', [RefundManagementController::class, 'reject'])->name('refunds.reject');
    Route::post('refunds/{refund}/process', [RefundManagementController::class, 'process'])->name('refunds.process');
    Route::put('refund-items/{refundItem}/qc-status', [RefundManagementController::class, 'updateItemQcStatus'])->name('refund-items.update-qc-status');
    Route::get('refund-statistics', [RefundManagementController::class, 'getStatistics'])->name('refunds.statistics');
    Route::get('refunds-export', [RefundManagementController::class, 'export'])->name('refunds.export');

    // Customer refunds UI removed: no customer login/portal flow
    
    // Product Review Management
    Route::get('product-reviews', [ProductReviewController::class, 'index'])->name('product-reviews.index');
    Route::post('product-reviews/{id}/approve', [ProductReviewController::class, 'approve'])->name('product-reviews.approve');
    Route::post('product-reviews/{id}/reject', [ProductReviewController::class, 'reject'])->name('product-reviews.reject');
    Route::delete('product-reviews/{id}', [ProductReviewController::class, 'destroy'])->name('product-reviews.destroy');

    // Vendor Menu Management
    Route::resource('vendor-menus', \App\Http\Controllers\VendorMenuController::class)->parameters([
        'vendor-menus' => 'vendorMenu'
    ]);



    // Image Optimizer
    Route::get('image-optimizer', [\App\Http\Controllers\ImageOptimizerController::class, 'index'])->name('image-optimizer.index');
    Route::get('api/image-optimizer/images', [\App\Http\Controllers\ImageOptimizerController::class, 'getImages'])->name('image-optimizer.get-images');
    Route::post('api/image-optimizer/optimize', [\App\Http\Controllers\ImageOptimizerController::class, 'optimize'])->name('image-optimizer.optimize');

});



require __DIR__.'/settings.php';
require __DIR__.'/auth.php';


