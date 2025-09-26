<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Category;
use App\Models\Post;
use App\Models\Aboutus;
use App\Models\ProductVariant;

class SearchController extends Controller
{
	public function suggestions(Request $request ){
		$query = trim((string) $request->get('q'));
		$limitPerType = (int) ($request->get('limit') ?? 5);
		$limitPerType = max(1, min($limitPerType, 10));

		if ($query === '') {
			return response()->json([]);
		}

		// Products
		$products = Product::query()
			->where('status', 'active')
			->where('name', 'like', "%{$query}%")
			->select(['id', 'name as label', 'slug'])
			->limit($limitPerType)
			->get()
			->map(function ($row) {
				return [
					'id' => $row->id,
					'type' => 'product',
					'label' => (string) $row->label,
					'slug' => (string) $row->slug,
				];
			});

		// Product Variants (search by SKU or barcode; navigate to parent product)
		$variants = ProductVariant::query()
			->where('status', 'active')
			->where(function ($q) use ($query) {
				$q->where('sku', 'like', "%{$query}%")
					->orWhere('barcode', 'like', "%{$query}%");
			})
			->with(['product:id,name,slug,status'])
			->limit($limitPerType)
			->get()
			->filter(function ($variant) {
				return $variant->product && $variant->product->status === 'active';
			})
			->map(function ($variant) {
				$labelParts = [
					(string) $variant->product->name,
				];
				if (!empty($variant->sku)) {
					$labelParts[] = "SKU: " . (string) $variant->sku;
				}
				return [
					'id' => $variant->id,
					'type' => 'product',
					'label' => implode(' - ', $labelParts),
					'slug' => (string) $variant->product->slug,
				];
			});

		// Top-level categories
		$categories = Category::query()
			->where('status', 'active')
			->whereNull('parent_id')
			->where('title', 'like', "%{$query}%")
			->select(['id', 'title as label', 'slug'])
			->limit($limitPerType)
			->get()
			->map(function ($row) {
				return [
					'id' => $row->id,
					'type' => 'category',
					'label' => (string) $row->label,
					'slug' => (string) $row->slug,
				];
			});

		// Collections (treat subcategories as collections)
		$collections = Category::query()
			->where('status', 'active')
			->whereNotNull('parent_id')
			->where('title', 'like', "%{$query}%")
			->select(['id', 'title as label', 'slug'])
			->limit($limitPerType)
			->get()
			->map(function ($row) {
				return [
					'id' => $row->id,
					'type' => 'collection',
					'label' => (string) $row->label,
					'slug' => (string) $row->slug,
				];
			});

		// Pages (About us + Blog posts titles)
		$pages = collect();
		$aboutPages = Aboutus::query()
			->where('status', 'active')
			->where('page_title', 'like', "%{$query}%")
			->select(['id', 'page_title'])
			->limit($limitPerType)
			->get()
			->map(function ($row) {
				return [
					'id' => $row->id,
					'type' => 'page',
					'label' => (string) $row->page_title,
					'slug' => 'about-us',
				];
			});
		$pages = $pages->concat($aboutPages);

		$postPages = Post::query()
			->where('status', 'published')
			->where('title', 'like', "%{$query}%")
			->select(['id', 'title as label', 'slug'])
			->limit($limitPerType)
			->get()
			->map(function ($row) {
				return [
					'id' => $row->id,
					'type' => 'page',
					'label' => (string) $row->label,
					'slug' => (string) $row->slug,
				];
			});
		$pages = $pages->concat($postPages)->take($limitPerType);

		$suggestions = $variants
			->concat($products)
			->concat($categories)
			->concat($collections)
			->concat($pages)
			->values();

		return response()->json($suggestions);
	}

    public function getcategoryfillters($slug){
        $categories = Category::where('slug', $slug)->where('status', 'active')->first();
        // Get all products in this category and its subcategories
        $categoryIds = [$categories->id];

        // Get subcategories if any
        $subcategories = Category::where('parent_id', $categories->id)->pluck('id');
        $categoryIds = array_merge($categoryIds, $subcategories->toArray());

        // Get all products in this category and subcategories
        $products = Product::whereIn('category_id', $categoryIds)
            ->orWhereIn('subcategory_id', $categoryIds)
            ->where('status', 'active')
            ->get();

        // Get all product variants for these products
        $productIds = $products->pluck('id');
        $variants = ProductVariant::whereIn('product_id', $productIds)
            ->where('status', 'active')
            ->with('color')
            ->get();

        // Price filter options (constant)
        $priceOptions = [
            ['id' => 'price-1', 'name' => 'Under ₹10,000', 'value' => 'under-10000'],
            ['id' => 'price-2', 'name' => '₹10,000 - ₹25,000', 'value' => '10000-25000'],
            ['id' => 'price-3', 'name' => '₹25,000 - ₹50,000', 'value' => '25000-50000'],
            ['id' => 'price-4', 'name' => 'Above ₹50,000', 'value' => 'above-50000'],
        ];

        // Colors from products and variants
        $colors = collect();

        // Get colors from product variants
        $variantColors = $variants->whereNotNull('color')->pluck('color')->unique('id');
        foreach ($variantColors as $color) {
            $colors->push([
                'id' => 'color-' . $color->id,
                'name' => $color->name,
                'value' => $color->hex_code
            ]);
        }

        // Get colors from products (if they have color field)
        $productColors = $products->whereNotNull('color')->pluck('color')->unique();
        foreach ($productColors as $colorName) {
            if (!$colors->contains('name', $colorName)) {
                $colors->push([
                    'id' => 'color-product-' . md5($colorName),
                    'name' => $colorName,
                    'value' => '#000000' // Default color if no hex code
                ]);
            }
        }

        // Material (fabric) options from products
        $materials = $products->whereNotNull('fabric')
            ->pluck('fabric')
            ->unique()
            ->values()
            ->map(function ($fabric, $index) {
                return [
                    'id' => 'material-' . ($index + 1),
                    'name' => $fabric,
                    'value' => strtolower(str_replace(' ', '-', $fabric))
                ];
            });

        // Design (work_type) options from products
        $designs = $products->whereNotNull('work_type')
            ->pluck('work_type')
            ->unique()
            ->values()
            ->map(function ($workType, $index) {
                return [
                    'id' => 'design-' . ($index + 1),
                    'name' => $workType,
                    'value' => strtolower(str_replace(' ', '-', $workType))
                ];
            });

        $filterOptions = [
            'price' => $priceOptions,
            'colors' => $colors->values()->toArray(),
            'material' => $materials->toArray(),
            'design' => $designs->toArray(),
        ];

        return response()->json($filterOptions);
    }

	public function getbestsellerfillters(){
		$products = Product::with(['imageproducts', 'category', 'variants.images'])
			->where('status', 'active')
			->where('is_bestseller', true)
			->where('stock_quantity', '>', 0)
			->orderBy('created_at', 'desc')
			->get();

		// Collect product ids for variant lookup
		$productIds = $products->pluck('id');
		$variants = ProductVariant::whereIn('product_id', $productIds)
			->where('status', 'active')
			->with('color')
			->get();

		// Price filter options (constant)
		$priceOptions = [
			['id' => 'price-1', 'name' => 'Under ₹10,000', 'value' => 'under-10000'],
			['id' => 'price-2', 'name' => '₹10,000 - ₹25,000', 'value' => '10000-25000'],
			['id' => 'price-3', 'name' => '₹25,000 - ₹50,000', 'value' => '25000-50000'],
			['id' => 'price-4', 'name' => 'Above ₹50,000', 'value' => 'above-50000'],
		];

		// Colors from variants (preferred) and products (fallback)
		$colors = collect();
		$variantColors = $variants->whereNotNull('color')->pluck('color')->unique('id');
		foreach ($variantColors as $color) {
			$colors->push([
				'id' => 'color-' . $color->id,
				'name' => $color->name,
				'value' => $color->hex_code
			]);
		}
		$productColors = $products->whereNotNull('color')->pluck('color')->unique();
		foreach ($productColors as $colorName) {
			if (!$colors->contains('name', $colorName)) {
				$colors->push([
					'id' => 'color-product-' . md5($colorName),
					'name' => $colorName,
					'value' => '#000000'
				]);
			}
		}

		// Materials from products' fabric
		$materials = $products->whereNotNull('fabric')
			->pluck('fabric')
			->unique()
			->values()
			->map(function ($fabric, $index) {
				return [
					'id' => 'material-' . ($index + 1),
					'name' => $fabric,
					'value' => strtolower(str_replace(' ', '-', $fabric))
				];
			});

		// Designs from products' work_type
		$designs = $products->whereNotNull('work_type')
			->pluck('work_type')
			->unique()
			->values()
			->map(function ($workType, $index) {
				return [
					'id' => 'design-' . ($index + 1),
					'name' => $workType,
					'value' => strtolower(str_replace(' ', '-', $workType))
				];
			});

		$filterOptions = [
			'price' => $priceOptions,
			'colors' => $colors->values()->toArray(),
			'material' => $materials->toArray(),
			'design' => $designs->toArray(),
		];

		return response()->json($filterOptions);
	}
}
