<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use App\Http\Requests\StoreBannerRequest;
use App\Http\Requests\UpdateBannerRequest;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;

class BannerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $banners = Banner::orderBy('order')->get();
        
        return Inertia::render('Admin/Banners/Index', [
            'banners' => $banners
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Banners/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBannerRequest $request)
    {
        $validated = $request->validated();


        $imagePath = $request->file('image')->store('banners', 'public');

        // Get the highest order number and add 1
        $maxOrder = Banner::max('order') ?? 0;
        
        Banner::create([
            'title' => $request->title,
            'image' => $imagePath,
            'description' => $request->description,
            'link' => $request->link,
            'status' => $request->status,
            'order' => $maxOrder + 1,
        ]);

        return redirect()->route('banners.index')->with('success', 'Banner created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Banner $banner)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Banner $banner)
    {
        return Inertia::render('Admin/Banners/Edit', [
            'banner' => $banner
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBannerRequest $request, Banner $banner)
    {
        $validated = $request->validated();


        $data = [
            'title' => $request->title,
            'description' => $request->description,
            'link' => $request->link,
            'status' => $request->status,
        ];

        if ($request->hasFile('image')) {
            // Delete the old image
            if ($banner->image) {
                Storage::disk('public')->delete($banner->image);
            }
            
            // Store the new image
            $imagePath = $request->file('image')->store('banners', 'public');
            $data['image'] = $imagePath;
        }

        $banner->update($data);

        return redirect()->route('banners.index')->with('success', 'Banner updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Banner $banner)
    {
        // Delete the image from storage
        if ($banner->image) {
            Storage::disk('public')->delete($banner->image);
        }
        
        $banner->delete();

        return redirect()->route('banners.index')->with('success', 'Banner deleted successfully.');
    }

    public function updateOrder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'banners' => 'required|array',
            'banners.*.id' => 'required|exists:banners,id',
            'banners.*.order' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        foreach ($request->banners as $bannerData) {
            Banner::where('id', $bannerData['id'])->update(['order' => $bannerData['order']]);
        }

        return response()->json(['message' => 'Banner order updated successfully.']);
    }

    public function updateStatus(Banner $banner)
    {
        $banner->update([
            'status' => $banner->status === 'active' ? 'inactive' : 'active',
        ]);

        return redirect()->route('banners.index')->with('success', 'Banner status updated successfully.');
    }

    
}
