<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $sort = $request->input('sort', 'created_at');
        $direction = $request->input('direction', 'desc');
        $perPage = (int) $request->input('perPage', 10);

        // Whitelist sortable columns to avoid SQL injection
        $allowedSorts = ['name', 'price', 'stock_quantity', 'status', 'created_at'];
        if (!in_array($sort, $allowedSorts, true)) {
            $sort = 'created_at';
        }
        $direction = strtolower($direction) === 'asc' ? 'asc' : 'desc';
        $perPage = $perPage > 0 && $perPage <= 100 ? $perPage : 10;

        $products = Product::with(['category', 'subcategory', 'brand'])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('slug', 'like', "%{$search}%");
                });
            })
            ->orderBy($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'filters' => $request->only(['search', 'sort', 'direction', 'perPage'])
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

        $product = Product::create($validated);

        // Auto-generate barcode if not provided
        if (empty($product->barcode)) {
            $product->barcode = 'PRD-' . strtoupper(Str::random(6)) . '-' . str_pad((string)$product->id, 6, '0', STR_PAD_LEFT);
            $product->save();
        }

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
        if (empty($product->barcode)) {
            $product->barcode = 'PRD-' . strtoupper(Str::random(6)) . '-' . str_pad((string)$product->id, 6, '0', STR_PAD_LEFT);
            $product->save();
        }

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





}
