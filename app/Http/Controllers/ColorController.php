<?php

namespace App\Http\Controllers;

use App\Models\Color;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ColorController extends Controller
{
    public function index()
    {
        $colors = Color::orderBy('created_at', 'desc')->get();
        
        return Inertia::render('Admin/Colors/Index', [
            'colors' => $colors
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Colors/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'hex_code' => 'required|string|max:10',
            'status' => 'required|in:active,inactive',
        ]);

        Color::create($request->all());

        return redirect()->route('colors.index')->with('success', 'Color created successfully.');
    }

    public function edit(Color $color)
    {
        return Inertia::render('Admin/Colors/Edit', [
            'color' => $color
        ]);
    }

    public function update(Request $request, Color $color)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'hex_code' => 'nullable|string|max:7',
            'status' => 'required|in:active,inactive',
        ]);

        $color->update($request->all());

        return redirect()->route('colors.index')->with('success', 'Color updated successfully.');
    }

    public function destroy(Color $color)
    {
        $color->delete();
        return redirect()->route('colors.index')->with('success', 'Color deleted successfully.');
    }

    public function apiIndex()
    {
        return Color::where('status', 'active')->get();
    }
}
