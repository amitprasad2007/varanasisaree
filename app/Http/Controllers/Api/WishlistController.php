<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Models\Wishlist;
use App\Models\ProductVariant;
use App\Services\ProductService;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class WishlistController extends Controller
{
    public $productService;
    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }
    public function getWishlistItems(Request $request)
    {
        $customer = $request->user();

        $wishlistItems = Wishlist::where('customer_id', $customer->id)
            ->with(['product.category'])
            ->get();

        $products = $wishlistItems->pluck('product');
        if( $products->isEmpty()){
            return response()->json([]);
        }
        $result = $this->productService->productdetails($products);
        return response()->json($result);
    }

    public function add(Request $request)
    {
        $customer = $request->user();
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'product_variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
        ]);

        if (empty($validated['product_variant_id'])) {
            // If no variant is specified, use the first variant of the product
            $validated['product_variant_id'] = Product::find($validated['product_id'])->variants->first()?->id;
        }

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
        if (!$request['product_variant_id'] ) {
            // If no variant is specified, use the first variant of the product
            $request['product_variant_id'] = Product::find($productId)->variants->first()?->id;
        }else{
            $request['product_variant_id'] = null;
        }
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
        if (!isset($validated['product_variant_id']) ) {
            // If no variant is specified, use the first variant of the product
            $validated['product_variant_id'] = Product::find($validated['product_id'])->variants->first()?->id;
        }
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
        if (!isset($validated['product_variant_id']) ) {
            // If no variant is specified, use the first variant of the product
            $validated['product_variant_id'] = Product::find($productId)->variants->first()?->id;
        }
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
        ]);
        $items =  Wishlist::where('session_token', $validated['session_token'])
            ->orderByDesc('updated_at')
            ->limit(200)
            ->get();
            $products = $items->pluck('product');
            if( $products->isEmpty()){
                return response()->json([]);
            }
            $result = $this->productService->productdetails($products);
        return response()->json($result);
    }

    public function guestcheckwishlist(Request $request)
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'session_token' => ['required', 'string', 'max:64'],
            'product_variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
        ]);
        if (empty($validated['product_variant_id'])) {
            // If no variant is specified, use the first variant of the product
            $validated['product_variant_id'] = Product::find($validated['product_id'])->variants->first()?->id;
        }
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
        if (empty($validated['product_variant_id'])) {
            // If no variant is specified, use the first variant of the product
            $validated['product_variant_id'] = Product::find($validated['product_id'])->variants->first()?->id;
        }
        $whistcount = Wishlist::where('customer_id', $customer->id)
            ->where('product_id', $validated['product_id'])
            ->where('product_variant_id', $validated['product_variant_id'])
            ->count();
        return response()->json($whistcount);

    }

    public function wishlistremovebyid(Wishlist $wishlist){
        $wishlist->delete();
        return response()->json(['status' => 'ok']);
    }
}
