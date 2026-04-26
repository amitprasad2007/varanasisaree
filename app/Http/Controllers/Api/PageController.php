<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Aboutus;
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
        try {
            $page = Page::where('slug', 'privacy-policy')
                ->where('is_active', true)
                ->first();

            $data = [
                'id' => $page?->id ?? 97,
                'title' => 'Privacy Policy',
                'slug' => 'privacy-policy',
                'type' => 'policy',
                'content' => $page?->content ?? 'We value your privacy and are committed to protecting your personal data.',
                'metadata' => [
                    'introduction' => 'At Samar Silk Palace, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data when you visit our website or use our mobile application.',
                    'sections' => [
                        [
                            'title' => 'Information Collection',
                            'icon' => 'contact_page',
                            'content' => 'We collect information that you provide directly to us, such as when you create an account, make a purchase, or contact our support team. This may include your name, email address, phone number, and shipping address.',
                        ],
                        [
                            'title' => 'How We Use Data',
                            'icon' => 'insights',
                            'items' => [
                                'To process and fulfill your orders',
                                'To communicate with you about your account and purchases',
                                'To improve our products and services',
                                'To provide personalized recommendations',
                                'To detect and prevent fraudulent activities',
                            ],
                        ],
                        [
                            'title' => 'Data Security',
                            'icon' => 'security',
                            'content' => 'We implement industry-standard security measures to protect your personal information. Your payment data is processed through secure, encrypted gateways and is never stored on our servers.',
                        ],
                        [
                            'title' => 'Your Rights',
                            'icon' => 'gavel',
                            'items' => [
                                'Access and update your personal information',
                                'Request deletion of your data',
                                'Opt-out of marketing communications',
                                'Request a copy of your stored data',
                            ],
                        ],
                    ],
                ],
                'last_updated_at' => $page?->last_updated_at?->format('F Y') ?? now()->format('F Y'),
            ];

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Privacy Policy not found',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Get terms and conditions
     *
     * @return JsonResponse
     */
    public function terms()
    {
        try {
            $page = Page::where('slug', 'terms-conditions')
                ->where('is_active', true)
                ->first();

            $data = [
                'id' => $page?->id ?? 96,
                'title' => 'Terms & Conditions',
                'slug' => 'terms-conditions',
                'type' => 'policy',
                'content' => $page?->content ?? 'By using our services, you agree to these terms.',
                'metadata' => [
                    'introduction' => 'Welcome to Samar Silk Palace. By accessing and using our website or mobile application, you agree to comply with and be bound by the following terms and conditions of use, which together with our privacy policy govern our relationship with you.',
                    'sections' => [
                        [
                            'title' => 'User Agreement',
                            'icon' => 'handshake',
                            'content' => 'By placing an order, you confirm that you are at least 18 years old and capable of entering into a legally binding contract. You agree to provide accurate and complete information for all purchases.',
                        ],
                        [
                            'title' => 'Pricing & Availability',
                            'icon' => 'sell',
                            'content' => 'All prices are listed in Indian Rupees (INR). We reserve the right to change prices and availability of products without prior notice. In case of pricing errors, we reserve the right to cancel affected orders.',
                        ],
                        [
                            'title' => 'Intellectual Property',
                            'icon' => 'copyright',
                            'content' => 'All content, including designs, text, and images, is the property of Samar Silk Palace. Unauthorized use or reproduction is strictly prohibited and protected by international copyright laws.',
                        ],
                        [
                            'title' => 'Liability',
                            'icon' => 'balance',
                            'content' => 'Samar Silk Palace shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or platform.',
                        ],
                    ],
                ],
                'last_updated_at' => $page?->last_updated_at?->format('F Y') ?? now()->format('F Y'),
            ];

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terms & Conditions not found',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Get shipping and delivery policy
     *
     * @return JsonResponse
     */
    public function shipping()
    {
        try {
            $page = Page::where('slug', 'shipping-delivery')
                ->where('is_active', true)
                ->first();

            $data = [
                'id' => $page?->id ?? 98,
                'title' => 'Shipping & Delivery',
                'slug' => 'shipping-delivery',
                'type' => 'policy',
                'content' => $page?->content ?? 'We deliver our premium handloom products globally with care.',
                'metadata' => [
                    'introduction' => 'Samar Silk Palace is dedicated to delivering your ordered products in excellent condition and always on time. We partner with reputed courier agencies to ensure your order reaches you safely.',
                    'sections' => [
                        [
                            'title' => 'Shipping Coverage',
                            'icon' => 'public',
                            'content' => 'We offer fast and reliable delivery across India with real-time tracking for all orders. Our logistics network covers major metro cities and remote towns alike.',
                        ],
                        [
                            'title' => 'Estimated Delivery',
                            'icon' => 'schedule',
                            'items' => [
                                'Varanasi & Nearby: 1-2 business days',
                                'Metro Cities: 3-5 business days',
                                'Other Cities: 5-7 business days',
                                'Remote Areas: 7-10 business days',
                            ],
                        ],
                        [
                            'title' => 'Tracking Your Order',
                            'icon' => 'local_shipping',
                            'content' => 'Once your order is shipped, you will receive a tracking number via email and SMS. You can track your order status in real-time through our website or mobile app.',
                        ],
                        [
                            'title' => 'Premium Packaging',
                            'icon' => 'inventory_2',
                            'content' => 'Each product is secured in moisture-proof, premium packaging to protect the delicate silk fabrics during transit.',
                        ],
                    ],
                    'shipping_methods' => [
                        [
                            'name' => 'Standard Delivery',
                            'time' => '5-7 business days',
                            'price' => '₹99',
                            'details' => 'Available for all locations across India',
                        ],
                        [
                            'name' => 'Express Delivery',
                            'time' => '3-4 business days',
                            'price' => '₹199',
                            'details' => 'Priority handling for major metro cities',
                        ],
                        [
                            'name' => 'Varanasi Priority',
                            'time' => 'Within 24 hours',
                            'price' => '₹299',
                            'details' => 'Exclusive same-day delivery in Varanasi',
                        ],
                    ],
                ],
                'last_updated_at' => $page?->last_updated_at?->format('F Y') ?? now()->format('F Y'),
            ];

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Shipping Policy not found',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Get cancellation and refund policy
     *
     * @return JsonResponse
     */
    public function refund()
    {
        try {
            $page = Page::where('slug', 'cancellation-refund')
                ->where('is_active', true)
                ->first();

            $data = [
                'id' => $page?->id ?? 99,
                'title' => 'Cancellation & Refund',
                'slug' => 'cancellation-refund',
                'type' => 'policy',
                'content' => $page?->content ?? 'Our cancellation and refund policy ensures a fair experience for all customers.',
                'metadata' => [
                    'introduction' => 'At Samar Silk Palace, we strive to provide our customers with the highest quality products and exceptional service. If you are not entirely satisfied with your purchase, we\'re here to help.',
                    'sections' => [
                        [
                            'title' => 'Return Policy',
                            'icon' => 'assignment_return',
                            'content' => 'Items are eligible for return if they are defective, damaged during transit, or significantly different from the description. Please report any issues within 48 hours of delivery.',
                        ],
                        [
                            'title' => 'Eligible Criteria',
                            'icon' => 'check_circle',
                            'items' => [
                                'Wrong product received',
                                'Manufacturing defects',
                                'Physical damage upon arrival',
                                'Unused condition with original tags',
                            ],
                        ],
                        [
                            'title' => 'Cancellation Policy',
                            'icon' => 'event_busy',
                            'content' => 'Orders can be cancelled within 24 hours of placement. Please note that cancellations are not permitted once the product has been dispatched.',
                        ],
                    ],
                    'refund_timelines' => [
                        [
                            'method' => 'Digital Wallets',
                            'time' => '1-3 Business Days',
                            'details' => 'Refunded to original wallet used for payment',
                        ],
                        [
                            'method' => 'Bank Transfer',
                            'time' => '7-10 Business Days',
                            'details' => 'Processed after product receipt and inspection',
                        ],
                        [
                            'method' => 'Credit/Debit Cards',
                            'time' => '5-7 Business Days',
                            'details' => 'Depends on your bank\'s processing cycle',
                        ],
                    ],
                ],
                'last_updated_at' => $page?->last_updated_at?->format('F Y') ?? now()->format('F Y'),
            ];

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Refund Policy not found',
                'error' => $e->getMessage(),
            ], 404);
        }
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
            $about = Aboutus::active()->first();
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
                        'introduction' => 'Welcome to Samar Silk Palace, where tradition meets elegance. Since 1985, we have been dedicated to preserving the rich heritage of Banarasi handloom weaving, bringing the finest silk creations to connoisseurs worldwide.',
                        'sections' => [
                            [
                                'title' => 'Our Legacy',
                                'icon' => 'history',
                                'content' => 'Founded by Mr. Samar, our journey began with a single loom and a vision to showcase the unparalleled artistry of Varanasi\'s weavers. Over four decades, we have grown from a local workshop into a global ambassador of Indian luxury.',
                            ],
                            [
                                'title' => 'Authentic Handloom',
                                'icon' => 'stars',
                                'items' => [
                                    'Pure Katan Silk Sarees',
                                    'Hand-woven Banarasi Suits',
                                    'Traditional Zari Work',
                                    'Exclusive Bridal Collection',
                                    'Custom Tailored Silks',
                                ],
                            ],
                            [
                                'title' => 'Empowering Artisans',
                                'icon' => 'groups',
                                'content' => 'We proudly support over 200 artisan families across Varanasi. Our commitment to sustainable practices ensures that each purchase contributes directly to the livelihood of these master weavers.',
                            ],
                            [
                                'title' => 'Our Values',
                                'icon' => 'verified',
                                'items' => [
                                    '100% Purity Guarantee',
                                    'Ethical Sourcing',
                                    'Direct Manufacturer Prices',
                                    'Preserving Heritage Art',
                                ],
                            ],
                            [
                                'title' => 'Visit Our Showroom',
                                'icon' => 'location_on',
                                'items' => [
                                    'Address: CK 10/44, Brahmanand Chauraha, Chowk, Varanasi - 221001',
                                    'GSTIN: '.($about->gst_no ?? '09AAKCS1234F1Z1'),
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
