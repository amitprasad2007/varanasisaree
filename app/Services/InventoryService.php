<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InventoryService
{
    /**
     * Reserve inventory when order is confirmed
     */
    public function reserveInventory(Order $order): void
    {
        DB::transaction(function () use ($order) {
            foreach ($order->productItems as $item) {
                if ($item->product_variant_id) {
                    // Handle variant inventory
                    $variant = ProductVariant::find($item->product_variant_id);
                    if ($variant && $variant->stock_quantity >= $item->quantity) {
                        $variant->decrement('stock_quantity', $item->quantity);
                        
                        // Log inventory change
                        Log::info('Inventory reserved for variant', [
                            'variant_id' => $variant->id,
                            'product_id' => $item->product_id,
                            'quantity_reserved' => $item->quantity,
                            'remaining_stock' => $variant->stock_quantity,
                            'order_id' => $order->id
                        ]);

                        // Check for low stock
                        if ($variant->stock_quantity <= 5) {
                            $this->checkLowStock($variant->product, $variant->stock_quantity);
                        }
                    } else {
                        Log::error('Insufficient stock for variant', [
                            'variant_id' => $item->product_variant_id,
                            'required_quantity' => $item->quantity,
                            'available_stock' => $variant ? $variant->stock_quantity : 0,
                            'order_id' => $order->id
                        ]);
                    }
                } else {
                    // Handle main product inventory
                    $product = Product::find($item->product_id);
                    if ($product && $product->stock_quantity >= $item->quantity) {
                        $product->decrement('stock_quantity', $item->quantity);
                        
                        // Log inventory change
                        Log::info('Inventory reserved for product', [
                            'product_id' => $product->id,
                            'quantity_reserved' => $item->quantity,
                            'remaining_stock' => $product->stock_quantity,
                            'order_id' => $order->id
                        ]);

                        // Check for low stock
                        if ($product->stock_quantity <= 5) {
                            $this->checkLowStock($product, $product->stock_quantity);
                        }
                    } else {
                        Log::error('Insufficient stock for product', [
                            'product_id' => $item->product_id,
                            'required_quantity' => $item->quantity,
                            'available_stock' => $product ? $product->stock_quantity : 0,
                            'order_id' => $order->id
                        ]);
                    }
                }
            }
        });
    }

    /**
     * Release inventory when order is cancelled
     */
    public function releaseInventory(Order $order): void
    {
        DB::transaction(function () use ($order) {
            foreach ($order->productItems as $item) {
                if ($item->product_variant_id) {
                    // Handle variant inventory
                    $variant = ProductVariant::find($item->product_variant_id);
                    if ($variant) {
                        $variant->increment('stock_quantity', $item->quantity);
                        
                        Log::info('Inventory released for variant', [
                            'variant_id' => $variant->id,
                            'product_id' => $item->product_id,
                            'quantity_released' => $item->quantity,
                            'new_stock' => $variant->stock_quantity,
                            'order_id' => $order->id
                        ]);
                    }
                } else {
                    // Handle main product inventory
                    $product = Product::find($item->product_id);
                    if ($product) {
                        $product->increment('stock_quantity', $item->quantity);
                        
                        Log::info('Inventory released for product', [
                            'product_id' => $product->id,
                            'quantity_released' => $item->quantity,
                            'new_stock' => $product->stock_quantity,
                            'order_id' => $order->id
                        ]);
                    }
                }
            }
        });
    }

    /**
     * Check if sufficient inventory is available
     */
    public function checkInventoryAvailability(Order $order): array
    {
        $availability = [];
        $hasInsufficientStock = false;

        foreach ($order->productItems as $item) {
            if ($item->product_variant_id) {
                $variant = ProductVariant::find($item->product_variant_id);
                $available = $variant ? $variant->stock_quantity : 0;
                $sufficient = $available >= $item->quantity;
                
                $availability[] = [
                    'item_id' => $item->id,
                    'product_id' => $item->product_id,
                    'variant_id' => $item->product_variant_id,
                    'required_quantity' => $item->quantity,
                    'available_quantity' => $available,
                    'sufficient' => $sufficient,
                    'type' => 'variant'
                ];

                if (!$sufficient) {
                    $hasInsufficientStock = true;
                }
            } else {
                $product = Product::find($item->product_id);
                $available = $product ? $product->stock_quantity : 0;
                $sufficient = $available >= $item->quantity;
                
                $availability[] = [
                    'item_id' => $item->id,
                    'product_id' => $item->product_id,
                    'required_quantity' => $item->quantity,
                    'available_quantity' => $available,
                    'sufficient' => $sufficient,
                    'type' => 'product'
                ];

                if (!$sufficient) {
                    $hasInsufficientStock = true;
                }
            }
        }

        return [
            'available' => !$hasInsufficientStock,
            'items' => $availability
        ];
    }

    /**
     * Check for low stock and trigger notifications
     */
    private function checkLowStock($product, $currentStock): void
    {
        if ($currentStock <= 5) {
            // Trigger low stock notification
            app(NotificationService::class)->sendLowStockNotification($product, $currentStock);
        }
    }

    /**
     * Get inventory summary
     */
    public function getInventorySummary(): array
    {
        $lowStockProducts = Product::where('stock_quantity', '<=', 5)->count();
        $outOfStockProducts = Product::where('stock_quantity', '=', 0)->count();
        $totalProducts = Product::count();
        $totalStockValue = Product::sum(DB::raw('stock_quantity * price'));

        return [
            'low_stock_products' => $lowStockProducts,
            'out_of_stock_products' => $outOfStockProducts,
            'total_products' => $totalProducts,
            'total_stock_value' => $totalStockValue,
        ];
    }

    /**
     * Update product stock
     */
    public function updateStock(int $productId, int $quantity, ?int $variantId = null): bool
    {
        try {
            if ($variantId) {
                $variant = ProductVariant::find($variantId);
                if ($variant) {
                    $variant->update(['stock_quantity' => $quantity]);
                    return true;
                }
            } else {
                $product = Product::find($productId);
                if ($product) {
                    $product->update(['stock_quantity' => $quantity]);
                    return true;
                }
            }
            return false;
        } catch (\Exception $e) {
            Log::error('Failed to update stock', [
                'product_id' => $productId,
                'variant_id' => $variantId,
                'quantity' => $quantity,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
}
