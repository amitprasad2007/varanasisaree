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


