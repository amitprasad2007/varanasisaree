<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RecentlyViewedController extends Controller
{
    // Return last N items viewed by the authenticated customer
    public function index(Request $request)
    {
        $customer = $request->user();
        $limit = (int) $request->get('limit', 10);

        $items = DB::table('recent_views as rv')
            ->join('products as p', 'p.id', '=', 'rv.product_id')
            ->where('rv.customer_id', $customer->id)
            ->orderByDesc('rv.viewed_at')
            ->limit(max(1, min(50, $limit)))
            ->get(['p.id', 'p.name', 'p.slug']);

        return response()->json($items);
    }

    // Add a product to recent views; keep only latest N per user to avoid bloat
    public function store(Request $request)
    {
        $customer = $request->user();
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
        ]);

        $now = now();

        DB::table('recent_views')->updateOrInsert(
            [
                'customer_id' => $customer->id,
                'product_id' => $validated['product_id'],
            ],
            [
                'viewed_at' => $now,
                'updated_at' => $now,
                'created_at' => DB::raw("COALESCE(created_at, '$now')"),
            ]
        );

        // Prune to last 50 items per customer
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

        return response()->json(['status' => 'ok']);
    }

    // Sync guest recent items (array) into server, capped to last N
    public function sync(Request $request)
    {
        $customer = $request->user();
        $validated = $request->validate([
            'items' => ['array'],
            'items.*' => ['integer', 'exists:products,id'],
        ]);

        $items = collect($validated['items'] ?? [])->unique()->take(50);
        $now = now();

        foreach ($items as $productId) {
            DB::table('recent_views')->updateOrInsert(
                [
                    'customer_id' => $customer->id,
                    'product_id' => $productId,
                ],
                [
                    'viewed_at' => $now,
                    'updated_at' => $now,
                    'created_at' => DB::raw("COALESCE(created_at, '$now')"),
                ]
            );
        }

        // Prune to last 50
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

        return response()->json(['status' => 'ok']);
    }
}


