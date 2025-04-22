<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $products = Product::with(['category', 'subcategory', 'brand'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/Products/Index', [
            'products' => $products
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = Category::where('status', 'active')->whereNull('parent_id' )->get();
        $subcategories = Category::where('status', 'active')->whereNotNull('parent_id' )->get();
        $brands = Brand::where('status', 'active')->get();

        return Inertia::render('Admin/Products/Create', [
            'categories' => $categories,
            'subcategories' => $subcategories,
            'brands' => $brands
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request)
    {
        $validated = $request->validated();

        $validated['slug'] = str_replace(' ', '-', $validated['slug']);
        $validated['slug'] = preg_replace('/[^A-Za-z0-9\-]/', '-', $validated['slug']);
        $validated['slug'] = strtolower($validated['slug']);
        // Convert boolean status to enum value
        $validated['status'] = $validated['status'] ? 'active' : 'inactive';
        // Add authenticated user ID
        $validated['added_by'] = auth()->id();

        Product::create($validated);

        return redirect()->route('products.index')->with('success', 'Product created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        $product->load(['category', 'subcategory', 'brand', 'specifications']);

        return Inertia::render('Admin/Products/Show', [
            'product' => $product
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        $categories = Category::whereNull('parent_id' )->get();
        $subcategories = Category::whereNotNull('parent_id' )->get();
        $brands = Brand::where('status', 'active')->get();

        return Inertia::render('Admin/Products/Edit', [
            'product' => $product,
            'categories' => $categories,
            'subcategories' => $subcategories,
            'brands' => $brands
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductRequest $request, Product $product)
    {
        $validated = $request->validated();

        $validated['slug'] = str_replace(' ', '-', $validated['slug']);
        $validated['slug'] = preg_replace('/[^A-Za-z0-9\-]/', '-', $validated['slug']);
        $validated['slug'] = strtolower($validated['slug']);
        // Convert boolean status to enum value
        $validated['status'] = $validated['status'] ? 'active' : 'inactive';
        // Add authenticated user ID
        $validated['added_by'] = auth()->id();


        $product->update($validated);

        return redirect()->route('products.index')->with('success', 'Product updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $product->delete();

        return redirect()->route('products.index')->with('success', 'Product deleted successfully.');
    }

    // Get subcategories for a specific category (for dynamic dropdown)
    public function getSubcategories($categoryId)
    {
        $subcategories = Category::where('parent_id', $categoryId)
            ->where('status', 'active')
            ->get();

        return response()->json($subcategories);
    }

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
            ->take(2)
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
                    'category' => $product->category->name,
                    'isBestseller' => true
                ];
            });

        return response()->json($products);
    }


}
