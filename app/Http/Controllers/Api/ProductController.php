<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Cart;
use App\Models\RecentView;
use App\Models\Wishlist;
use App\Services\ProductService;

class ProductController extends Controller
{
    public $productService;
    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }
    public function getFeaturedProducts(Request $request)
    {
        $query = Product::with(['imageproducts', 'category', 'variants.images'])
            ->where('status', 'active')
            ->where('stock_quantity', '>', 0)
            ->orderBy('created_at', 'desc');
         // Parse filters
         $priceFilters = $request->query('price', []);
         $colorFilters = $request->query('colors', []);
         $materialFilters = $request->query('material', []);
         $designFilters = $request->query('design', []);
 
         // Normalize filters to arrays
         $toArray = function ($value) {
             if (is_string($value)) {
                 // support comma-separated
                 return array_values(array_filter(array_map('trim', explode(',', $value))));
             }
             if (is_array($value)) {
                 return array_values(array_filter($value, fn ($v) => $v !== null && $v !== ''));
             }
             return [];
         };
 
         $priceFilters = $toArray($priceFilters);
         $colorFilters = $toArray($colorFilters);
         $materialFilters = $toArray($materialFilters);
         $designFilters = $toArray($designFilters);
 
         // Apply price filters on final price (price - price * discount/100)
         if (!empty($priceFilters)) {
             $query->where(function ($q) use ($priceFilters) {
                 foreach ($priceFilters as $filter) {
                     switch ($filter) {
                         case 'under-10000':
                             $q->orWhereRaw('(price - (price * (COALESCE(discount,0)) / 100.0)) < ?', [10000]);
                             break;
                         case '10000-25000':
                             $q->orWhereRaw('(price - (price * (COALESCE(discount,0)) / 100.0)) BETWEEN ? AND ?', [10000, 25000]);
                             break;
                         case '25000-50000':
                             $q->orWhereRaw('(price - (price * (COALESCE(discount,0)) / 100.0)) BETWEEN ? AND ?', [25000, 50000]);
                             break;
                         case 'above-50000':
                             $q->orWhereRaw('(price - (price * (COALESCE(discount,0)) / 100.0)) > ?', [50000]);
                             break;
                     }
                 }
             });
         }
 
         // Apply color filter via variants/colors hex_code
         if (!empty($colorFilters)) {
             $query->whereExists(function ($sub) use ($colorFilters) {
                 $sub->from('product_variants')
                     ->join('colors', 'product_variants.color_id', '=', 'colors.id')
                     ->whereColumn('product_variants.product_id', 'products.id')
                     ->whereIn('colors.hex_code', $colorFilters);
             });
         }
 
         // Apply material filter to product.fabric (case-insensitive, supports slug or name)
         if (!empty($materialFilters)) {
             $normalized = array_map(function ($v) {
                 // convert slug to words if needed
                 $v = str_replace('-', ' ', (string) $v);
                 return strtolower($v);
             }, $materialFilters);
             $query->where(function ($q) use ($normalized) {
                 foreach ($normalized as $term) {
                     $q->orWhereRaw('LOWER(COALESCE(fabric, "")) LIKE ?', ['%' . $term . '%']);
                 }
             });
         }
 
         // Apply design filter to product.work_type (case-insensitive)
         if (!empty($designFilters)) {
             $normalized = array_map(function ($v) {
                 $v = str_replace('-', ' ', (string) $v);
                 return strtolower($v);
             }, $designFilters);
             $query->where(function ($q) use ($normalized) {
                 foreach ($normalized as $term) {
                     $q->orWhereRaw('LOWER(COALESCE(work_type, "")) LIKE ?', ['%' . $term . '%']);
                 }
             });
         }
 
         // Sorting
         $sort = (string) $request->query('sort', 'relevance');
         switch ($sort) {
             case 'price-low-to-high':
                 $query->orderByRaw('(price - (price * (COALESCE(discount,0)) / 100.0)) ASC');
                 break;
             case 'price-high-to-low':
                 $query->orderByRaw('(price - (price * (COALESCE(discount,0)) / 100.0)) DESC');
                 break;
             case 'newest':
                 $query->orderByDesc('created_at');
                 break;
             case 'bestselling':
                 // Prioritize products flagged as bestsellers; tie-breaker by recency
                 $query->orderByDesc('is_bestseller')->orderByDesc('created_at');
                 break;
             case 'relevance':
             default:
                 // Leave default order (could be customized later)
                 break;
         }
         $query->limit(5);
         // Fetch products after applying filters and sorting
         $products = $query->get();
 
         if ($products->isEmpty()) {
             return response()->json([]);
         }
 
         $result = $this->productService->productdetails($products);
 
         // Apply collection-level sorting when needed (e.g., rating)
         if ($sort === 'rating') {
             $result = $result->sortByDesc(function ($item) {
                 return (float) ($item['rating'] ?? 0);
             })->values();
         }
 
         return response()->json($result);    
    }

    /**
     * Get bestseller products for API
     */
    public function getBestsellerProducts(Request $request)
    {
        $query = Product::with(['imageproducts', 'category', 'variants.images'])
            ->where('status', 'active')
            ->where('is_bestseller', true)
            ->where('stock_quantity', '>', 0);
         // Parse filters
         $priceFilters = $request->query('price', []);
         $colorFilters = $request->query('colors', []);
         $materialFilters = $request->query('material', []);
         $designFilters = $request->query('design', []);
 
         // Normalize filters to arrays
         $toArray = function ($value) {
             if (is_string($value)) {
                 // support comma-separated
                 return array_values(array_filter(array_map('trim', explode(',', $value))));
             }
             if (is_array($value)) {
                 return array_values(array_filter($value, fn ($v) => $v !== null && $v !== ''));
             }
             return [];
         };
 
         $priceFilters = $toArray($priceFilters);
         $colorFilters = $toArray($colorFilters);
         $materialFilters = $toArray($materialFilters);
         $designFilters = $toArray($designFilters);
 
         // Apply price filters on final price (price - price * discount/100)
         if (!empty($priceFilters)) {
             $query->where(function ($q) use ($priceFilters) {
                 foreach ($priceFilters as $filter) {
                     switch ($filter) {
                         case 'under-10000':
                             $q->orWhereRaw('(price - (price * (COALESCE(discount,0)) / 100.0)) < ?', [10000]);
                             break;
                         case '10000-25000':
                             $q->orWhereRaw('(price - (price * (COALESCE(discount,0)) / 100.0)) BETWEEN ? AND ?', [10000, 25000]);
                             break;
                         case '25000-50000':
                             $q->orWhereRaw('(price - (price * (COALESCE(discount,0)) / 100.0)) BETWEEN ? AND ?', [25000, 50000]);
                             break;
                         case 'above-50000':
                             $q->orWhereRaw('(price - (price * (COALESCE(discount,0)) / 100.0)) > ?', [50000]);
                             break;
                     }
                 }
             });
         }
 
         // Apply color filter via variants/colors hex_code
         if (!empty($colorFilters)) {
             $query->whereExists(function ($sub) use ($colorFilters) {
                 $sub->from('product_variants')
                     ->join('colors', 'product_variants.color_id', '=', 'colors.id')
                     ->whereColumn('product_variants.product_id', 'products.id')
                     ->whereIn('colors.hex_code', $colorFilters);
             });
         }
 
         // Apply material filter to product.fabric (case-insensitive, supports slug or name)
         if (!empty($materialFilters)) {
             $normalized = array_map(function ($v) {
                 // convert slug to words if needed
                 $v = str_replace('-', ' ', (string) $v);
                 return strtolower($v);
             }, $materialFilters);
             $query->where(function ($q) use ($normalized) {
                 foreach ($normalized as $term) {
                     $q->orWhereRaw('LOWER(COALESCE(fabric, "")) LIKE ?', ['%' . $term . '%']);
                 }
             });
         }
 
         // Apply design filter to product.work_type (case-insensitive)
         if (!empty($designFilters)) {
             $normalized = array_map(function ($v) {
                 $v = str_replace('-', ' ', (string) $v);
                 return strtolower($v);
             }, $designFilters);
             $query->where(function ($q) use ($normalized) {
                 foreach ($normalized as $term) {
                     $q->orWhereRaw('LOWER(COALESCE(work_type, "")) LIKE ?', ['%' . $term . '%']);
                 }
             });
         }
 
         // Sorting
         $sort = (string) $request->query('sort', 'relevance');
         switch ($sort) {
             case 'price-low-to-high':
                 $query->orderByRaw('(price - (price * (COALESCE(discount,0)) / 100.0)) ASC');
                 break;
             case 'price-high-to-low':
                 $query->orderByRaw('(price - (price * (COALESCE(discount,0)) / 100.0)) DESC');
                 break;
             case 'newest':
                 $query->orderByDesc('created_at');
                 break;
             case 'bestselling':
                 // Prioritize products flagged as bestsellers; tie-breaker by recency
                 $query->orderByDesc('is_bestseller')->orderByDesc('created_at');
                 break;
             case 'relevance':
             default:
                 // Leave default order (could be customized later)
                 break;
         }
 
         // Fetch products after applying filters and sorting
         // LIMIT to 20 products to prevent JSON response truncation
         $products = $query->take(20)->get();
 
         if ($products->isEmpty()) {
             return response()->json([]);
         }
 
        $result = $this->productService->productdetails($products);
 
         // Apply collection-level sorting when needed (e.g., rating)
         if ($sort === 'rating') {
             $result = $result->sortByDesc(function ($item) {
                 return (float) ($item['rating'] ?? 0);
             })->values();
         }
 
         return response()->json($result);
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
        $products = Product::with(['imageproducts', 'category', 'variants.images'])
            ->where('id', '!=', $currentProduct->id) // Exclude the current product
            ->where('category_id', $currentProduct->category_id)
            ->orWhere('subcategory_id', $currentProduct->subcategory_id)
            ->orWhere('brand_id', $currentProduct->brand_id)
            ->orWhereBetween('price', [
                max(0, $currentProduct->price - 10), // Adjust the range as needed
                $currentProduct->price + 10
            ])
            ->where('status', 'active')
            ->take(10) // Limit the number of related products
            ->orderBy('created_at', 'desc')
            ->get();
            if($products->isEmpty()){
                return response()->json([]);
            }

        $relatedProducts = $this->productService->productdetails($products);

        return response()->json($relatedProducts);
    }

    public function getallproducts(){
        $products = Product::with(['imageproducts', 'variants.images', 'category'])
            ->where('status', 'active')
            ->get();

        if ($products->isEmpty()) {
            return response()->json([]);
        }

        $result = $this->productService->productdetails($products);

        return response()->json($result);
    }

     /**
     * Get recommeded products for API
     */
    public function getRecommededProducts(Request $request)
    {
        $customer = $request->user();
        $cartItems = Cart::where('customer_id', $customer->id)
                ->whereNull('order_id')
                ->with('product')
                ->get();
        $cartproductIds = $cartItems->pluck('product_id')->toArray();
        $recentproducts = RecentView::where('customer_id', $customer->id)
            ->with(['product'])
            ->whereNotIn('product_id', $cartproductIds)
            ->latest()
            ->take(5)
            ->get();
        $whislistproducts = Wishlist::where('customer_id', $customer->id)
            ->with(['product'])
            ->whereNotIn('product_id', $cartproductIds)
            ->latest()
            ->take(5)
            ->get();
        $mergedProducts = $recentproducts->merge($whislistproducts);
        $onlyProducts = $mergedProducts->pluck(['product'])->filter();

		$categoryIds = $cartItems->pluck('product.category_id')->unique()->filter();
		$subcategoryIds = $cartItems->pluck('product.subcategory_id')->unique()->filter();
		$additionalProducts = Product::where(function 
			($query) use ($categoryIds, $subcategoryIds) {
				if ($categoryIds->isNotEmpty()) {
					$query->whereIn('category_id', $categoryIds);
				}
				if ($subcategoryIds->isNotEmpty()) {
					$query->orWhereIn('subcategory_id', $subcategoryIds);
				}
			})
			->where('status', 'active')
			->whereNotIn('id', array_merge($cartproductIds, $onlyProducts->pluck('id')->toArray()))
			->inRandomOrder()
			->take(10 - count($onlyProducts))
			->get();
		
        // Combine product IDs (from wishlist/recent + additional)
        $allProductIds = $onlyProducts->pluck('id')
            ->merge($additionalProducts->pluck('id'))
            ->unique()
            ->values();

        // Start query builder for applying filters
        $query = Product::whereIn('id', $allProductIds);


         // Parse filters
         $priceFilters = $request->query('price', []);
         $colorFilters = $request->query('colors', []);
         $materialFilters = $request->query('material', []);
         $designFilters = $request->query('design', []);
 
         // Normalize filters to arrays
         $toArray = function ($value) {
             if (is_string($value)) {
                 // support comma-separated
                 return array_values(array_filter(array_map('trim', explode(',', $value))));
             }
             if (is_array($value)) {
                 return array_values(array_filter($value, fn ($v) => $v !== null && $v !== ''));
             }
             return [];
         };
 
         $priceFilters = $toArray($priceFilters);
         $colorFilters = $toArray($colorFilters);
         $materialFilters = $toArray($materialFilters);
         $designFilters = $toArray($designFilters);
 
         // Apply price filters on final price (price - price * discount/100)
         if (!empty($priceFilters)) {
             $query->where(function ($q) use ($priceFilters) {
                 foreach ($priceFilters as $filter) {
                     switch ($filter) {
                         case 'under-10000':
                             $q->orWhereRaw('(price - (price * (COALESCE(discount,0)) / 100.0)) < ?', [10000]);
                             break;
                         case '10000-25000':
                             $q->orWhereRaw('(price - (price * (COALESCE(discount,0)) / 100.0)) BETWEEN ? AND ?', [10000, 25000]);
                             break;
                         case '25000-50000':
                             $q->orWhereRaw('(price - (price * (COALESCE(discount,0)) / 100.0)) BETWEEN ? AND ?', [25000, 50000]);
                             break;
                         case 'above-50000':
                             $q->orWhereRaw('(price - (price * (COALESCE(discount,0)) / 100.0)) > ?', [50000]);
                             break;
                     }
                 }
             });
         }
 
         // Apply color filter via variants/colors hex_code
         if (!empty($colorFilters)) {
             $query->whereExists(function ($sub) use ($colorFilters) {
                 $sub->from('product_variants')
                     ->join('colors', 'product_variants.color_id', '=', 'colors.id')
                     ->whereColumn('product_variants.product_id', 'products.id')
                     ->whereIn('colors.hex_code', $colorFilters);
             });
         }
 
         // Apply material filter to product.fabric (case-insensitive, supports slug or name)
         if (!empty($materialFilters)) {
             $normalized = array_map(function ($v) {
                 // convert slug to words if needed
                 $v = str_replace('-', ' ', (string) $v);
                 return strtolower($v);
             }, $materialFilters);
             $query->where(function ($q) use ($normalized) {
                 foreach ($normalized as $term) {
                     $q->orWhereRaw('LOWER(COALESCE(fabric, "")) LIKE ?', ['%' . $term . '%']);
                 }
             });
         }
 
         // Apply design filter to product.work_type (case-insensitive)
         if (!empty($designFilters)) {
             $normalized = array_map(function ($v) {
                 $v = str_replace('-', ' ', (string) $v);
                 return strtolower($v);
             }, $designFilters);
             $query->where(function ($q) use ($normalized) {
                 foreach ($normalized as $term) {
                     $q->orWhereRaw('LOWER(COALESCE(work_type, "")) LIKE ?', ['%' . $term . '%']);
                 }
             });
         }
 
         // Sorting
         $sort = (string) $request->query('sort', 'relevance');
         switch ($sort) {
             case 'price-low-to-high':
                 $query->orderByRaw('(price - (price * (COALESCE(discount,0)) / 100.0)) ASC');
                 break;
             case 'price-high-to-low':
                 $query->orderByRaw('(price - (price * (COALESCE(discount,0)) / 100.0)) DESC');
                 break;
             case 'newest':
                 $query->orderByDesc('created_at');
                 break;
             case 'bestselling':
                 // Prioritize products flagged as bestsellers; tie-breaker by recency
                 $query->orderByDesc('is_bestseller')->orderByDesc('created_at');
                 break;
             case 'relevance':
             default:
                 // Leave default order (could be customized later)
                 break;
         }
 
         // Fetch products after applying filters and sorting
         $products = $query->get();
 
         if ($products->isEmpty()) {
             return response()->json([]);
         }
 
         $result = $this->productService->productdetails($products);
 
         // Apply collection-level sorting when needed (e.g., rating)
         if ($sort === 'rating') {
             $result = $result->sortByDesc(function ($item) {
                 return (float) ($item['rating'] ?? 0);
             })->values();
         }
 
         return response()->json($result);
    }

}
