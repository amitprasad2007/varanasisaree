<?php

namespace App\Http\Controllers;

use App\Models\CollectionType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class CollectionTypeController extends Controller
{
    public function index()
    {
        $types = CollectionType::query()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(20);

        return Inertia::render('Admin/CollectionTypes/Index', [
            'types' => $types,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/CollectionTypes/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:collection_types,slug'],
            'description' => ['nullable', 'string'],
            'banner_image' => ['nullable', 'string', 'max:2048'],
            'thumbnail_image' => ['nullable', 'string', 'max:2048'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        CollectionType::create($validated);

        return redirect()->route('collection-types.index')->with('success', 'Collection type created');
    }

    public function edit(CollectionType $collection_type)
    {
        return Inertia::render('Admin/CollectionTypes/Edit', [
            'type' => $collection_type,
        ]);
    }

    public function update(Request $request, CollectionType $collection_type)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('collection_types', 'slug')->ignore($collection_type->id)],
            'description' => ['nullable', 'string'],
            'banner_image' => ['nullable', 'string', 'max:2048'],
            'thumbnail_image' => ['nullable', 'string', 'max:2048'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $collection_type->update($validated);

        return redirect()->route('collection-types.index')->with('success', 'Collection type updated');
    }

    public function destroy(CollectionType $collection_type)
    {
        $collection_type->delete();
        return redirect()->route('collection-types.index')->with('success', 'Collection type deleted');
    }
}


