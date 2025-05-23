<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Whishlist;
use App\Models\Wishlist;

class WishlistController extends Controller
{
    public function getWishlistItems(Request $request)
    {
        $user = $request->user();

        $wishlistItems = Wishlist::where('user_id', $user->id)
            ->with(['product.category'])
            ->get()
            ->map(function ($wishlist) {
                $product = $wishlist->product;
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'image' => $product->primaryImage->first()?->image_url ?? 'https://via.placeholder.com/150',
                    'price' => $product->price,
                    'originalPrice' => $product->discount > 0 ? $product->price + $product->discount : null,
                    'category' => $product->category->name ?? 'Uncategorized',
                ];
            });

        return response()->json($wishlistItems);
    }
}
