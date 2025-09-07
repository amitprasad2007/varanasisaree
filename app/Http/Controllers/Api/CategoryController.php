<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CategoryController extends Controller
{


    public function apiIndex()
    {
        $categories = Category::where('status', 'active')
            ->withCount('subcategories as subcount')
            ->whereNull('parent_id')
            ->get()
            ->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->title,
                    'description' => $category->summary,
                    'image' => asset('storage/' . $category->photo), // You'll need to handle image storage
                    'count' => $category->subcount,
                    'slug' => $category->slug,
                ];
            });

        return response()->json($categories);
    }

    public function catproducts(Category $categories, Request $request)
    {
        // Build base query
        $query = Product::query()
            ->where('status', 'active')
            ->where('category_id', $categories->id)
            ->with(['imageproducts', 'variants.images', 'category']);

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

        // Aggregate review counts and average ratings (approved only)
        $reviewStats = DB::table('product_reviews')
            ->select('product_id', DB::raw('COUNT(*) as review_count'), DB::raw('AVG(rating) as avg_rating'))
            ->whereIn('product_id', $products->pluck('id'))
            ->where('status', 'approved')
            ->groupBy('product_id')
            ->get()
            ->keyBy('product_id');

        $result = $products->map(function (Product $product) use ($reviewStats) {
            // Prices
            $basePrice = (float) $product->price;
            $discountPercent = (float) ($product->discount ?? 0);
            $finalPrice = $basePrice - ($basePrice * $discountPercent / 100);

            // Images (resolve and convert to absolute URLs)
            $images = $product->resolveImagePaths()->map(function ($path) {
                $path = (string) $path;
                if (Str::startsWith($path, ['http://', 'https://', '//'])) {
                    return $path;
                }
                return asset('storage/' . ltrim($path, '/'));
            })->values();

            // Skip products with no images
            if ($images->isEmpty()) {
                return null;
            }

            // Reviews
            $stats = $reviewStats->get($product->id);
            $avgRating = $stats ? (float) $stats->avg_rating : 0.0;
            $reviewCount = $stats ? (int) $stats->review_count : 0;

            return [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'images' => $images,
                'price' => (int) round($finalPrice),
                'originalPrice' => $discountPercent > 0 ? (int) round($basePrice) : null,
                'rating' => round($avgRating, 1),
                'reviewCount' => $reviewCount,
                'category' => optional($product->category)->title,
                'isNew' => $product->created_at ? $product->created_at->gt(now()->subDays(30)) : false,
                'isBestseller' => (bool) ($product->is_bestseller ?? false),
            ];
        })->filter()->map(function ($item) {
            // Remove null originalPrice to match samples where it's omitted when no discount
            if ($item['originalPrice'] === null) {
                unset($item['originalPrice']);
            }
            return $item;
        })->values();

        // Apply collection-level sorting when needed (e.g., rating)
        if ($sort === 'rating') {
            $result = $result->sortByDesc(function ($item) {
                return (float) ($item['rating'] ?? 0);
            })->values();
        }

        return response()->json($result);
    }

    public function catdetails(Category $categories){
        $imageUrl = $categories->photo
            ? asset('storage/' . ltrim($categories->photo, '/'))
            : null;

        // Count active products that belong directly or via subcategory
        $productsCount = Product::query()
            ->where('status', 'active')
            ->where(function ($q) use ($categories) {
                $q->where('category_id', $categories->id)
                  ->orWhere('subcategory_id', $categories->id);
            })
            ->count();

        return response()->json([
            'name' => $categories->title,
            'description' => (string) ($categories->summary ?? ''),
            'image' => $imageUrl,
            'productsCount' => $productsCount,
        ]);
    }
    public function getcategorybyname($slug){
        $category = Category::where('slug', $slug)->where('status', 'active')->first();
        return response()->json($category);
    }

}
