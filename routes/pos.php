<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\POS\SaleController;
use Inertia\Inertia;

// POS Page and APIs
Route::prefix('pos')->group(function () {
    // Inertia view for POS UI
    Route::get('/', function () { return Inertia::render('POS/Index'); })->name('pos.index');
    Route::get('/products/search', [SaleController::class, 'searchProducts']);
    Route::get('/scan', [SaleController::class, 'scan']);
    Route::get('/sales/list', [SaleController::class, 'listSales']);
    Route::get('/sales/{id}/invoice', [SaleController::class, 'showInvoice']);
    Route::post('/sales', [SaleController::class, 'createSale']);
    Route::post('/sales/{id}/return', [SaleController::class, 'processReturn']);
    Route::get('/sales/report', [SaleController::class, 'report']);
    Route::post('/sales/hold', [SaleController::class, 'holdSale']);
    Route::get('/sales/{id}/resume', [SaleController::class, 'resumeSale']);
    Route::post('/sales/{id}/finalize', [SaleController::class, 'finalizeSale']);
    Route::post('/customers', [SaleController::class, 'addCustomer']);
    Route::get('/credit-notes', [SaleController::class, 'listCreditNotes']);
});


