<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use App\Models\CollectionType;
use Illuminate\Http\Request;

class CollectionController extends Controller
{
    public function types()
    {
        $types = CollectionType::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id','name','slug','description','banner_image','thumbnail_image','seo_title','seo_description']);

        return response()->json($types);
    }

    public function index(Request $request)
    {
        $typeSlug = $request->query('type');
        $query = Collection::query()->where('is_active', true);

        if ($typeSlug) {
            $query->whereHas('collectionType', function ($q) use ($typeSlug) {
                $q->where('slug', $typeSlug);
            });
        }

        $collections = $query->with('collectionType:id,name,slug')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id','collection_type_id','name','slug','description','banner_image','thumbnail_image','seo_title','seo_description']);

        return response()->json($collections);
    }

    public function show($slug)
    {
        $collection = Collection::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->with([
                'collectionType:id,name,slug',
                'products' => function ($q) {
                    $q->select('products.id','products.name','products.slug','products.price','products.status')
                      ->where('products.status', 'active')
                      ->with('imageproducts:id,product_id,image_path')
                      ->orderBy('pivot_sort_order');
                },
            ])
            ->firstOrFail(['id','collection_type_id','name','slug','description','banner_image','thumbnail_image','seo_title','seo_description']);

        // Transform products to include image URLs
        $collection->products = $collection->products->map(function ($product) {
             // Images (resolve and convert to absolute URLs)
            $images = $product->resolveImagePaths()->map(function ($path) {
                $path = (string) $path;
                if (Str::startsWith($path, ['http://', 'https://', '//'])) {
                    return $path;
                }
                return asset('storage/' . ltrim($path, '/'));
            })->values();

            // Skip products with no images
            if ($images->isEmpty()) {
                return null;
            }
            return [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'price' => $product->price,
                'status' => $product->status,
                'images' => $images,
            ];
        })->filter();

        // Transform collection to array format
        $collection = [
            'id' => $collection->id,
            'collection_type_id' => $collection->collection_type_id,
            'name' => $collection->name,
            'slug' => $collection->slug,
            'description' => $collection->description,
            'banner_image' => $collection->banner_image,
            'thumbnail_image' => $collection->thumbnail_image,
            'seo_title' => $collection->seo_title,
            'seo_description' => $collection->seo_description,
            'collection_type' => $collection->collectionType,
            'products' => $collection->products,
        ];

        return response()->json($collection);
    }

    public function featured()
    {
        $collections = Collection::query()
            ->where('is_active', true)
            ->with('collectionType:id,name,slug')
            ->orderBy('sort_order')
            ->limit(6)
            ->get(['id','collection_type_id','name','slug','description','banner_image','thumbnail_image','seo_title','seo_description']);

        return response()->json($collections);
    }

    public function search(Request $request)
    {
        $query = $request->query('q');
        
        if (!$query) {
            return response()->json([]);
        }

        $collections = Collection::query()
            ->where('is_active', true)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('description', 'like', "%{$query}%");
            })
            ->with('collectionType:id,name,slug')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->limit(10)
            ->get(['id','collection_type_id','name','slug','description','banner_image','thumbnail_image']);

        return response()->json($collections);
    }
}


