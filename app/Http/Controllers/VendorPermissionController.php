<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use App\Models\VendorMenuSection;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VendorPermissionController extends Controller
{
    public function edit(Vendor $vendor)
    {
        $sections = VendorMenuSection::with(['vendormenuitems' => function($q) {
                $q->whereNull('parent_id')->with('children')->orderBy('order');
            }])
            ->where('is_active', true)
            ->orderBy('order')
            ->get();
            //dd($sections[0]->vendormenuitems);
        $vendorPermissions = $vendor->accessibleMenuItems()->pluck('vendor_menu_items.id');

        return Inertia::render('Admin/Vendors/Permissions', [
            'vendor' => $vendor,
            'sections' => $sections,
            'permissions' => $vendorPermissions,
        ]);
    }

    public function update(Request $request, Vendor $vendor)
    {
        $request->validate([
            'permissions' => 'array',
            'permissions.*' => 'exists:vendor_menu_items,id',
        ]);

        $vendor->accessibleMenuItems()->sync($request->permissions ?? []);

        return redirect()->back()->with('success', 'Permissions updated successfully.');
    }
}
