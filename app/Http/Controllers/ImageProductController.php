<?php

namespace App\Http\Controllers;

use App\Models\ImageProduct;
use App\Models\Product;
use App\Http\Requests\StoreImageProductRequest;
use App\Http\Requests\UpdateImageProductRequest;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ImageProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */    
    public function index(Product $product)
    {
        $product->load('imageproducts');
        
        return Inertia::render('Admin/Images/Index', [
            'product' => $product,
            'images' => $product->imageproducts
        ]);
    }
    /**
     * Show the form for creating a new resource.
     */
    public function create(Product $product)
    {
        return Inertia::render('Admin/Images/Create', [
            'product' => $product
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreImageProductRequest $request,Product $product)
    {
       // dd($request);

        $images = $request->file('images');
        $altText = $request->input('alt_text', '');
        $isPrimary = $request->boolean('is_primary', false);
        $count = 0;

        // If this is marked as primary, update all other images
        if ($isPrimary) {
            ImageProduct::where('product_id', $product->id)
                ->update(['is_primary' => false]);
        }

        // If no primary image exists yet, make the first one primary
        $hasPrimary = ImageProduct::where('product_id', $product->id)
            ->where('is_primary', true)
            ->exists();

        // Get the highest display order
        $maxOrder = ImageProduct::where('product_id', $product->id)
            ->max('display_order');

        foreach ($images as $image) {
            $path = $image->store('products', 'public');
            
            $setAsPrimary = $isPrimary;
            if (!$hasPrimary && $count === 0 && !$isPrimary) {
                $setAsPrimary = true;
                $hasPrimary = true;
            }
            
            ImageProduct::create([
                'product_id' => $product->id,
                'image_path' => $path,
                'alt_text' => $altText,
                'is_primary' => $setAsPrimary,
                'display_order' => $maxOrder + $count + 1,
            ]);
            
            $count++;
        }

        return redirect()->route('product-images.index', $product->id)
            ->with('success', 'Product images uploaded successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(ImageProduct $imageProduct)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ImageProduct $imageProduct)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateImageProductRequest $request, ImageProduct $imageProduct)
    {

        // If this is marked as primary, update all other images
        if ($request->boolean('is_primary', false)) {
            ImageProduct::where('product_id', $imageProduct->product_id)
                ->where('id', '!=', $imageProduct->id)
                ->update(['is_primary' => false]);
        }

        $imageProduct->update($request->only(['alt_text', 'is_primary', 'display_order']));

        return redirect()->route('product-images.index', $imageProduct->product_id)
            ->with('success', 'Product image updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ImageProduct $imageProduct)
    {
       // dd($imageProduct);
        $productId = $imageProduct->product_id;
        $isPrimary = $imageProduct->is_primary;

        // Delete the file from storage
        if (!empty($imageProduct->image_path) && Storage::disk('public')->exists($imageProduct->image_path)) {
            Storage::disk('public')->delete($imageProduct->image_path);
        }

        $imageProduct->delete();

        // If the deleted image was primary, set another one as primary
        if ($isPrimary) {
            $nextImage = ImageProduct::where('product_id', $productId)->first();
            if ($nextImage) {
                $nextImage->update(['is_primary' => true]);
            }
        }

        return redirect()->route('product-images.index', $productId)
            ->with('success', 'Product image deleted successfully.');
    }

    public function setPrimary(ImageProduct $imageProduct)
    {
       // dd($imageProduct);  
        ImageProduct::where('product_id', $imageProduct->product_id)
            ->update(['is_primary' => false]);
        
        $imageProduct->update(['is_primary' => true]);
        
        return redirect()->route('product-images.index', $imageProduct->product_id)
            ->with('success', 'Primary image updated successfully.');
    }

    public function updateOrder(Request $request, Product $product)
    {
        $request->validate([
            'images' => 'required|array',
            'images.*.id' => 'required|exists:image_products,id',
            'images.*.display_order' => 'required|integer|min:0',
        ]);
      //  dd($request);
        foreach ($request->input('images') as $image) {
            ImageProduct::where('id', $image['id'])
                ->update(['display_order' => $image['display_order']]);
        }

        return redirect()->route('product-images.index', $product->id)
            ->with('success', 'Image order updated successfully.');
    }
}
