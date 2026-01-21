<?php

namespace App\Http\Controllers;

use App\Models\VendorMenuItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VendorMenuController extends Controller
{
    public function index()
    {
        $items = VendorMenuItem::whereNull('parent_id')
            ->with('children')
            ->orderBy('order')
            ->get()
            ->groupBy('section');

        // Inertia response
        return Inertia::render('Admin/VendorMenus/Index', [
            'menus' => $items,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'label' => 'required|string|max:255',
            'path' => 'required|string|max:255',
            'icon' => 'nullable|string|max:255',
            'section' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:vendor_menu_items,id',
            'order' => 'nullable|integer',
            'is_logout' => 'boolean',
        ]);

        if (!isset($validated['order'])) {
             $validated['order'] = VendorMenuItem::where('section', $validated['section'])
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
            'section' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:vendor_menu_items,id',
            'order' => 'nullable|integer',
            'is_logout' => 'boolean',
        ]);

        $vendorMenu->update($validated);

        return redirect()->back()->with('success', 'Menu item updated successfully.');
    }

    public function destroy(VendorMenuItem $vendorMenu)
    {
        $vendorMenu->delete();
        return redirect()->back()->with('success', 'Menu item deleted successfully.');
    }
}
