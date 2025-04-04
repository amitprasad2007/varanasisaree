<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Http\Requests\StoreBrandRequest;
use App\Http\Requests\UpdateBrandRequest;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class BrandController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $brands = Brand::all();

        return Inertia::render('Admin/Brands/Index', [
            'brands' => $brands
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Brands/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBrandRequest $request)
    {

        $validated = $request->validated();

        // Format slug: replace spaces and special characters with hyphens
        $validated['slug'] = str_replace(' ', '-', $validated['slug']);
        $validated['slug'] = preg_replace('/[^A-Za-z0-9\-]/', '-', $validated['slug']);
        $validated['slug'] = strtolower($validated['slug']);

        $validated['status'] = $validated['status'] ? 'active' : 'inactive';

        if ($request->hasFile('images')) {
            $path = $request->file('images')->store('brands', 'public');
            $validated['images'] = $path;
        }
        if ($request->hasFile('logo')) {
            $pathlogo = $request->file('logo')->store('brands', 'public');
            $validated['logo'] = $pathlogo;
        }

        Brand::create($validated);

        return redirect()->route('brands.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Brand $brand)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Brand $brand)
    {
        return Inertia::render('Admin/Brands/Edit', [
            'brand' => $brand,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBrandRequest $request, Brand $brand)
    {
        $validated = $request->validated();
       // Format slug: replace spaces and special characters with hyphens
       $validated['slug'] = str_replace(' ', '-', $validated['slug']);
       $validated['slug'] = preg_replace('/[^A-Za-z0-9\-]/', '-', $validated['slug']);
       $validated['slug'] = strtolower($validated['slug']);

       $validated['status'] = $validated['status'] ? 'active' : 'inactive';

       // Handle photo upload
       if ($request->hasFile('images')) {
            // Delete old photo if exists
            if ($brand->images) {
                Storage::disk('public')->delete($brand->images);
            }
            // Store new photo
            $path = $request->file('images')->store('brands', 'public');
            $validated['images'] = $path;
        } else {
            // If no new photo is uploaded, keep the existing photo
            unset($validated['images']);
        }
        // Handle photo upload
       if ($request->hasFile('logo')) {
        // Delete old photo if exists
            if ($brand->logo) {
                Storage::disk('public')->delete($brand->logo);
            }
            // Store new photo
            $path = $request->file('logo')->store('brands', 'public');
            $validated['logo'] = $path;
        } else {
            // If no new photo is uploaded, keep the existing photo
            unset($validated['logo']);
        }

        $brand->update($validated);

        return redirect()->route('brands.index')->with('success', 'Brand updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Brand $brand)
    {
        $brand->delete();

        return redirect()->route('brands.index')->with('success', 'Brand deleted successfully.');
    }
}
