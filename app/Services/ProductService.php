<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductReview;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductService
{
    /**
     * Get paginated products with filtering, searching, and sorting
     */
    public function getProducts(Request $request): LengthAwarePaginator
    {
        $perPage = (int) $request->input('perPage', 10);
        $perPage = $this->validatePerPage($perPage);

        return $this->getProductsQuery($request)
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * Get products query with filtering, searching, and sorting
     *
     * @return Builder
     */
    public function getProductsQuery(Request $request)
    {
        $search = $request->input('search');
        $sort = $request->input('sort', 'created_at');
        $direction = $request->input('direction', 'desc');

        // Sanitize and validate inputs
        $sort = $this->validateSortColumn($sort);
        $direction = $this->validateSortDirection($direction);

        return Product::with(['category', 'subcategory', 'brand', 'variants'])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%");
                });
            })
            ->orderBy($sort, $direction);
    }

    /**
     * Validate sort column against whitelist
     */
    protected function validateSortColumn(string $sort): string
    {
        $allowedSorts = ['name', 'price', 'stock_quantity', 'status', 'created_at'];

        return in_array($sort, $allowedSorts, true) ? $sort : 'created_at';
    }

    /**
     * Validate sort direction
     */
    protected function validateSortDirection(string $direction): string
    {
        return strtolower($direction) === 'asc' ? 'asc' : 'desc';
    }

    /**
     * Validate and constrain per-page value
     */
    protected function validatePerPage(int $perPage): int
    {
        return $perPage > 0 && $perPage <= 100 ? $perPage : 10;
    }

    public function productdetails($products)
    {
        // Aggregate review counts and average ratings (approved only)
        $reviewStats = ProductReview::select('product_id', DB::raw('COUNT(*) as review_count'), DB::raw('AVG(rating) as avg_rating'))
            ->whereIn('product_id', $products->pluck('id'))
            ->where('status', 'approved')
            ->groupBy('product_id')
            ->get()
            ->keyBy('product_id');

        $result = $products->map(function (Product $product) use ($reviewStats) {
            // Derive pricing from default variant if available
            $variantCollection = collect($product->variants ?? []);
            $defaultVariant = $variantCollection->first(function ($variant) {
                $status = $variant->status;
                $isActive = ($status === 'active' || $status === 1 || $status === true || $status === '1' || $status === null);

                return $isActive && (int) $variant->stock_quantity > 0;
            }) ?? $variantCollection->first();

            $basePrice = $defaultVariant ? (float) ($defaultVariant->price ?? $product->price) : (float) $product->price;
            $discountPercent = $defaultVariant && $defaultVariant->discount !== null
                ? (float) $defaultVariant->discount
                : (float) ($product->discount ?? 0);

            $finalPrice = $basePrice - ($basePrice * $discountPercent / 100);

            // Images (resolve and convert to absolute URLs)
            $images = $product->resolveImagePaths()->map(function ($path) {
                $path = (string) $path;
                if (Str::startsWith($path, ['http://', 'https://', '//'])) {
                    return $path;
                }

                return asset('storage/'.ltrim($path, '/'));
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

        return $result;
    }
}
