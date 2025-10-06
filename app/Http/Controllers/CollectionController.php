<?php

namespace App\Http\Controllers;

use App\Models\Collection;
use App\Models\CollectionType;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class CollectionController extends Controller
{
    public function index()
    {
        $collections = Collection::query()
            ->with('type:id,name')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(20);

        return Inertia::render('Admin/Collections/Index', [
            'collections' => $collections,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Collections/Create', [
            'types' => CollectionType::orderBy('name')->get(['id','name']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'collection_type_id' => ['required', 'exists:collection_types,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:collections,slug'],
            'description' => ['nullable', 'string'],
            'banner_image' => ['nullable', 'string', 'max:2048'],
            'thumbnail_image' => ['nullable', 'string', 'max:2048'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
            'product_ids' => ['array'],
            'product_ids.*' => ['integer', 'exists:products,id'],
        ]);

        $productIds = $validated['product_ids'] ?? [];
        unset($validated['product_ids']);

        $collection = Collection::create($validated);
        if (!empty($productIds)) {
            $collection->products()->sync($productIds);
        }

        return redirect()->route('collections.index')->with('success', 'Collection created');
    }

    public function edit(Collection $collection)
    {
        return Inertia::render('Admin/Collections/Edit', [
            'collection' => $collection->load('type:id,name'),
            'types' => CollectionType::orderBy('name')->get(['id','name']),
            'selectedProductIds' => $collection->products()->pluck('products.id'),
            'products' => Product::orderBy('name')->limit(1000)->get(['id','name','slug']),
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
            'product_ids' => ['array'],
            'product_ids.*' => ['integer', 'exists:products,id'],
        ]);

        $productIds = $validated['product_ids'] ?? [];
        unset($validated['product_ids']);

        $collection->update($validated);
        $collection->products()->sync($productIds);

        return redirect()->route('collections.index')->with('success', 'Collection updated');
    }

    public function destroy(Collection $collection)
    {
        $collection->delete();
        return redirect()->route('collections.index')->with('success', 'Collection deleted');
    }
}


