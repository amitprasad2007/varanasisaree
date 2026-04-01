<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductSpecificationRequest;
use App\Http\Requests\UpdateProductSpecificationRequest;
use App\Models\Product;
use App\Models\ProductSpecification;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductSpecificationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Product $product)
    {
        $product->load('specifications');

        return Inertia::render('Admin/ProductSpecifications/Index', [
            'product' => $product,
            'specifications' => $product->specifications,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Product $product)
    {
        return Inertia::render('Admin/ProductSpecifications/Create', [
            'product' => $product,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductSpecificationRequest $request, Product $product)
    {
        $validated = $request->validated();
        $validated['product_id'] = $product->id;

        ProductSpecification::create($validated);

        return redirect()->route('product-specifications.index', $product->id)
            ->with('success', 'Specification added successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(ProductSpecification $productSpecification)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product, ProductSpecification $productSpecification)
    {
        return Inertia::render('Admin/ProductSpecifications/Edit', [
            'product' => $product,
            'specification' => $productSpecification,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductSpecificationRequest $request, Product $product, ProductSpecification $productSpecification)
    {
        $validated = $request->validated();
        $productSpecification->update($validated);

        return redirect()->route('product-specifications.index', $product->id)
            ->with('success', 'Specification updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product, ProductSpecification $productSpecification)
    {
        $productSpecification->delete();

        return redirect()->route('product-specifications.index', $product->id)
            ->with('success', 'Specification deleted successfully.');
    }
}
