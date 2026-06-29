<?php

namespace App\Http\Controllers;

use App\Models\Color;
use App\Models\GiftItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Size;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

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
            'variants' => $variants,
        ]);
    }

    public function create(Product $product)
    {
        $colors = Color::where('status', 'active')->get();
        $sizes = Size::where('status', 'active')->get();

        return Inertia::render('Admin/ProductVariants/Create', [
            'product' => $product,
            'colors' => $colors,
            'sizes' => $sizes,
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

        $variant = ProductVariant::create($data);

        if (empty($variant->barcode)) {
            $variant->barcode = 'VAR-'.strtoupper(\Str::random(6)).'-'.str_pad((string) $product->id, 6, '0', STR_PAD_LEFT).'-'.str_pad((string) $variant->id, 6, '0', STR_PAD_LEFT);
            $variant->save();
        }

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
            'sizes' => $sizes,
        ]);
    }

    public function update(Request $request, Product $product, ProductVariant $variant)
    {
        $request->validate([
            'color_id' => 'nullable|exists:colors,id',
            'size_id' => 'nullable|exists:sizes,id',
            'sku' => 'required|string|unique:product_variants,sku,'.$variant->id,
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
        if (empty($variant->barcode)) {
            $variant->barcode = 'VAR-'.strtoupper(\Str::random(6)).'-'.str_pad((string) $product->id, 6, '0', STR_PAD_LEFT).'-'.str_pad((string) $variant->id, 6, '0', STR_PAD_LEFT);
            $variant->save();
        }

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

    public function allIndex(Request $request)
    {
        $search = $request->input('search');
        $perPage = (int) $request->input('perPage', 10);
        if ($perPage < 1 || $perPage > 100) {
            $perPage = 10;
        }

        $variants = ProductVariant::with(['product', 'color', 'size'])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('sku', 'like', "%{$search}%")
                        ->orWhereHas('product', function ($pq) use ($search) {
                            $pq->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Admin/ProductVariants/AllVariants', [
            'variants' => $variants,
            'filters' => $request->only(['search', 'perPage']),
        ]);
    }

    public function giftItems(Product $product, ProductVariant $variant): Response
    {
        $giftItems = GiftItem::where('product_variant_id', $variant->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($gift) {
                return [
                    'id' => $gift->id,
                    'product_variant_id' => $gift->product_variant_id,
                    'product_id' => $gift->product_id,
                    'product_type' => $gift->product_type,
                    'offer_type' => $gift->offer_type,
                    'offered_price' => (float) $gift->offered_price,
                    'status' => $gift->status,
                    'start_date' => $gift->start_date ? $gift->start_date->format('Y-m-d H:i:s') : null,
                    'end_date' => $gift->end_date ? $gift->end_date->format('Y-m-d H:i:s') : null,
                    'min_spend' => $gift->min_spend ? (float) $gift->min_spend : null,
                    'min_quantity' => $gift->min_quantity ? (int) $gift->min_quantity : null,
                    'eligibility_text' => $gift->eligibility_text,
                    'gift_name' => $gift->gift_name,
                    'gift_image' => $gift->gift_image,
                ];
            });

        return Inertia::render('Admin/ProductVariants/GiftItems', [
            'product' => $product,
            'variant' => $variant->load(['color', 'size']),
            'giftItems' => $giftItems,
        ]);
    }

    public function storeGiftItem(Request $request, Product $product, ProductVariant $variant): RedirectResponse
    {
        $request->validate([
            'product_id' => 'required|integer',
            'product_type' => 'required|string|in:main,variant',
            'offer_type' => 'required|string|in:free,discounted',
            'offered_price' => 'required|numeric|min:0',
            'status' => 'required|string|in:active,inactive',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'min_spend' => 'nullable|numeric|min:0',
            'min_quantity' => 'nullable|integer|min:0',
            'eligibility_text' => 'nullable|string|max:255',
        ]);

        $data = $request->all();
        $data['product_variant_id'] = $variant->id;

        GiftItem::create($data);

        return redirect()->route('product-variants.gift-items', [$product, $variant])
            ->with('success', 'Gift item added successfully.');
    }

    public function updateGiftItem(Request $request, Product $product, ProductVariant $variant, GiftItem $giftItem): RedirectResponse
    {
        $request->validate([
            'product_id' => 'required|integer',
            'product_type' => 'required|string|in:main,variant',
            'offer_type' => 'required|string|in:free,discounted',
            'offered_price' => 'required|numeric|min:0',
            'status' => 'required|string|in:active,inactive',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'min_spend' => 'nullable|numeric|min:0',
            'min_quantity' => 'nullable|integer|min:0',
            'eligibility_text' => 'nullable|string|max:255',
        ]);

        $giftItem->update($request->all());

        return redirect()->route('product-variants.gift-items', [$product, $variant])
            ->with('success', 'Gift item updated successfully.');
    }

    public function destroyGiftItem(Product $product, ProductVariant $variant, GiftItem $giftItem): RedirectResponse
    {
        $giftItem->delete();

        return redirect()->route('product-variants.gift-items', [$product, $variant])
            ->with('success', 'Gift item removed successfully.');
    }

    public function searchProductsAndVariants(Request $request): JsonResponse
    {
        $query = $request->input('query');

        if (empty($query)) {
            return response()->json([]);
        }

        // Search active products (limit 15)
        $products = Product::where('status', 'active')
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('barcode', 'like', "%{$query}%");
            })
            ->limit(15)
            ->get();

        $results = [];

        foreach ($products as $p) {
            $primaryImage = $p->imageproducts()->where('is_primary', true)->first()
                ?? $p->imageproducts()->first();
            $imageUrl = $primaryImage ? asset('storage/'.$primaryImage->image_path) : null;

            $results[] = [
                'id' => $p->id,
                'type' => 'main',
                'name' => $p->name,
                'sku' => $p->barcode ?? 'N/A',
                'price' => (float) $p->price,
                'image' => $imageUrl,
            ];
        }

        // Search active variants
        $variants = ProductVariant::with(['product', 'color', 'size'])
            ->where('status', 'active')
            ->where(function ($q) use ($query) {
                $q->where('sku', 'like', "%{$query}%")
                    ->orWhereHas('product', function ($pq) use ($query) {
                        $pq->where('name', 'like', "%{$query}%");
                    });
            })
            ->limit(15)
            ->get();

        foreach ($variants as $v) {
            $variantName = $v->product?->name;
            $color = $v->color?->name;
            $size = $v->size?->name;
            $parts = array_filter([$color, $size]);
            $nameSuffix = $parts ? ' ('.implode(' / ', $parts).')' : '';
            $fullName = $variantName.$nameSuffix;

            $imageUrl = $v->image_path ? asset('storage/'.$v->image_path) : null;
            if (! $imageUrl && $v->product) {
                $primaryImage = $v->product->imageproducts()->where('is_primary', true)->first()
                    ?? $v->product->imageproducts()->first();
                $imageUrl = $primaryImage ? asset('storage/'.$primaryImage->image_path) : null;
            }

            $results[] = [
                'id' => $v->id,
                'type' => 'variant',
                'name' => $fullName,
                'sku' => $v->sku,
                'price' => (float) $v->price,
                'image' => $imageUrl,
            ];
        }

        return response()->json($results);
    }
}
