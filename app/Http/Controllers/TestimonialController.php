<?php

namespace App\Http\Controllers;

use App\Models\Testimonial;
use App\Http\Requests\StoreTestimonialRequest;
use App\Http\Requests\UpdateTestimonialRequest;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Http\Request;

class TestimonialController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $testimonials = Testimonial::with('user')
        ->latest()
        ->get();    
        return Inertia::render('Admin/Testimonials/Index', [
            'testimonials' => $testimonials,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Testimonials/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTestimonialRequest $request)
    {
        $validated = $request->validated();
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('testimonials', 'public');
            $validated['photo'] = $path;
        }     
        
        Testimonial::create($validated);

        return redirect()->route('testimonials.index')
            ->with('success', 'Testimonial created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Testimonial $testimonial)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Testimonial $testimonial)
    {
        return Inertia::render('Admin/Testimonials/Edit', [
            'testimonial' => $testimonial,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTestimonialRequest $request, Testimonial $testimonial)
    {
        $validated = $request->validated();
        if ($request->hasFile('photo')) {
            if ($testimonial->photo) {
                Storage::disk('public')->delete($testimonial->photo);
            }
            $path = $request->file('photo')->store('testimonials', 'public');
            $validated['photo'] = $path;
        }

        $validated['is_approved'] = $validated['status'] === 'approved';
        
        $testimonial->update($validated);

        return redirect()->route('testimonials.index')
            ->with('success', 'Testimonial updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Testimonial $testimonial)
    {
        // Delete photo if exists
        if ($testimonial->photo) {
            Storage::disk('public')->delete($testimonial->photo);
        }
        
        $testimonial->delete();

        return redirect()->route('testimonials.index')
            ->with('success', 'Testimonial deleted successfully.');
    }

     /**
     * Update the status of the testimonial
     */

    public function updateStatus(Request $request, Testimonial $testimonial)
    {
        $request->validate([
            'status' => 'required|in:active,inactive',
        ]);

        $testimonial->update([
            'status' => $request->status,
        ]);

        return redirect()->back()
            ->with('success', 'Testimonial status updated successfully.');
    }
    

    /**
     * Update the approval status of the testimonial
     */
    public function updateApprovalStatus(Request $request, Testimonial $testimonial)
    {
        $request->validate([
            'approval_status' => 'required|in:pending,approved,rejected',
        ]);

        $testimonial->update([
            'approval_status' => $request->approval_status,
        ]);

        return redirect()->back()
            ->with('success', 'Testimonial approval status updated successfully.');
    }

    /**
     * API endpoint to get active and approved testimonials
     */
    public function apiGetTestimonials(Request $request)
    {
        $language = $request->input('lang', 'en');
        
        $testimonials = Testimonial::where('approval_status', 'approved')
            ->where('status', 'active')
            ->latest()
            ->get()
            ->map(function ($testimonial) use ($language) {
                return [
                    'id' => $testimonial->id,
                    'name' => $testimonial->name,
                    'designation' => $testimonial->designation,
                    'company' => $testimonial->company,
                    'photo' => $testimonial->photo ? asset('storage/' . $testimonial->photo) : null,
                    'testimonial' => $testimonial->testimonial,
                    'rating' => $testimonial->rating,
                ];
            });

        return response()->json($testimonials);
    }

    
}
