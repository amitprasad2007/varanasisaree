<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = Category::with('subcategories')->get();
        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories
        ]);
    }

    public function subcatindex()
    {
        $subcategories = Subcategory::with('category')->get();
        
        return Inertia::render('Admin/Subcategories/Index', [
            'subcategories' => $subcategories
        ]);
    }


    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Categories/Create');
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoryRequest $request)
    {
        $validated = $request->validated();

        // Format slug: replace spaces and special characters with hyphens
        $validated['slug'] = str_replace(' ', '-', $validated['slug']);
        $validated['slug'] = preg_replace('/[^A-Za-z0-9\-]/', '-', $validated['slug']);
        $validated['slug'] = strtolower($validated['slug']);

        // Add authenticated user ID
        $validated['added_by'] = auth()->id();

        // Convert boolean status to enum value
        $validated['status'] = $validated['status'] ? 'active' : 'inactive';

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('categories', 'public');
            $validated['photo'] = $path;
        }
        
        Category::create($validated);

        return redirect()->route('categories.index')->with('success', 'Category created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category)
    {
        return Inertia::render('Admin/Categories/Edit', [
            'category' => $category,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoryRequest $request, Category $category)
    {
       // dd($request);
        $validated = $request->validated();

        // Format slug: replace spaces and special characters with hyphens
        $validated['slug'] = str_replace(' ', '-', $validated['slug']);
        $validated['slug'] = preg_replace('/[^A-Za-z0-9\-]/', '-', $validated['slug']);
        $validated['slug'] = strtolower($validated['slug']);

        // Convert boolean status to enum value
        $validated['status'] = $validated['status'] ? 'active' : 'inactive';

        // Handle photo upload
        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($category->photo) {
                Storage::disk('public')->delete($category->photo);
            }
            // Store new photo
            $path = $request->file('photo')->store('categories', 'public');
            $validated['photo'] = $path;
        } else {
            // If no new photo is uploaded, keep the existing photo
            unset($validated['photo']);
        }
        
        $category->update($validated);

        return redirect()->route('categories.index')->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        $category->delete();

        return redirect()->route('categories.index')->with('success', 'Category deleted successfully.');
    }
}
