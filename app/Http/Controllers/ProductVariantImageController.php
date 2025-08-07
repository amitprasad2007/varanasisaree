<?php

namespace App\Http\Controllers;

use App\Models\ProductVariantImage;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class ProductVariantImageController extends Controller
{
    public function index(ProductVariant $variant)
    {
        $images = ProductVariantImage::where('product_variant_id', $variant->id)
            ->orderBy('display_order')
            ->get();

        return Inertia::render('Admin/ProductVariantImages/Index', [
            'variant' => $variant->load(['product', 'color', 'size']),
            'images' => $images
        ]);
    }

    public function create(ProductVariant $variant)
    {
        return Inertia::render('Admin/ProductVariantImages/Create', [
            'variant' => $variant->load(['product', 'color', 'size'])
        ]);
    }

    public function store(Request $request, ProductVariant $variant)
    {
        //dd($request->all());
        $request->validate([
            'images.*' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'alt_texts' => 'array',
            'alt_texts.*' => 'nullable|string',
            'primary_image' => 'nullable|integer'
        ]);

        $images = $request->file('images', []);
        $altTexts = $request->get('alt_texts', []);
        $primaryImageIndex = $request->get('primary_image');

        // Get the next display order
        $nextOrder = ProductVariantImage::where('product_variant_id', $variant->id)->max('display_order') + 1;

        foreach ($images as $index => $image) {
            $imagePath = $image->store('product-variant-images', 'public');

            $isPrimary = false;
            if ($primaryImageIndex !== null && $primaryImageIndex == $index) {
                // Set other images to not be primary
                ProductVariantImage::where('product_variant_id', $variant->id)
                    ->update(['is_primary' => false]);
                $isPrimary = true;
            } elseif ($primaryImageIndex === null && $index === 0) {
                // If no primary specified and this is the first image, make it primary
                $existingPrimary = ProductVariantImage::where('product_variant_id', $variant->id)
                    ->where('is_primary', true)
                    ->exists();
                if (!$existingPrimary) {
                    $isPrimary = true;
                }
            }

            ProductVariantImage::create([
                'product_variant_id' => $variant->id,
                'image_path' => $imagePath,
                'alt_text' => $altTexts[$index] ?? null,
                'is_primary' => $isPrimary,
                'display_order' => $nextOrder + $index,
            ]);
        }

        return redirect()->route('product-variant-images.index', $variant)
            ->with('success', 'Images uploaded successfully.');
    }

    public function update(Request $request, ProductVariantImage $image)
    {
        $request->validate([
            'alt_text' => 'nullable|string',
            'is_primary' => 'boolean',
            'display_order' => 'integer'
        ]);

        $data = $request->only(['alt_text', 'display_order']);

        if ($request->get('is_primary')) {
            // Set other images to not be primary
            ProductVariantImage::where('product_variant_id', $image->product_variant_id)
                ->where('id', '!=', $image->id)
                ->update(['is_primary' => false]);

            $data['is_primary'] = true;
        }

        $image->update($data);

        return redirect()->back()->with('success', 'Image updated successfully.');
    }

    public function destroy(ProductVariantImage $image)
    {
        // Delete the file from storage
        //dd($image);
        if ($image->image_path) {
            Storage::disk('public')->delete($image->image_path);
        }

        // If this was the primary image, set another image as primary
        if ($image->is_primary) {
            $nextPrimary = ProductVariantImage::where('product_variant_id', $image->product_variant_id)
                ->where('id', '!=', $image->id)
                ->orderBy('display_order')
                ->first();

            if ($nextPrimary) {
                $nextPrimary->update(['is_primary' => true]);
            }
        }

        $image->delete();

        return redirect()->back()->with('success', 'Image deleted successfully.');
    }

    public function setPrimary(ProductVariantImage $image)
    {
      //  dd($image);
        // Set all other images to not be primary
        ProductVariantImage::where('product_variant_id', $image->product_variant_id)
            ->update(['is_primary' => false]);

        // Set this image as primary
        $image->update(['is_primary' => true]);

        return redirect()->back()->with('success', 'Primary image updated successfully.');
    }

    public function updateOrder(Request $request, ProductVariant $variant)
    {
        $request->validate([
            'images' => 'required|array',
            'images.*.id' => 'required|exists:product_variant_images,id',
            'images.*.display_order' => 'required|integer',
        ]);

        foreach ($request->images as $imageData) {
            ProductVariantImage::where('id', $imageData['id'])
                ->update(['display_order' => $imageData['display_order']]);
        }

        return redirect()->back()->with('success', 'Image order updated successfully.');
    }
}
