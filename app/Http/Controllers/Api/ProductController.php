<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

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

        // Prepare variants and derive colors/default variant
        $variantCollection = collect($product->variants ?? []);

        // Determine default variant: prefer active with stock, otherwise first available
        $defaultVariant = $variantCollection
            ->first(function ($variant) {
                $status = $variant->status;
                $isActive = ($status === 'active' || $status === 1 || $status === true || $status === '1' || $status === null);
                return $isActive && (int) $variant->stock_quantity > 0;
            }) ?? $variantCollection->first();

        $defaultVariantId = optional($defaultVariant)->id;

        // Build colors list based on variants' colors (attach a representative variantId)
        $colors = $variantCollection
            ->filter(fn($variant) => $variant->color)
            ->groupBy('color_id')
            ->map(function ($variantsByColor) {
                $variantSample = $variantsByColor->first();
                $color = $variantSample->color;
                $available = $variantsByColor->contains(function ($variant) {
                    $status = $variant->status;
                    $isActive = ($status === 'active' || $status === 1 || $status === true || $status === '1');
                    return (int) $variant->stock_quantity > 0 && ($status === null ? true : $isActive);
                });
                return [
                    'name' => $color->name,
                    'value' => $color->hex_code,
                    'available' => $available,
                    'variantId' => $variantSample->id,
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

        // Build variants payload
        $variants = $variantCollection->map(function ($variant) use ($product) {
            // Variant images: prefer variant->images list, then variant->image_path
            $variantImages = collect($variant->images ?? [])
                ->pluck('image_path')
                ->filter()
                ->values();
            if ($variantImages->isEmpty() && !empty($variant->image_path)) {
                $variantImages = collect([$variant->image_path]);
            }

            $status = $variant->status;
            $isActive = ($status === 'active' || $status === 1 || $status === true || $status === '1' || $status === null);
            $available = $isActive && (int) $variant->stock_quantity > 0;

            $price = (float) ($variant->price ?? $product->price);
            $discount = (float) ($variant->discount ?? $product->discount ?? 0);
            $originalPrice = (float) ($price + ($price * $discount / 100));

            return [
                'id' => $variant->id,
                'color' => $variant->color ? [
                    'name' => $variant->color->name,
                    'value' => $variant->color->hex_code,
                ] : null,
                'sku' => $variant->sku,
                'images' => $variantImages->map(fn($path) => asset('storage/' . $path)),
                'stock' => (int) $variant->stock_quantity,
                'available' => $available,
                'price' => $price,
                'originalPrice' => $originalPrice,
            ];
        })->values();

        // Top-level images and sku should match the default variant when present
        $topImages = $product->resolveImagePaths()->map(fn($path) => asset('storage/' . $path));
        $topSku = null;
        if ($defaultVariant) {
            $dvImages = collect($defaultVariant->images ?? [])->pluck('image_path')->filter()->values();
            if ($dvImages->isEmpty() && !empty($defaultVariant->image_path)) {
                $dvImages = collect([$defaultVariant->image_path]);
            }
            if ($dvImages->isNotEmpty()) {
                $topImages = $dvImages->map(fn($path) => asset('storage/' . $path));
            }
            $topSku = $defaultVariant->sku;
        }

        // Price/discount should reflect default variant when available
        $basePrice = $defaultVariant ? (float) ($defaultVariant->price ?? $product->price) : (float) $product->price;
        $baseDiscount = $defaultVariant && $defaultVariant->discount !== null
            ? (float) $defaultVariant->discount
            : (float) $product->discount;
        $baseOriginalPrice = (float) ($basePrice + ($basePrice * $baseDiscount / 100));

        return response()->json([
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'brand'=> $product->brand ? [
                'id' => $product->brand->id,
                'name' => $product->brand->name,
                'slug' => $product->brand->slug,
            ] : null,
            'price'=> $basePrice,
            'originalPrice'=> $baseOriginalPrice,
            'discountPercentage'=> number_format($baseDiscount, 2, '.', ''),
            'rating'=> $product->rating,
            'reviewCount'=> $product->reviewCount,
            'category'=> $product->category,
            'subCategory'=> $product->subcategory,
            'sku' => $topSku,
            'images'=> $topImages,
            'colors' => $colors,
            'defaultVariantId' => $defaultVariantId,
            'variants' => $variants,
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

    public function getallproducts(){
        $products = Product::with(['imageproducts', 'variants.images', 'category'])
            ->where('status', 'active')
            ->get();

        if ($products->isEmpty()) {
            return response()->json([]);
        }

        // Aggregate approved reviews: count and average rating
        $reviewStats = DB::table('product_reviews')
            ->select('product_id', DB::raw('COUNT(*) as review_count'), DB::raw('AVG(rating) as avg_rating'))
            ->whereIn('product_id', $products->pluck('id'))
            ->where('is_approved', true)
            ->groupBy('product_id')
            ->get()
            ->keyBy('product_id');

        $result = $products->map(function (Product $product) use ($reviewStats) {
            // Resolve images; skip products without any
            $imagePaths = $product->resolveImagePaths();
            if ($imagePaths->isEmpty()) {
                return null;
            }

            // Prices
            $basePrice = (float) $product->price;
            $discountPercent = (float) ($product->discount ?? 0);
            $finalPrice = (int) round($basePrice - ($basePrice * $discountPercent / 100));

            // Reviews
            $stats = $reviewStats->get($product->id);
            $avgRating = $stats ? (float) $stats->avg_rating : 0.0;
            $reviewCount = $stats ? (int) $stats->review_count : 0;

            return [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'images' => $imagePaths->map(fn($path) => asset('storage/' . ltrim($path, '/')))->values(),
                'price' => $finalPrice,
                'originalPrice' => $discountPercent > 0 ? (int) round($basePrice) : null,
                'rating' => round($avgRating, 1),
                'reviewCount' => $reviewCount,
                'category' => optional($product->category)->title,
                'isNew' => $product->created_at ? $product->created_at->gt(now()->subDays(30)) : false,
                'isBestseller' => (bool) ($product->is_bestseller ?? false),
            ];
        })->filter()->map(function ($item) {
            if ($item['originalPrice'] === null) {
                unset($item['originalPrice']);
            }
            return $item;
        })->values();

        return response()->json($result);
    }

}
