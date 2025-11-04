<?php

namespace App\Http\Controllers;

use App\Models\PostCategory;
use App\Http\Requests\StorePostCategoryRequest;
use App\Http\Requests\UpdatePostCategoryRequest;
use Inertia\Inertia;
use Illuminate\Support\Str;

class PostCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = PostCategory::withCount('posts')->latest()->get();

        return Inertia::render('Admin/PostCategories/Index', [
            'categories' => $categories
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/PostCategories/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePostCategoryRequest $request)
    {
        $validated = $request->validated();

        // Generate slug from name if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        } else {
            $validated['slug'] = Str::slug($validated['slug']);
        }

        // Make slug unique
        $originalSlug = $validated['slug'];
        $count = 1;
        while (PostCategory::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $originalSlug . '-' . $count;
            $count++;
        }

        $validated['status'] = $validated['status'] ?? 'active';

        PostCategory::create($validated);

        return redirect()->route('post-categories.index')->with('success', 'Blog category created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(PostCategory $postCategory)
    {
        $postCategory->loadCount('posts');

        return Inertia::render('Admin/PostCategories/Show', [
            'category' => $postCategory
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PostCategory $postCategory)
    {
        return Inertia::render('Admin/PostCategories/Edit', [
            'category' => $postCategory
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePostCategoryRequest $request, PostCategory $postCategory)
    {
        $validated = $request->validated();

        // Generate slug if changed
        if (isset($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['slug']);

            // Make slug unique (excluding current category)
            $originalSlug = $validated['slug'];
            $count = 1;
            while (PostCategory::where('slug', $validated['slug'])->where('id', '!=', $postCategory->id)->exists()) {
                $validated['slug'] = $originalSlug . '-' . $count;
                $count++;
            }
        }

        $postCategory->update($validated);

        return redirect()->route('post-categories.index')->with('success', 'Blog category updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PostCategory $postCategory)
    {
        // Check if category has posts
        if ($postCategory->posts()->count() > 0) {
            return redirect()->route('post-categories.index')->with('error', 'Cannot delete category with existing posts.');
        }

        $postCategory->delete();

        return redirect()->route('post-categories.index')->with('success', 'Blog category deleted successfully.');
    }
}
