<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;

class PageController extends Controller
{
    /**
     * Get a specific page by slug
     *
     * @param string $slug
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(string $slug)
    {
        try {
            $page = Page::where('slug', $slug)
                ->where('is_active', true)
                ->firstOrFail();

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $page->id,
                    'title' => $page->title,
                    'slug' => $page->slug,
                    'type' => $page->type,
                    'content' => $page->content,
                    'metadata' => $page->metadata,
                    'last_updated_at' => $page->last_updated_at ? $page->last_updated_at->format('F Y') : $page->updated_at->format('F Y'),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Page not found',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Get privacy policy
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function privacy()
    {
        return $this->show('privacy-policy');
    }

    /**
     * Get terms and conditions
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function terms()
    {
        return $this->show('terms-conditions');
    }

    /**
     * Get shipping and delivery policy
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function shipping()
    {
        return $this->show('shipping-delivery');
    }

    /**
     * Get cancellation and refund policy
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function refund()
    {
        return $this->show('cancellation-refund');
    }

    /**
     * Get delivery information
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function deliveryInfo()
    {
        try {
            $page = Page::where('slug', 'delivery-info')
                ->where('is_active', true)
                ->first();

            if (!$page) {
                // Return default delivery info if not found
                return response()->json([
                    'success' => true,
                    'data' => [
                        [
                            'icon' => 'Truck',
                            'title' => 'Free Shipping',
                            'description' => 'On orders over ₹5000. Delivery in 5-7 business days.',
                        ],
                        [
                            'icon' => 'RefreshCw',
                            'title' => 'Easy Returns',
                            'description' => '30-day return policy for unused products.',
                        ],
                        [
                            'icon' => 'Shield',
                            'title' => 'Authenticity Guarantee',
                            'description' => 'All products come with certificate of authenticity.',
                        ],
                    ],
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => $page->metadata ?? [],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch delivery info',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * List all policy pages
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function policies()
    {
        try {
            $policies = Page::where('type', 'policy')
                ->where('is_active', true)
                ->orderBy('title')
                ->get()
                ->map(function ($page) {
                    return [
                        'id' => $page->id,
                        'title' => $page->title,
                        'slug' => $page->slug,
                        'last_updated' => $page->last_updated_at ? $page->last_updated_at->format('F Y') : $page->updated_at->format('F Y'),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $policies,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch policies',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
