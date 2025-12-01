<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ProductService
{
    /**
     * Get paginated products with filtering, searching, and sorting
     *
     * @param Request $request
     * @return LengthAwarePaginator
     */
    public function getProducts(Request $request): LengthAwarePaginator
    {
        $search = $request->input('search');
        $sort = $request->input('sort', 'created_at');
        $direction = $request->input('direction', 'desc');
        $perPage = (int) $request->input('perPage', 10);

        // Sanitize and validate inputs
        $sort = $this->validateSortColumn($sort);
        $direction = $this->validateSortDirection($direction);
        $perPage = $this->validatePerPage($perPage);

        return Product::with(['category', 'subcategory', 'brand'])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('slug', 'like', "%{$search}%");
                });
            })
            ->orderBy($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * Validate sort column against whitelist
     *
     * @param string $sort
     * @return string
     */
    protected function validateSortColumn(string $sort): string
    {
        $allowedSorts = ['name', 'price', 'stock_quantity', 'status', 'created_at'];
        
        return in_array($sort, $allowedSorts, true) ? $sort : 'created_at';
    }

    /**
     * Validate sort direction
     *
     * @param string $direction
     * @return string
     */
    protected function validateSortDirection(string $direction): string
    {
        return strtolower($direction) === 'asc' ? 'asc' : 'desc';
    }

    /**
     * Validate and constrain per-page value
     *
     * @param int $perPage
     * @return int
     */
    protected function validatePerPage(int $perPage): int
    {
        return $perPage > 0 && $perPage <= 100 ? $perPage : 10;
    }
}
