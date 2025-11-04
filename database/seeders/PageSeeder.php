<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class PageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $lastUpdated = Carbon::parse('2024-12-01');

        // Privacy Policy
        Page::create([
            'title' => 'Privacy Policy',
            'slug' => 'privacy-policy',
            'type' => 'policy',
            'content' => null,
            'metadata' => [
                'introduction' => 'At Samar Silk Palace, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data.',
                'sections' => [
                    [
                        'title' => 'Information We Collect',
                        'items' => [
                            'Personal identification information (Name, email address, phone number)',
                            'Shipping and billing addresses',
                            'Payment information (processed securely through our payment partners)',
                            'Browsing behavior and purchase history'
                        ]
                    ],
                    [
                        'title' => 'How We Use Your Information',
                        'items' => [
                            'Process and fulfill your orders',
                            'Communicate with you about your purchases',
                            'Send promotional emails (with your consent)',
                            'Improve our website and services',
                            'Prevent fraud and enhance security'
                        ]
                    ],
                    [
                        'title' => 'Information Sharing',
                        'items' => [
                            'We do not sell your personal information to third parties',
                            'We may share information with trusted service providers',
                            'We may disclose information when required by law'
                        ]
                    ],
                    [
                        'title' => 'Your Rights',
                        'items' => [
                            'Access and update your personal information',
                            'Request deletion of your data',
                            'Opt-out of marketing communications',
                            'Request a copy of your data'
                        ]
                    ]
                ]
            ],
            'is_active' => true,
            'last_updated_at' => $lastUpdated,
        ]);

        // Terms and Conditions
        Page::create([
            'title' => 'Terms and Conditions',
            'slug' => 'terms-conditions',
            'type' => 'policy',
            'content' => null,
            'metadata' => [
                'introduction' => 'Welcome to Samar Silk Palace. By accessing and using our website, you agree to comply with and be bound by the following terms and conditions.',
                'sections' => [
                    [
                        'title' => 'Acceptance of Terms',
                        'content' => 'By using our website and services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions, as well as our Privacy Policy.'
                    ],
                    [
                        'title' => 'Product Information',
                        'items' => [
                            'All products are handcrafted and may have slight variations',
                            'Colors may appear differently due to screen settings',
                            'Product descriptions are as accurate as possible'
                        ]
                    ],
                    [
                        'title' => 'Payment Terms',
                        'items' => [
                            'All prices are in Indian Rupees (INR)',
                            'Payment must be received before order shipment',
                            'We accept various payment methods including credit/debit cards, UPI, and net banking',
                            'All transactions are secure and encrypted'
                        ]
                    ],
                    [
                        'title' => 'User Conduct',
                        'content' => 'You agree not to:',
                        'items' => [
                            'Use the website for any unlawful purpose',
                            'Attempt to gain unauthorized access to our systems',
                            'Interfere with the proper functioning of the website',
                            'Post or transmit any harmful or offensive content'
                        ]
                    ],
                    [
                        'title' => 'Intellectual Property',
                        'content' => 'All content on this website, including text, images, logos, and designs, is the property of Samar Silk Palace and protected by copyright laws.'
                    ]
                ]
            ],
            'is_active' => true,
            'last_updated_at' => $lastUpdated,
        ]);

        // Shipping and Delivery Policy
        Page::create([
            'title' => 'Shipping & Delivery',
            'slug' => 'shipping-delivery',
            'type' => 'policy',
            'content' => null,
            'metadata' => [
                'introduction' => 'We strive to deliver your orders in the most efficient and secure manner. Please review our shipping and delivery policies below.',
                'shipping_methods' => [
                    [
                        'name' => 'Standard Delivery',
                        'price' => '₹99',
                        'time' => '5-7 business days',
                        'details' => 'Available for all locations across India'
                    ],
                    [
                        'name' => 'Express Delivery',
                        'price' => '₹199',
                        'time' => '3-4 business days',
                        'details' => 'Available for major metro cities'
                    ],
                    [
                        'name' => 'Same Day Delivery',
                        'price' => '₹299',
                        'time' => 'Within 24 hours',
                        'details' => 'Available only in Varanasi city limits'
                    ]
                ],
                'delivery_areas' => [
                    [
                        'area' => 'Varanasi & Nearby Cities',
                        'time' => '1-2 business days'
                    ],
                    [
                        'area' => 'Major Metro Cities (Delhi, Mumbai, Bangalore, etc.)',
                        'time' => '3-5 business days'
                    ],
                    [
                        'area' => 'Other Cities & Towns',
                        'time' => '5-7 business days'
                    ],
                    [
                        'area' => 'Remote Areas',
                        'time' => '7-10 business days'
                    ]
                ],
                'tracking' => [
                    'title' => 'Order Tracking',
                    'content' => 'Once your order is shipped, you will receive a tracking number via email and SMS. You can track your order status in real-time through our website or the courier partner\'s website.'
                ],
                'note' => 'Delivery times are estimates and may vary due to factors beyond our control such as weather conditions, courier delays, or public holidays.'
            ],
            'is_active' => true,
            'last_updated_at' => $lastUpdated,
        ]);

        // Cancellation and Refund Policy
        Page::create([
            'title' => 'Cancellation & Refund Policy',
            'slug' => 'cancellation-refund',
            'type' => 'policy',
            'content' => null,
            'metadata' => [
                'introduction' => 'We want you to be completely satisfied with your purchase. Please review our cancellation and refund policies below.',
                'cancellation' => [
                    'title' => 'Order Cancellation',
                    'items' => [
                        'Orders can be cancelled within 24 hours of placement',
                        'Once the order is shipped, cancellation is not possible',
                        'Custom-made or personalized items cannot be cancelled',
                        'To cancel, contact us immediately at samar@samarsilkpalace.com or +91 93056 26874'
                    ]
                ],
                'return_policy' => [
                    'title' => 'Return Policy',
                    'eligible_items' => [
                        'Products with manufacturing defects',
                        'Damaged items received during shipping',
                        'Wrong item delivered',
                        'Unused products with original tags and packaging (within 7 days)'
                    ],
                    'non_eligible_items' => [
                        'Products without original tags and packaging',
                        'Used or washed products',
                        'Products purchased during sale or with special discounts',
                        'Custom-made or altered items',
                        'Products returned after 7 days of delivery'
                    ]
                ],
                'how_to_return' => [
                    'title' => 'How to Initiate a Return',
                    'steps' => [
                        'Contact our customer support within 7 days of receiving the product',
                        'Provide your order number and reason for return',
                        'Our team will verify your request and approve if eligible',
                        'Pack the product securely with all original tags and packaging',
                        'Ship the product to our return address (provided by our team)'
                    ]
                ],
                'refund_process' => [
                    'title' => 'Refund Processing',
                    'content' => 'Once we receive and inspect the returned product, we will process your refund:',
                    'methods' => [
                        [
                            'method' => 'Original Payment Method',
                            'time' => '5-7 business days',
                            'details' => 'For credit/debit card, UPI, net banking payments'
                        ],
                        [
                            'method' => 'Bank Transfer',
                            'time' => '3-5 business days',
                            'details' => 'For cash on delivery orders (requires bank details)'
                        ],
                        [
                            'method' => 'Store Credit',
                            'time' => 'Immediate',
                            'details' => 'Can be used for future purchases'
                        ],
                        [
                            'method' => 'Exchange',
                            'time' => '2-3 business days',
                            'details' => 'Subject to product availability'
                        ]
                    ]
                ],
                'contact' => [
                    'title' => 'Questions About Returns?',
                    'content' => 'If you have any questions about our return and refund policy, please contact us:',
                    'email' => 'samar@samarsilkpalace.com',
                    'phone' => '+91 93056 26874',
                    'hours' => 'Monday - Saturday: 10:00 AM - 6:00 PM IST'
                ]
            ],
            'is_active' => true,
            'last_updated_at' => $lastUpdated,
        ]);

        // Delivery Info Page (for product pages)
        Page::create([
            'title' => 'Delivery Information',
            'slug' => 'delivery-info',
            'type' => 'settings',
            'content' => null,
            'metadata' => [
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
            'is_active' => true,
            'last_updated_at' => $lastUpdated,
        ]);
    }
}
