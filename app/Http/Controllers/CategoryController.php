<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\StoreSubCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Requests\UpdateSubCategoryRequest;
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
        $categories = Category::with('subcategories')->whereNull('parent_id' )->get();
        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories
        ]);
    }

    public function subcatindex()
    {
        $subcategories = Category::with('parent')->whereNotNull('parent_id' )->get();

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

    public function createsubcate()
    {
        $categories = Category::where('status', 'active')->get();

        return Inertia::render('Admin/Subcategories/Create', [
            'categories' => $categories
        ]);
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

        return redirect()->route('categories.index');
    }


    public function substore(StoreSubCategoryRequest $request)
    {
        $validated = $request->validated();

        // Format slug: replace spaces and special characters with hyphens
        $validated['slug'] = str_replace(' ', '-', $validated['slug']);
        $validated['slug'] = preg_replace('/[^A-Za-z0-9\-]/', '-', $validated['slug']);
        $validated['slug'] = strtolower($validated['slug']);

        $validated['is_parent'] = 0 ;
        // Add authenticated user ID
        $validated['added_by'] = auth()->id();

        // Convert boolean status to enum value
        $validated['status'] = $validated['status'] ? 'active' : 'inactive';

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('categories', 'public');
            $validated['photo'] = $path;
        }

        Category::create($validated);

        return redirect()->route('subcatindex');
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

    public function subedit($id)
    {
        $subcategory = Category::with('parent')->find($id);
        $categories = Category::whereNull('parent_id' )->get();
        return Inertia::render('Admin/Subcategories/Edit', [
            'subcategory' => $subcategory,
            'categories' => $categories,
        ]);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $validated = $request->validated();

        // Format slug: replace spaces and special characters with hyphens
        $validated['slug'] = str_replace(' ', '-', $validated['slug']);
        $validated['slug'] = preg_replace('/[^A-Za-z0-9\-]/', '-', $validated['slug']);
        $validated['slug'] = strtolower($validated['slug']);

        // Convert boolean status to enum value
        $validated['status'] = $validated['status'] ? 'active' : 'inactive';

        $validated['added_by'] = auth()->id();

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

        return redirect()->route('categories.index');
    }

    /**
     * Update the specified subcategory in storage.
     */
    public function subupdate(UpdateSubCategoryRequest $request, Category $subcategory)
    {
        $validated = $request->validated();

        // Format slug: replace spaces and special characters with hyphens
        $validated['slug'] = str_replace(' ', '-', $validated['slug']);
        $validated['slug'] = preg_replace('/[^A-Za-z0-9\-]/', '-', $validated['slug']);
        $validated['slug'] = strtolower($validated['slug']);

        // Convert boolean status to enum value
        $validated['status'] = $validated['status'] ? 'active' : 'inactive';

        $validated['added_by'] = auth()->id();

        // Handle photo upload
        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($subcategory->photo) {
                Storage::disk('public')->delete($subcategory->photo);
            }
            // Store new photo
            $path = $request->file('photo')->store('categories', 'public');
            $validated['photo'] = $path;
        } else {
            // If no new photo is uploaded, keep the existing photo
            unset($validated['photo']);
        }

        $subcategory->update($validated);

        return redirect()->route('subcatindex');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        $category->delete();

        return redirect()->route('categories.index');
    }
    public function subdestroy(Category $subcategory)
    {
        $subcategory->delete();

        return redirect()->route('subcatindex');
    }

    public function apiIndex()
    {
        $categories = Category::where('status', 'active')
            ->withCount('subcategories as subcount')
            ->get()
            ->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->title,
                    'description' => $category->summary,
                    'image' => asset('storage/' . $category->photo), // You'll need to handle image storage
                    'count' => $category->subcount,
                    'slug' => $category->slug,
                ];
            });

        return response()->json($categories);
    }
}
