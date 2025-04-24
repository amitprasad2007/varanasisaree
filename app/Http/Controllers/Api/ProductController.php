<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;

class ProductController extends Controller
{
    public function getFeaturedProducts()
    {
        $products = Product::with(['imageproducts', 'category'])
            ->where('status', 'active')
            ->where('stock_quantity', '>', 0)
            ->latest()
            ->take(3)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'images' => $product->imageproducts->map(fn($img) => asset('storage/' . $img->image_path)),
                    'price' => (float) $product->price,
                    'originalPrice' => (float) ($product->price + ($product->price * $product->discount / 100)),
                    'rating' => 4.8, // Placeholder - you might want to implement a real rating system
                    'reviewCount' => 100, // Placeholder - implement real review system
                    'category' => $product->category->name,
                    'isNew' => $product->created_at->gt(now()->subDays(7)),
                ];
            });

        return response()->json($products);
    }

    /**
     * Get bestseller products for API
     */
    public function getBestsellerProducts()
    {
        $products = Product::with(['imageproducts', 'category'])
            ->where('status', 'active')
            ->where('is_bestseller', true)
            ->where('stock_quantity', '>', 0)
            ->take(5)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'images' => $product->imageproducts->map(fn($img) => asset('storage/' . $img->image_path)),
                    'price' => (float) $product->price,
                    'originalPrice' => $product->discount > 0 ?
                        (float) ($product->price + ($product->price * $product->discount / 100)) :
                        null,
                    'rating' => 4.8, // Placeholder - implement real rating system
                    'reviewCount' => 100, // Placeholder - implement real review system
                    'category' => $product->category->title,
                    'isBestseller' => true
                ];
            });

        return response()->json($products);
    }
}
