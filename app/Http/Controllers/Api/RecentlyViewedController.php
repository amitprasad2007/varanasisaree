<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RecentView;
use Illuminate\Http\Request;

class RecentlyViewedController extends Controller
{
    // Return last N items viewed by the authenticated customer
    public function index(Request $request)
    {
        $customer = $request->user();
        $limit = max(1, min(50, (int) $request->get('limit', 10)));

        $items = RecentView::query()
            ->with(['product:id,name,slug'])
            ->where('customer_id', $customer->id)
            ->orderByDesc('viewed_at')
            ->limit($limit)
            ->get()
            ->map(function (RecentView $rv) {
                return [
                    'id' => $rv->product?->id,
                    'name' => $rv->product?->name,
                    'slug' => $rv->product?->slug,
                ];
            })
            ->filter(fn ($row) => $row['id'] !== null)
            ->values();

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

        RecentView::updateOrCreate(
            [
                'customer_id' => $customer->id,
                'product_id' => $validated['product_id'],
            ],
            [
                'session_token' => null,
                'viewed_at' => $now,
            ]
        );

        $this->pruneCustomer($customer->id, 50);

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
            RecentView::updateOrCreate(
                [
                    'customer_id' => $customer->id,
                    'product_id' => $productId,
                ],
                [
                    'session_token' => null,
                    'viewed_at' => $now,
                ]
            );
        }

        $this->pruneCustomer($customer->id, 50);

        return response()->json(['status' => 'ok']);
    }

    // Guest endpoints
    public function guestStore(Request $request)
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'session_token' => ['required', 'string', 'max:64'],
        ]);

        RecentView::updateOrCreate(
            [
                'session_token' => $validated['session_token'],
                'product_id' => $validated['product_id'],
            ],
            [
                'customer_id' => null,
                'viewed_at' => now(),
            ]
        );

        $this->pruneGuestSession($validated['session_token'], 50);

        return response()->json(['status' => 'ok']);
    }

    public function guestIndex(Request $request)
    {
        $validated = $request->validate([
            'session_token' => ['required', 'string', 'max:64'],
            'limit' => ['sometimes', 'integer', 'min:1', 'max:50'],
        ]);

        $limit = max(1, min(50, (int) ($validated['limit'] ?? 10)));

        $items = RecentView::query()
            ->with(['product:id,name,slug'])
            ->where('session_token', $validated['session_token'])
            ->orderByDesc('viewed_at')
            ->limit($limit)
            ->get()
            ->map(function (RecentView $rv) {
                return [
                    'id' => $rv->product?->id,
                    'name' => $rv->product?->name,
                    'slug' => $rv->product?->slug,
                ];
            })
            ->filter(fn ($row) => $row['id'] !== null)
            ->values();

        return response()->json($items);
    }

    private function pruneCustomer(int $customerId, int $keep): void
    {
        $idsToDelete = RecentView::query()
            ->where('customer_id', $customerId)
            ->orderByDesc('viewed_at')
            ->skip($keep)
            ->pluck('id');

        if ($idsToDelete->isNotEmpty()) {
            RecentView::query()->whereIn('id', $idsToDelete)->delete();
        }
    }

    private function pruneGuestSession(string $sessionToken, int $keep): void
    {
        $idsToDelete = RecentView::query()
            ->where('session_token', $sessionToken)
            ->orderByDesc('viewed_at')
            ->skip($keep)
            ->pluck('id');

        if ($idsToDelete->isNotEmpty()) {
            RecentView::query()->whereIn('id', $idsToDelete)->delete();
        }
    }
}


