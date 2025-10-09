<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Wishlist;
use Illuminate\Validation\Rule;

class WishlistController extends Controller
{
    public function getWishlistItems(Request $request)
    {
        $customer = $request->user();

        $wishlistItems = Wishlist::where('customer_id', $customer->id)
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

    public function add(Request $request)
    {
        $customer = $request->user();
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
        ]);

        $exists = Wishlist::where('customer_id', $customer->id)
            ->where('product_id', $validated['product_id'])
            ->exists();

        if (!$exists) {
            Wishlist::create([
                'customer_id' => $customer->id,
                'product_id' => $validated['product_id'],
            ]);
        }

        return response()->json(['status' => 'ok']);
    }

    public function remove(Request $request, int $productId)
    {
        $customer = $request->user();
        Wishlist::where('customer_id', $customer->id)
            ->where('product_id', $productId)
            ->delete();
        return response()->json(['status' => 'ok']);
    }

    /**
     * Sync guest wishlist items into user account after login.
     * Payload: { items: number[] }
     */
    public function sync(Request $request)
    {
        $customer = $request->user();
        $validated = $request->validate([
            'items' => ['array'],
            'items.*' => ['integer', 'exists:products,id'],
        ]);

        $productIds = collect($validated['items'] ?? [])->unique()->values();
        if ($productIds->isEmpty()) {
            return response()->json(['status' => 'ok']);
        }

        $existing = Wishlist::where('customer_id', $customer->id)
            ->whereIn('product_id', $productIds)
            ->pluck('product_id')
            ->all();

        $toInsert = $productIds->diff($existing)->map(function ($pid) use ($customer) {
            return [
                'customer_id' => $customer->id,
                'product_id' => $pid,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        })->values()->all();

        if (!empty($toInsert)) {
            Wishlist::insert($toInsert);
        }

        return response()->json(['status' => 'ok', 'inserted' => count($toInsert)]);
    }
}
