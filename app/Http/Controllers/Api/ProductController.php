<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;

class ProductController extends Controller
{
    public function getFeaturedProducts()
    {
        $products = Product::with(['imageproducts', 'category', 'variants.images'])
            ->where('status', 'active')
            ->where('stock_quantity', '>', 0)
            ->latest()
            ->take(20)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($product) {
                $imagePaths = $product->resolveImagePaths();
                if ($imagePaths->isEmpty()) {
                    return null;
                }
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'images' => $imagePaths->map(fn($path) => asset('storage/' . $path)),
                    'price' => (float) $product->price,
                    'originalPrice' => (float) ($product->price + ($product->price * $product->discount / 100)),
                    'rating' => 4.8, // Placeholder - you might want to implement a real rating system
                    'reviewCount' => 100, // Placeholder - implement real review system
                    'category' => $product->category->name,
                    'isNew' => $product->created_at->gt(now()->subDays(7)),
                ];
            })
            ->filter()
            ->values();

        return response()->json($products);
    }

    /**
     * Get bestseller products for API
     */
    public function getBestsellerProducts()
    {
        $products = Product::with(['imageproducts', 'category', 'variants.images'])
            ->where('status', 'active')
            ->where('is_bestseller', true)
            ->where('stock_quantity', '>', 0)
            ->take(20)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($product) {
                $imagePaths = $product->resolveImagePaths();
                if ($imagePaths->isEmpty()) {
                    return null;
                }
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'images' => $imagePaths->map(fn($path) => asset('storage/' . $path)),
                    'price' => (float) $product->price,
                    'originalPrice' => $product->discount > 0 ?
                        (float) ($product->price + ($product->price * $product->discount / 100)) :
                        null,
                    'rating' => 4.8, // Placeholder - implement real rating system
                    'reviewCount' => 100, // Placeholder - implement real review system
                    'category' => $product->category->title,
                    'isBestseller' => true
                ];
            })
            ->filter()
            ->values();

        return response()->json($products);
    }

     /**
     * Get product details for API
     */

    public function getProductDetails($slug) {

        $product = Product::where('slug', $slug)
                ->with(['specifications', 'category', 'subcategory', 'brand', 'imageproducts', 'variants.images', 'variants.color', 'videos', 'primaryImage', 'featuredVideo'])
                ->first();
               // dd($product);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        // Build colors list based on variants' colors
        $colors = collect($product->variants)
            ->filter(fn($variant) => $variant->color)
            ->groupBy('color_id')
            ->map(function ($variantsByColor) {
                $variantSample = $variantsByColor->first();
                $color = $variantSample->color;
                $available = $variantsByColor->contains(function ($variant) {
                    $status = $variant->status;
                    $isActive = ($status === 'active' || $status === 1 || $status === true || $status === '1');
                    return $variant->stock_quantity > 0 && ($status === null ? true : $isActive);
                });
                return [
                    'name' => $color->name,
                    'value' => $color->hex_code,
                    'available' => $available,
                ];
            })
            ->values();

        // Build specifications as name/value pairs from ProductSpecification
        $specifications = collect($product->specifications)
            ->map(fn($spec) => [
                'name' => $spec->name,
                'value' => $spec->value,
            ])
            ->values();

        // Add additional specifications from product fields
        $additionalSpecifications = collect([
            'fabric' => $product->fabric,
            'size' => $product->size,
            'work_type' => $product->work_type,
            'occasion' => $product->occasion,
            'weight' => $product->weight,
        ])
            ->filter(fn($value) => !is_null($value) && $value !== '')
            ->map(function ($value, $key) {
                return [
                    'name' => ucwords(str_replace('_', ' ', $key)),
                    'value' => $value,
                ];
            })
            ->values();

        $specifications = $specifications->merge($additionalSpecifications)->values();

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
            'images'=> $product->resolveImagePaths()->map(fn($path) => asset('storage/' . $path)),
            'colors' => $colors,
            'sizes'=> $product->size,
            'stock'=> $product->stock_quantity,
            'description'=> $product->description,
            'specifications'=> $specifications,
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
        $relatedProducts = Product::with(['imageproducts', 'category', 'variants.images'])
            ->where('id', '!=', $currentProduct->id) // Exclude the current product
            ->where('category_id', $currentProduct->category_id)
            ->orWhere('subcategory_id', $currentProduct->subcategory_id)
            ->orWhere('brand_id', $currentProduct->brand_id)
            ->orWhereBetween('price', [
                max(0, $currentProduct->price - 10), // Adjust the range as needed
                $currentProduct->price + 10
            ])
            ->where('status', 'active')
            ->take(20) // Limit the number of related products
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($product) {
                $imagePaths = $product->resolveImagePaths();
                if ($imagePaths->isEmpty()) {
                    return null;
                }
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'images' => $imagePaths->map(fn($path) => asset('storage/' . $path)),
                    'price' => (float) $product->price,
                    'originalPrice' => (float) ($product->price + ($product->price * $product->discount / 100)),
                    'category' => $product->category->name,
                ];
            })
            ->filter()
            ->values();

        return response()->json($relatedProducts);
    }

}
