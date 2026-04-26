<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\JsonResponse;

class PageController extends Controller
{
    /**
     * Get a specific page by slug
     *
     * @return JsonResponse
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
     * @return JsonResponse
     */
    public function privacy()
    {
        return $this->show('privacy-policy');
    }

    /**
     * Get terms and conditions
     *
     * @return JsonResponse
     */
    public function terms()
    {
        return $this->show('terms-conditions');
    }

    /**
     * Get shipping and delivery policy
     *
     * @return JsonResponse
     */
    public function shipping()
    {
        return $this->show('shipping-delivery');
    }

    /**
     * Get cancellation and refund policy
     *
     * @return JsonResponse
     */
    public function refund()
    {
        return $this->show('cancellation-refund');
    }

    /**
     * Get about us information
     *
     * @return JsonResponse
     */
    public function aboutUs()
    {
        try {
            $page = Page::where('slug', 'about-us')
                ->where('is_active', true)
                ->first();

            if ($page) {
                return $this->show('about-us');
            }

            // Fallback to legacy Aboutus table if Page record is missing
            $about = \App\Models\Aboutus::active()->first();
            if (! $about) {
                return response()->json([
                    'success' => false,
                    'message' => 'About Us content not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $about->id,
                    'title' => $about->page_title ?? 'About Us',
                    'slug' => 'about-us',
                    'type' => 'policy',
                    'content' => $about->description,
                    'metadata' => [
                        'introduction' => $about->description,
                        'sections' => [
                            [
                                'title' => 'Our Product Range Includes:',
                                'icon' => 'shopping_bag',
                                'items' => [
                                    'Banarasi Handloom Sarees',
                                    'Kattan Silk Sarees & Suits',
                                    'Khaddi & Pure Chiffon Sarees',
                                    'Georgette, Dupion, and Moonga Sarees',
                                    'Kanjivaram & Chiniya Silk Sarees',
                                    'Tanchoi Silk Suits',
                                    'Cotton & Linen Sarees and Suits',
                                    'Art Silk and Pure Silk Sarees',
                                ],
                            ],
                            [
                                'title' => 'Why Choose Us?',
                                'icon' => 'stars',
                                'items' => [
                                    'Direct Manufacturing Prices',
                                    'Premium Quality Guarantee',
                                    'Trending & Traditional Designs',
                                    'Wholesale & Retail Orders Accepted',
                                    'Legacy of Trust Since 1985',
                                ],
                            ],
                            [
                                'title' => 'Empowering Artisans',
                                'icon' => 'groups',
                                'content' => 'Today, Samar Silk Palace proudly supports over 200 artisan families across Varanasi. Our commitment to sustainable and ethical practices ensures that each purchase contributes to the livelihood of skilled weavers.',
                            ],
                            [
                                'title' => 'Visit Our Showroom',
                                'icon' => 'location_on',
                                'items' => [
                                    'Address: CK 10/44, Brahmanand Chauraha, Chowk, Varanasi - 221001',
                                    'GSTIN: ' . ($about->gst_no ?? '09AAKCS1234F1Z1'),
                                    'Hours: Mon-Sat, 10:30 AM - 8:30 PM',
                                ],
                            ],
                        ],
                    ],
                    'last_updated_at' => $about->updated_at->format('F Y'),
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
     * Get delivery information
     *
     * @return JsonResponse
     */
    public function deliveryInfo()
    {
        try {
            $page = Page::where('slug', 'delivery-info')
                ->where('is_active', true)
                ->first();

            if (! $page) {
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
     * @return JsonResponse
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
