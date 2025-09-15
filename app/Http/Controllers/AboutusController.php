<?php

namespace App\Http\Controllers;

use App\Models\Aboutus;
use App\Http\Requests\StoreAboutusRequest;
use App\Http\Requests\UpdateAboutusRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AboutusController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $aboutUs = Aboutus::with('sections')->orderBy('id', 'desc')->get();
        //dd($aboutUs);
        return Inertia::render('Admin/Aboutus/Index', [
            'aboutus' => $aboutUs,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Aboutus/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAboutusRequest $request)
    {
        $validated = $request->validated();
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('aboutus', 'public');
        }
        $about = Aboutus::create([
            'page_title' => $validated['page_title'],
            'description' => $validated['description'] ?? null,
            'image' => $imagePath,
            'status' => $validated['status'],
        ]);
        return redirect()->route('aboutus.index')->with('success', 'About Us created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Aboutus $aboutus)
    {
        return Inertia::render('Admin/Aboutus/Show', [
            'aboutus' => $aboutus->load('sections'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Aboutus $aboutus)
    {
        return Inertia::render('Admin/Aboutus/Edit', [
            'aboutus' => $aboutus,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAboutusRequest $request, Aboutus $aboutus)
    {
        $validated = $request->validated();
        $data = [
            'page_title' => $validated['page_title'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'],
        ];
        if ($request->hasFile('image')) {
            if ($aboutus->image) {
                Storage::disk('public')->delete($aboutus->image);
            }
            $data['image'] = $request->file('image')->store('aboutus', 'public');
        }
        $aboutus->update($data);
        return redirect()->route('aboutus.index')->with('success', 'About Us updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Aboutus $aboutus)
    {
       // dd($aboutus->page_title);
        if ($aboutus->image) {
            Storage::disk('public')->delete($aboutus->image);
        }
        $aboutus->delete();
        return redirect()->route('aboutus.index')->with('success', 'About Us deleted successfully.');
    }
}
