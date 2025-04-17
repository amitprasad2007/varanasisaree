<?php

namespace App\Http\Controllers;

use App\Models\ProductSpecification;
use App\Models\Product;
use App\Http\Requests\StoreProductSpecificationRequest;
use App\Http\Requests\UpdateProductSpecificationRequest;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

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
            'specifications' => $product->specifications
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Product $product)
    {
        return Inertia::render('Admin/ProductSpecifications/Create', [
            'product' => $product
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductSpecificationRequest $request, Product $product)
    {
        $validated = $request->validated();
        $validated['product_id'] = $product->id;
      //  dd($validated);

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
    public function edit(ProductSpecification $productSpecification,Product $product,)
    {
        return Inertia::render('Admin/ProductSpecifications/Edit', [
            'product' => $product,
            'specification' => $productSpecification
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductSpecificationRequest $request, ProductSpecification $productSpecification, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'value' => 'required|string|max:255',
        ]);

        $productSpecification->update($validated);

        return redirect()->route('product-specifications.index', $product->id)
            ->with('success', 'Specification updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product,ProductSpecification $productSpecification)
    {
        $productSpecification->delete();

        return redirect()->route('product-specifications.index', $product->id)
            ->with('success', 'Specification deleted successfully.');
    }
}
