<?php

namespace App\Http\Controllers;

use App\Models\ProductVariant;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Color;
use App\Models\Size;
use Illuminate\Support\Facades\Storage;

class ProductVariantController extends Controller
{
    public function index(Product $product)
    {
        $variants = ProductVariant::with(['color', 'size'])
            ->where('product_id', $product->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/ProductVariants/Index', [
            'product' => $product,
            'variants' => $variants
        ]);
    }

    public function create(Product $product)
    {
        $colors = Color::where('status', 'active')->get();
        $sizes = Size::where('status', 'active')->get();

        return Inertia::render('Admin/ProductVariants/Create', [
            'product' => $product,
            'colors' => $colors,
            'sizes' => $sizes
        ]);
    }

    public function store(Request $request, Product $product)
    {
        $request->validate([
            'color_id' => 'nullable|exists:colors,id',
            'size_id' => 'nullable|exists:sizes,id',
            'sku' => 'required|string|unique:product_variants,sku',
            'price' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0|max:100',
            'stock_quantity' => 'required|integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'status' => 'required|in:active,inactive',
        ]);

        $data = $request->all();
        $data['product_id'] = $product->id;
        $data['discount'] = $data['discount'] ?? 0;

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('product-variants', 'public');
            $data['image_path'] = $imagePath;
        }

        ProductVariant::create($data);

        return redirect()->route('product-variants.index', $product)->with('success', 'Product variant created successfully.');
    }

    public function edit(Product $product, ProductVariant $variant)
    {
        $colors = Color::where('status', 'active')->get();
        $sizes = Size::where('status', 'active')->get();

        return Inertia::render('Admin/ProductVariants/Edit', [
            'product' => $product,
            'variant' => $variant->load(['color', 'size']),
            'colors' => $colors,
            'sizes' => $sizes
        ]);
    }

    public function update(Request $request, Product $product, ProductVariant $variant)
    {
        $request->validate([
            'color_id' => 'nullable|exists:colors,id',
            'size_id' => 'nullable|exists:sizes,id',
            'sku' => 'required|string|unique:product_variants,sku,' . $variant->id,
            'price' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0|max:100',
            'stock_quantity' => 'required|integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'status' => 'required|in:active,inactive',
        ]);

        $data = $request->all();
        $data['discount'] = $data['discount'] ?? 0;

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($variant->image_path) {
                Storage::disk('public')->delete($variant->image_path);
            }

            $imagePath = $request->file('image')->store('product-variants', 'public');
            $data['image_path'] = $imagePath;
        }

        $variant->update($data);

        return redirect()->route('product-variants.index', $product)->with('success', 'Product variant updated successfully.');
    }

    public function destroy(Product $product, ProductVariant $variant)
    {
        if ($variant->image_path) {
            Storage::disk('public')->delete($variant->image_path);
        }

        $variant->delete();
        return redirect()->route('product-variants.index', $product)->with('success', 'Product variant deleted successfully.');
    }
}
