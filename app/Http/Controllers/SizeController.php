<?php

namespace App\Http\Controllers;

use App\Models\Size;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SizeController extends Controller
{
    public function index()
    {
        $sizes = Size::orderBy('created_at', 'desc')->get();

        return Inertia::render('Admin/Sizes/Index', [
            'sizes' => $sizes,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Sizes/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:10',
            'status' => 'required|in:active,inactive',
        ]);

        Size::create($validated);

        return redirect()->route('sizes.index')->with('success', 'Size created successfully.');
    }

    public function edit(Size $size)
    {
        return Inertia::render('Admin/Sizes/Edit', [
            'size' => $size,
        ]);
    }

    public function update(Request $request, Size $size)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:10',
            'status' => 'required|in:active,inactive',
        ]);

        $size->update($validated);

        return redirect()->route('sizes.index')->with('success', 'Size updated successfully.');
    }

    public function destroy(Size $size)
    {
        $size->delete();

        return redirect()->route('sizes.index')->with('success', 'Size deleted successfully.');
    }

    public function apiIndex()
    {
        return Size::where('status', 'active')->get();
    }
}
