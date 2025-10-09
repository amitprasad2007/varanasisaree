<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GuestDataController extends Controller
{
    /**
     * Attach guest session data (wishlist and recent views) to the authenticated user
     * without removing the session_token. Also deduplicates any conflicts.
     * Payload: { session_token: string }
     */
    public function claim(Request $request)
    {
        $customer = $request->user();
        $validated = $request->validate([
            'session_token' => ['required', 'string', 'max:64'],
        ]);
        $sessionToken = $validated['session_token'];

        // Wishlist: remove conflicts then attach
        $guestWishlistProductIds = DB::table('wishlists')
            ->where('session_token', $sessionToken)
            ->pluck('product_id');

        if ($guestWishlistProductIds->isNotEmpty()) {
            // Remove existing user duplicates
            DB::table('wishlists')
                ->where('customer_id', $customer->id)
                ->whereIn('product_id', $guestWishlistProductIds)
                ->delete();

            // Attach guest rows to user while keeping session_token
            DB::table('wishlists')
                ->where('session_token', $sessionToken)
                ->update([
                    'customer_id' => $customer->id,
                    'updated_at' => now(),
                ]);
        }

        // Recent views: remove conflicts then attach and prune to last 50
        $guestRecentProductIds = DB::table('recent_views')
            ->where('session_token', $sessionToken)
            ->pluck('product_id');

        if ($guestRecentProductIds->isNotEmpty()) {
            // Remove existing rows that would duplicate
            DB::table('recent_views')
                ->where('customer_id', $customer->id)
                ->whereIn('product_id', $guestRecentProductIds)
                ->delete();

            // Attach guest rows to user while keeping session_token
            DB::table('recent_views')
                ->where('session_token', $sessionToken)
                ->update([
                    'customer_id' => $customer->id,
                    'updated_at' => now(),
                ]);

            // Prune user's recent views to last 50 by viewed_at desc
            $keep = 50;
            $idsToDelete = DB::table('recent_views')
                ->where('customer_id', $customer->id)
                ->orderByDesc('viewed_at')
                ->skip($keep)
                ->take(PHP_INT_MAX)
                ->pluck('id');
            if ($idsToDelete->isNotEmpty()) {
                DB::table('recent_views')->whereIn('id', $idsToDelete)->delete();
            }
        }

        return response()->json(['status' => 'ok']);
    }
}


