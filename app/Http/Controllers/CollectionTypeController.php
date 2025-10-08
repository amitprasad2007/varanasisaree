<?php

namespace App\Http\Controllers;

use App\Models\CollectionType;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

class CollectionTypeController extends Controller
{
    public function index()
    {
        $collectionTypes = CollectionType::query()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(20);
       // dd($collectionTypes);
        return Inertia::render('Admin/CollectionTypes/Index', [
            'collectionTypes' => $collectionTypes,
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
            'description' => ['nullable', 'string'],
            'banner_image' => ['nullable', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
            'thumbnail_image' => ['nullable', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string'],
            'meta' => ['nullable'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);
        $data = $validated;
        $data['slug'] = Str::slug($validated['name']);
        // Allow sending meta as JSON string from the frontend
        $metaInput = $request->input('meta');
        if (is_string($metaInput)) {
            $decoded = json_decode($metaInput, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $data['meta'] = $decoded;
            }
        }

        if ($request->hasFile('banner_image')) {
            $path = $request->file('banner_image')->store('collection_types', 'public');
            $data['banner_image'] = $path;
        }

        if ($request->hasFile('thumbnail_image')) {
            $path = $request->file('thumbnail_image')->store('collection_types', 'public');
            $data['thumbnail_image'] = $path;
        }

        CollectionType::create($data);

        return redirect()->route('collection-types.index')->with('success', 'Collection type created');
    }

    public function edit(CollectionType $collection_type)
    {
        return Inertia::render('Admin/CollectionTypes/Edit', [
            'collectionType' => $collection_type,
        ]);
    }

    public function update(Request $request, CollectionType $collection_type)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('collection_types', 'slug')->ignore($collection_type->id)],
            'description' => ['nullable', 'string'],
            'banner_image' => ['nullable', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
            'thumbnail_image' => ['nullable', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string'],
            'meta' => ['nullable'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);
        $data = $validated;
        $data['slug'] = Str::slug($validated['name']);
        // Allow sending meta as JSON string from the frontend
        $metaInput = $request->input('meta');
        if (is_string($metaInput)) {
            $decoded = json_decode($metaInput, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $data['meta'] = $decoded;
            }
        }

        if ($request->hasFile('banner_image')) {
            // delete old if present
            if ($collection_type->banner_image) {
                Storage::disk('public')->delete($collection_type->banner_image);
            }
            $path = $request->file('banner_image')->store('collection_types', 'public');
            $data['banner_image'] = $path;
        }

        if ($request->hasFile('thumbnail_image')) {
            if ($collection_type->thumbnail_image) {
                Storage::disk('public')->delete($collection_type->thumbnail_image);
            }
            $path = $request->file('thumbnail_image')->store('collection_types', 'public');
            $data['thumbnail_image'] = $path;
        }
       // dd($data);
        $collection_type->update($data);

        return redirect()->route('collection-types.index')->with('success', 'Collection type updated');
    }

    public function destroy(CollectionType $collection_type)
    {
        $collection_type->delete();
        return redirect()->route('collection-types.index')->with('success', 'Collection type deleted');
    }
}


