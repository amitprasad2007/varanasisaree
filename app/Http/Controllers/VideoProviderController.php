<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductVideo;
use App\Models\VideoProvider;
use App\Http\Requests\StoreVideoProviderRequest;
use App\Http\Requests\UpdateVideoProviderRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class VideoProviderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $providers = VideoProvider::orderBy('name')->get();
        
        return Inertia::render('Admin/VideoProviders/Index', [
            'providers' => $providers
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/VideoProviders/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreVideoProviderRequest $request)
    {
        $validated = $request->validated();

        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('providers', 'public');
            $validated['logo'] = $logoPath;
        }

        VideoProvider::create($validated);

        return redirect()->route('video-providers.index')
            ->with('success', 'Video provider created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(VideoProvider $videoProvider)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(VideoProvider $videoProvider)
    {
        return Inertia::render('Admin/VideoProviders/Edit', [
            'provider' => $videoProvider
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateVideoProviderRequest $request, VideoProvider $videoProvider)
    {
        $validated = $request->validate();

        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($videoProvider->logo) {
                Storage::disk('public')->delete($videoProvider->logo);
            }
            
            $logoPath = $request->file('logo')->store('providers', 'public');
            $validated['logo'] = $logoPath;
        }

        $videoProvider->update($validated);

        return redirect()->route('video-providers.index')
            ->with('success', 'Video provider updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(VideoProvider $videoProvider)
    {
        // Check if provider has videos
        if ($videoProvider->videos()->count() > 0) {
            return redirect()->route('video-providers.index')
                ->with('error', 'Cannot delete provider as it has videos associated with it.');
        }

        // Delete logo if exists
        if ($videoProvider->logo) {
            Storage::disk('public')->delete($videoProvider->logo);
        }

        $videoProvider->delete();

        return redirect()->route('video-providers.index')
            ->with('success', 'Video provider deleted successfully.');
    }
}
