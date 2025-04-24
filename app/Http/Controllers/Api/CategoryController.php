<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{


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
