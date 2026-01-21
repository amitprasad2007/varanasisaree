<?php

namespace Database\Seeders;

use App\Models\VendorMenuItem;
use Illuminate\Database\Seeder;

class VendorMenuItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing items to avoid duplicates if re-run
        VendorMenuItem::truncate();

        $menus = [
            'Overview' => [
                ['label' => 'Dashboard', 'path' => '/dashboard', 'icon' => 'Home'],
            ],
            'Catalog' => [
                ['label' => 'Products', 'path' => '/vendor/products', 'icon' => 'Barcode'],
            ],
            'Sales & Orders' => [
                ['label' => 'Orders', 'path' => '/vendor/orders', 'icon' => 'ShoppingCart'],
                ['label' => 'Sales', 'path' => '/vendor/sales', 'icon' => 'TrendingUp'],
                ['label' => 'Returns & Refunds', 'path' => '/vendor/refunds', 'icon' => 'Undo2'],
            ],
            'Analytics' => [
                ['label' => 'Analytics', 'path' => '/vendor/analytics', 'icon' => 'FileChartColumn'],
            ],
            'Account' => [
                [
                    'label' => 'Settings',
                    'path' => '/vendor/settings',
                    'icon' => 'Settings',
                    'subItems' => [
                        ['label' => 'Profile', 'path' => '/vendor/profile', 'icon' => 'User'],
                    ]
                ],
                ['label' => 'Logout', 'path' => '/logout', 'icon' => 'LogOutIcon', 'is_logout' => true],
            ],
        ];

        foreach ($menus as $section => $items) {
            foreach ($items as $index => $item) {
                $parent = VendorMenuItem::create([
                    'label' => $item['label'],
                    'path' => $item['path'],
                    'icon' => $item['icon'],
                    'section' => $section,
                    'order' => $index,
                    'is_logout' => $item['is_logout'] ?? false,
                ]);

                if (isset($item['subItems'])) {
                    foreach ($item['subItems'] as $subIndex => $subItem) {
                        VendorMenuItem::create([
                            'label' => $subItem['label'],
                            'path' => $subItem['path'],
                            'icon' => $subItem['icon'],
                            'section' => $section,
                            'parent_id' => $parent->id,
                            'order' => $subIndex,
                        ]);
                    }
                }
            }
        }
    }
}
