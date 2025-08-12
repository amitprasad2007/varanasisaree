<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAboutusSectionRequest;
use App\Http\Requests\UpdateAboutusSectionRequest;
use App\Models\AboutUsSection;
use App\Models\Aboutus;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AboutusSectionController extends Controller
{
    public function index(Aboutus $aboutus)
    {
        $sections = $aboutus->sections()->orderBy('order')->get();
        return Inertia::render('Admin/Aboutus/Sections/Index', [
            'aboutus' => $aboutus,
            'sections' => $sections,
        ]);
    }

    public function create(Aboutus $aboutus)
    {
        return Inertia::render('Admin/Aboutus/Sections/Create', [
            'aboutus' => $aboutus,
        ]);
    }

    public function store(StoreAboutusSectionRequest $request)
    {
        $validated = $request->validated();
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('aboutus-sections', 'public');
        }
        AboutUsSection::create([
            'aboutus_id' => $validated['aboutus_id'],
            'section_title' => $validated['section_title'],
            'section_content' => $validated['section_content'],
            'image' => $imagePath,
            'order' => $validated['order'] ?? 0,
            'status' => $validated['status'],
        ]);
        return redirect()->route('aboutus.sections.index', $validated['aboutus_id'])
            ->with('success', 'Section created successfully.');
    }

    public function edit(Aboutus $aboutus, AboutUsSection $section)
    {
        return Inertia::render('Admin/Aboutus/Sections/Edit', [
            'aboutus' => $aboutus,
            'section' => $section,
        ]);
    }

    public function update(UpdateAboutusSectionRequest $request, Aboutus $aboutus, AboutUsSection $section)
    {
        $validated = $request->validated();
        $data = [
            'section_title' => $validated['section_title'],
            'section_content' => $validated['section_content'],
            'order' => $validated['order'] ?? $section->order,
            'status' => $validated['status'],
        ];
        if ($request->hasFile('image')) {
            if ($section->image) {
                Storage::disk('public')->delete($section->image);
            }
            $data['image'] = $request->file('image')->store('aboutus-sections', 'public');
        }
        $section->update($data);
        return redirect()->route('aboutus.sections.index', $aboutus->id)
            ->with('success', 'Section updated successfully.');
    }

    public function destroy(Aboutus $aboutus, AboutUsSection $section)
    {
        if ($section->image) {
            Storage::disk('public')->delete($section->image);
        }
        $section->delete();
        return redirect()->route('aboutus.sections.index', $aboutus->id)
            ->with('success', 'Section deleted successfully.');
    }
}


