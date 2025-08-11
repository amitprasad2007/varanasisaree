<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\POS\SaleController;

// Standalone POS APIs (not under dashboard middleware)
Route::prefix('pos')->group(function () {
    Route::get('/products/search', [SaleController::class, 'searchProducts']);
    Route::get('/scan', [SaleController::class, 'scan']);
    Route::post('/sales', [SaleController::class, 'createSale']);
    Route::post('/sales/{id}/return', [SaleController::class, 'processReturn']);
    Route::get('/sales/report', [SaleController::class, 'report']);
    Route::post('/sales/hold', [SaleController::class, 'holdSale']);
    Route::get('/sales/{id}/resume', [SaleController::class, 'resumeSale']);
    Route::post('/sales/{id}/finalize', [SaleController::class, 'finalizeSale']);
    Route::get('/sales/{id}/invoice', [SaleController::class, 'showInvoice']);
    Route::post('/customers', [SaleController::class, 'addCustomer']);
});


