<?php

namespace App\Http\Controllers;

use App\Models\VendorMenuItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VendorMenuController extends Controller
{
    public function index()
    {
        // Fetch items ordered by order
        $sections = \App\Models\VendorMenuSection::with(['vendormenuitems' => function($q) {
                $q->whereNull('parent_id')->with('children')->orderBy('order');
            }])
            ->orderBy('order')
            ->get();

        // Transform for frontend: Dictionary by Section Name
        $menus = [];
        foreach ($sections as $section) {
            $menus[$section->name] = $section->vendormenuitems;
        }

        return Inertia::render('Admin/VendorMenus/Index', [
            'menus' => $menus,
            'sections' => $sections->pluck('name'), // Send list of section names for dropdown
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'label' => 'required|string|max:255',
            'path' => 'required|string|max:255',
            'icon' => 'nullable|string|max:255',
            'section' => 'required|string|exists:vendor_menu_sections,name', // Input is section NAME
            'parent_id' => 'nullable|exists:vendor_menu_items,id',
            'order' => 'nullable|integer',
            'is_logout' => 'boolean',
        ]);

        // Resolve Section ID
        $section = \App\Models\VendorMenuSection::where('name', $validated['section'])->firstOrFail();
        $validated['vendor_menu_section_id'] = $section->id;
        unset($validated['section']);

        if (!isset($validated['order'])) {
             $validated['order'] = VendorMenuItem::where('vendor_menu_section_id', $section->id)
                ->where('parent_id', $validated['parent_id'])
                ->max('order') + 1;
        }

        VendorMenuItem::create($validated);

        return redirect()->back()->with('success', 'Menu item created successfully.');
    }

    public function update(Request $request, VendorMenuItem $vendorMenu)
    {
        $validated = $request->validate([
            'label' => 'required|string|max:255',
            'path' => 'required|string|max:255',
            'icon' => 'nullable|string|max:255',
            'section' => 'required|string|exists:vendor_menu_sections,name',
            'parent_id' => 'nullable|exists:vendor_menu_items,id',
            'order' => 'nullable|integer',
            'is_logout' => 'boolean',
        ]);

        $section = \App\Models\VendorMenuSection::where('name', $validated['section'])->firstOrFail();
        $validated['vendor_menu_section_id'] = $section->id;
        unset($validated['section']);

        $vendorMenu->update($validated);

        return redirect()->back()->with('success', 'Menu item updated successfully.');
    }

    public function destroy(VendorMenuItem $vendorMenu)
    {
        $vendorMenu->delete();
        return redirect()->back()->with('success', 'Menu item deleted successfully.');
    }
}
