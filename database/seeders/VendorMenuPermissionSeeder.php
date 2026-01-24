<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\VendorMenuSection;
use App\Models\VendorMenuItem;
use App\Models\Vendor;

class VendorMenuPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Ensure Sections Exist
        $sections = [
            ['name' => 'Overview', 'slug' => 'overview', 'order' => 1],
            ['name' => 'Catalog', 'slug' => 'catalog', 'order' => 2],
            ['name' => 'Sales & Orders', 'slug' => 'sales-orders', 'order' => 3],
            ['name' => 'Analytics', 'slug' => 'analytics', 'order' => 4],
            ['name' => 'Account', 'slug' => 'account', 'order' => 5],
        ];

        foreach ($sections as $s) {
            VendorMenuSection::firstOrCreate(
                ['slug' => $s['slug']],
                ['name' => $s['name'], 'order' => $s['order']]
            );
        }

        // 2. Map Items to Sections (Heuristic mapping based on common names)
        // If items were seeded with old 'section' string, we can't access it if column removed.
        // We will match by Label/Path groups.
        
        $mapping = [
            'Dashboard' => 'overview',
            'Products' => 'catalog',
            'Orders' => 'sales-orders',
            'Sales' => 'sales-orders',
            'Returns & Refunds' => 'sales-orders',
            'Analytics' => 'analytics',
            'Settings' => 'account',
            'Logout' => 'account',
        ];

        $items = VendorMenuItem::all();
        foreach ($items as $item) {
            // Find appropriate section
            $slug = 'overview'; // Default
            foreach ($mapping as $key => $sectSlug) {
                if (str_contains($item->label, $key) || ($item->parent && str_contains($item->parent->label, $key))) {
                    $slug = $sectSlug;
                    break;
                }
            }
            
            $section = VendorMenuSection::where('slug', $slug)->first();
            if ($section) {
                $item->vendor_menu_section_id = $section->id;
                $item->save();
            }
        }

        // 3. Assign All Items to All Existing Vendors (Default Permission)
        $vendors = Vendor::all();
        $allItemIds = VendorMenuItem::pluck('id');

        foreach ($vendors as $vendor) {
            $vendor->accessibleMenuItems()->syncWithoutDetaching($allItemIds);
        }
    }
}
