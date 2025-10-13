<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Wishlist;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

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
            'product_variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
        ]);

        $exists = Wishlist::where('customer_id', $customer->id)
            ->where('product_id', $validated['product_id'])
            ->where('product_variant_id', $validated['product_variant_id'])
            ->exists();

        if (!$exists) {
            Wishlist::create([
                'customer_id' => $customer->id,
                'product_id' => $validated['product_id'],
                'product_variant_id' => $validated['product_variant_id'],
            ]);
        }

        return response()->json(['status' => 'ok']);
    }

    public function remove(Request $request, int $productId)
    {
        $customer = $request->user();
        Wishlist::where('customer_id', $customer->id)
            ->where('product_id', $productId)
            ->where('product_variant_id', $request['product_variant_id'])
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

    // Guest endpoints using session_token
    public function guestAdd(Request $request)
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'session_token' => ['required', 'string', 'max:64'],
            'product_variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
        ]);

        DB::table('wishlists')->updateOrInsert(
            [
                'session_token' => $validated['session_token'],
                'product_id' => $validated['product_id'],
                'product_variant_id' => $validated['product_variant_id'],
            ],
            [
                'customer_id' => null,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        return response()->json(['status' => 'ok']);
    }

    public function guestRemove(Request $request, int $productId)
    {
        $validated = $request->validate([
            'session_token' => ['required', 'string', 'max:64'],
            'product_variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
        ]);
        DB::table('wishlists')
            ->where('session_token', $validated['session_token'])
            ->where('product_id', $productId)
            ->where('product_variant_id', $validated['product_variant_id'])
            ->delete();
        return response()->json(['status' => 'ok']);
    }

    public function guestList(Request $request)
    {
        $validated = $request->validate([
            'session_token' => ['required', 'string', 'max:64'],
            'product_variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
        ]);
        $items = DB::table('wishlists as w')
            ->join('products as p', 'p.id', '=', 'w.product_id')
            ->where('w.session_token', $validated['session_token'])
            ->orderByDesc('w.updated_at')
            ->limit(200)
            ->get(['p.id', 'p.name', 'p.slug', 'w.product_variant_id']);
        return response()->json($items);
    }

    public function guestcheckwishlist(Request $request)
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'session_token' => ['required', 'string', 'max:64'],
            'product_variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
        ]);
        $whistcount = Wishlist::where('session_token',$validated['session_token'] )
            ->where('product_id', $validated['product_id'])
            ->where('product_variant_id',$validated['product_variant_id'])
            ->count();
        return response()->json($whistcount);
    }

    public function checkwishlist(Request $request){
        $customer = $request->user();
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'product_variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
        ]);

        $whistcount = Wishlist::where('customer_id', $customer->id)
            ->where('product_id', $validated['product_id'])
            ->where('product_variant_id', $validated['product_variant_id'])
            ->count();
        return response()->json($whistcount);

    }
}
