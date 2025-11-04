<?php

namespace App\Http\Controllers;

use App\Models\Page;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class PageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $pages = Page::latest()->paginate(15);

        return Inertia::render('Admin/Pages/Index', [
            'pages' => $pages
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $pageTypes = [
            ['value' => 'policy', 'label' => 'Policy'],
            ['value' => 'page', 'label' => 'Page'],
            ['value' => 'faq', 'label' => 'FAQ'],
            ['value' => 'settings', 'label' => 'Settings'],
        ];

        return Inertia::render('Admin/Pages/Create', [
            'pageTypes' => $pageTypes
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:pages,slug',
            'type' => 'required|in:policy,page,faq,settings',
            'content' => 'nullable|string',
            'metadata' => 'nullable|json',
            'is_active' => 'boolean',
        ]);

        // Generate slug from title if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        } else {
            $validated['slug'] = Str::slug($validated['slug']);
        }

        // Make slug unique
        $originalSlug = $validated['slug'];
        $count = 1;
        while (Page::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $originalSlug . '-' . $count;
            $count++;
        }

        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['last_updated_at'] = now();

        // Parse metadata JSON if provided as string
        if (isset($validated['metadata']) && is_string($validated['metadata'])) {
            $validated['metadata'] = json_decode($validated['metadata'], true);
        }

        Page::create($validated);

        return redirect()->route('pages.index')->with('success', 'Page created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $page = Page::findOrFail($id);

        return Inertia::render('Admin/Pages/Show', [
            'page' => $page
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $page = Page::findOrFail($id);

        $pageTypes = [
            ['value' => 'policy', 'label' => 'Policy'],
            ['value' => 'page', 'label' => 'Page'],
            ['value' => 'faq', 'label' => 'FAQ'],
            ['value' => 'settings', 'label' => 'Settings'],
        ];

        return Inertia::render('Admin/Pages/Edit', [
            'page' => $page,
            'pageTypes' => $pageTypes
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $page = Page::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:pages,slug,' . $id,
            'type' => 'required|in:policy,page,faq,settings',
            'content' => 'nullable|string',
            'metadata' => 'nullable|json',
            'is_active' => 'boolean',
        ]);

        // Generate slug if changed
        if (isset($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['slug']);

            // Make slug unique (excluding current page)
            $originalSlug = $validated['slug'];
            $count = 1;
            while (Page::where('slug', $validated['slug'])->where('id', '!=', $id)->exists()) {
                $validated['slug'] = $originalSlug . '-' . $count;
                $count++;
            }
        }

        $validated['last_updated_at'] = now();

        // Parse metadata JSON if provided as string
        if (isset($validated['metadata']) && is_string($validated['metadata'])) {
            $validated['metadata'] = json_decode($validated['metadata'], true);
        }

        $page->update($validated);

        return redirect()->route('pages.index')->with('success', 'Page updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $page = Page::findOrFail($id);
        $page->delete();

        return redirect()->route('pages.index')->with('success', 'Page deleted successfully.');
    }
}
