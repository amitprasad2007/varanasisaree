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

     /**
     * Get product details for API
     */

    public function getProductDetails($slug) {
        $product = Product::where('slug', $slug)
                ->with(['specifications', 'category', 'subcategory', 'brand', 'imageproducts', 'videos', 'primaryImage', 'featuredVideo'])
                ->first();

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json([
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'brand'=> $product->brand,
            'price'=> (float)$product->price,
            'originalPrice'=> (float) ($product->price + ($product->price * $product->discount / 100)),
            'discountPercentage'=> $product->discount,
            'rating'=> $product->rating,
            'reviewCount'=> $product->reviewCount,
            'category'=> $product->category,
            'subCategory'=> $product->subcategory,
            'images'=> $product->imageproducts->map(fn($img) => asset('storage/' . $img->image_path)),
            'colors' => [
                ['name' => "Gold", 'value' => "#D4AF37", 'available' => true],
                ['name' => "Red", 'value' => "#9E2A2B", 'available' => true],
                ['name' => "Maroon", 'value' => "#800020", 'available' => true],
                ['name' => "Navy Blue", 'value' => "#000080", 'available' => false],
            ],
            'sizes'=> $product->size,
            'stock'=> $product->stock_quantity,
            'description'=> $product->description,
            'specifications'=> [
                [ 'name'=> 'Material', 'value'=> 'Pure Katan Silk' ],
                [ 'name'=> 'Weave', 'value'=> 'Handloom' ],
                [ 'name'=> 'Zari Type', 'value'=> 'Real Gold Zari (tested)' ],
                [ 'name'=> 'Length', 'value'=> '5.5 meters (saree), 0.8 meters (blouse)' ],
                [ 'name'=> 'Width', 'value'=> '45 inches' ],
                [ 'name'=> 'Weight', 'value'=> '750-800 grams' ],
                [ 'name'=> 'Care', 'value'=> 'Dry Clean Only' ]
            ],
            'isBestseller'=> $product->is_bestseller
        ]);
    }
    public function getRelatedProducts($slug) {
        // Retrieve the current product
        $currentProduct = Product::where('slug', $slug)->first();

        if (!$currentProduct) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        // Find related products based on category, subcategory, brand, and price
        $relatedProducts = Product::with(['imageproducts', 'category'])
            ->where('id', '!=', $currentProduct->id) // Exclude the current product
            ->where('category_id', $currentProduct->category_id)
            ->orWhere('subcategory_id', $currentProduct->subcategory_id)
            ->orWhere('brand_id', $currentProduct->brand_id)
            ->orWhereBetween('price', [
                max(0, $currentProduct->price - 10), // Adjust the range as needed
                $currentProduct->price + 10
            ])
            ->where('status', 'active')
            ->take(5) // Limit the number of related products
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'images' => $product->imageproducts->map(fn($img) => asset('storage/' . $img->image_path)),
                    'price' => (float) $product->price,
                    'originalPrice' => (float) ($product->price + ($product->price * $product->discount / 100)),
                    'category' => $product->category->name,
                ];
            });

        return response()->json($relatedProducts);
    }

}
