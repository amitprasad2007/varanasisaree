<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductVideo;
use App\Models\VideoProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Http\Requests\StoreProductVideoRequest;
use App\Http\Requests\UpdateProductVideoRequest;

class ProductVideoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Product $product)
    {
        $product->load(['videos.videoProvider']);
        return Inertia::render('Admin/ProductVideos/Index', [
            'product' => $product,
            'videos' => $product->videos
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Product $product)
    {
        $providers = VideoProvider::active()->get();

        return Inertia::render('Admin/ProductVideos/Create', [
            'product' => $product,
            'providers' => $providers
        ]);
    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductVideoRequest $request, Product $product)
    {
        $validated = $request->validated();

        $validated['product_id'] = $product->id;

        // Get the highest display order and add 1
        $maxOrder = ProductVideo::where('product_id', $product->id)->max('display_order') ?? 0;
        $validated['display_order'] = $maxOrder + 1;

        if ($request->hasFile('thumbnail')) {
            $thumbnailPath = $request->file('thumbnail')->store('videos', 'public');
            $validated['thumbnail'] = $thumbnailPath;
        }

        // If this video is set as featured, unfeatured all others
        if ($validated['is_featured']) {
            ProductVideo::where('product_id', $product->id)
                ->where('is_featured', true)
                ->update(['is_featured' => false]);
        }

        ProductVideo::create($validated);

        return redirect()->route('product-videos.index', $product->id)
            ->with('success', 'Video added successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(ProductVideo $productVideo)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product, ProductVideo $video)
    {
        $providers = VideoProvider::active()->get();

        return Inertia::render('Admin/ProductVideos/Edit', [
            'product' => $product,
            'video' => $video,
            'providers' => $providers
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductVideoRequest $request, Product $product, ProductVideo $video)
    {
        $validated = $request->validate([
            'video_provider_id' => 'required|exists:video_providers,id',
            'title' => 'required|string|max:255',
            'video_id' => 'required|string|max:255',
            'description' => 'nullable|string',
            'thumbnail' => 'nullable|image|max:1024',
            'is_featured' => 'boolean',
            'status' => 'required|in:active,inactive',
        ]);

        if ($request->hasFile('thumbnail')) {
            // Delete old thumbnail if exists
            if ($video->thumbnail) {
                Storage::disk('public')->delete($video->thumbnail);
            }

            $thumbnailPath = $request->file('thumbnail')->store('videos', 'public');
            $validated['thumbnail'] = $thumbnailPath;
        }

        // If this video is set as featured, unfeatured all others
        if ($validated['is_featured'] && !$video->is_featured) {
            ProductVideo::where('product_id', $product->id)
                ->where('is_featured', true)
                ->update(['is_featured' => false]);
        }

        $video->update($validated);

        return redirect()->route('product-videos.index', $product->id)
            ->with('success', 'Video updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product, ProductVideo $productVideo)
    {
        // Delete thumbnail if exists
        if ($productVideo->thumbnail) {
            Storage::disk('public')->delete($productVideo->thumbnail);
        }

        $productVideo->delete();

        return redirect()->route('product-videos.index', $product->id)
            ->with('success', 'Video deleted successfully.');
    }

    public function updateOrder(Request $request, Product $product)
    {
        $request->validate([
            'videos' => 'required|array',
            'videos.*.id' => 'required|exists:product_videos,id',
            'videos.*.display_order' => 'required|integer|min:0',
        ]);

        foreach ($request->videos as $videoData) {
            ProductVideo::where('id', $videoData['id'])
                ->where('product_id', $product->id)
                ->update(['display_order' => $videoData['display_order']]);
        }

        return response()->json(['success' => true]);
    }

    public function setFeatured(Request $request, ProductVideo $video)
    {
        // Unfeatured all videos for this product
        ProductVideo::where('product_id', $video->product_id)
            ->where('is_featured', true)
            ->update(['is_featured' => false]);

        // Set this video as featured
        $video->update(['is_featured' => true]);

        return redirect()->route('product-videos.index', $video->product_id)
            ->with('success', 'Video set as featured successfully.');
    }
}
