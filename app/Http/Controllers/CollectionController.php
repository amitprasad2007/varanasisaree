<?php

namespace App\Http\Controllers;

use App\Models\Collection;
use App\Models\CollectionType;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class CollectionController extends Controller
{
    public function index()
    {
        $collections = Collection::query()
            ->with('collectionType')
            ->withCount('products')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(20);

        return Inertia::render('Admin/Collections/Index', [
            'collections' => $collections,
        ]);
    }

    public function create()
    {
        $collectionTypes = CollectionType::where('is_active', true)->get();
        //dd($collectionTypes);
        return Inertia::render('Admin/Collections/Create', [
            'collectionTypes' => $collectionTypes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'collection_type_id' => ['required', 'exists:collection_types,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'banner_image' => ['nullable', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
            'thumbnail_image' => ['nullable', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string'],
            'meta' => ['nullable'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        Collection::create($validated);

        return redirect()->route('collections.index')->with('success', 'Collection created');
    }

    public function edit(Collection $collection)
    {
        $collectionTypes = CollectionType::where('status', 'active')
            ->get();

        return Inertia::render('Admin/Collections/Edit', [
            'collection' => $collection,
            'collectionTypes' => $collectionTypes,
        ]);
    }

    public function update(Request $request, Collection $collection)
    {
        $validated = $request->validate([
            'collection_type_id' => ['required', 'exists:collection_types,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('collections', 'slug')->ignore($collection->id)],
            'description' => ['nullable', 'string'],
            'banner_image' => ['nullable', 'string', 'max:2048'],
            'thumbnail_image' => ['nullable', 'string', 'max:2048'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
            'product_ids.*' => ['integer', 'exists:products,id'],
        ]);
        $validated['slug'] = Str::slug($validated['name']);
        $collection->update($validated);


        return redirect()->route('collections.index')->with('success', 'Collection updated');
    }

    public function destroy(Collection $collection)
    {
        $collection->delete();
        return redirect()->route('collections.index')->with('success', 'Collection deleted');
    }

    public function products(Collection $collection)
    {
        $collectionProducts = $collection->products()
            ->with(['category', 'brand'])
            ->get();

        $availableProducts = Product::whereNotIn('id', $collectionProducts->pluck('id'))
            ->with(['category', 'brand'])
            ->where('status', 'active')
            ->get();

        return Inertia::render('Admin/Collections/Products', [
            'collection' => $collection,
            'collectionProducts' => $collectionProducts,
            'availableProducts' => $availableProducts,
        ]);
    }

    public function addProduct(Request $request, Collection $collection)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'display_order' => 'nullable|integer',
        ]);

        $collection->products()->attach($validated['product_id'], [
            'sort_order' => $validated['display_order'] ?? 0,
        ]);

        return back()->with('success', 'Product added to collection successfully.');
    }

    public function removeProduct(Collection $collection, Product $product)
    {
        $collection->products()->detach($product->id);

        return back()->with('success', 'Product removed from collection successfully.');
    }

    public function updateProductOrder(Request $request, Collection $collection)
    {
        $validated = $request->validate([
            'products' => 'required|array',
            'products.*.id' => 'required|exists:products,id',
            'products.*.display_order' => 'required|integer',
        ]);

        foreach ($validated['products'] as $product) {
            $collection->products()->updateExistingPivot($product['id'], [
                'display_order' => $product['display_order'],
            ]);
        }

        return back()->with('success', 'Product order updated successfully.');
    }


}


