<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductVideo;
use App\Models\VideoProvider;
use Illuminate\Http\Request;
use App\Http\Requests\StoreVideoProviderRequest;
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
     //   dd($request);
        $validated = $request->validated();

        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('providers', 'public');
            $validated['logo'] = $logoPath;
        }
        $validated['status'] = $validated['status'] ? 'active' : 'inactive';
        VideoProvider::create($validated);

        return redirect()->route('video-providers.index');
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
    public function update(Request $request, VideoProvider $video_provider)
    {

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:video_providers,name,' . $video_provider->id,
            'base_url' => 'required|string|max:255',
            'logo' => 'nullable|image|max:1024',
            'status' => 'required|in:active,inactive',
        ]);

        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($video_provider->logo) {
                Storage::disk('public')->delete($video_provider->logo);
            }
            $logoPath = $request->file('logo')->store('providers', 'public');
            $validated['logo'] = $logoPath;
        }

        $video_provider->update($validated);

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
