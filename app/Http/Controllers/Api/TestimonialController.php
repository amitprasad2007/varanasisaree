<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use Illuminate\Http\Request;

class TestimonialController extends Controller
{
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
            ->map(function ($testimonial) {
                return [
                    'id' => $testimonial->id,
                    'name' => $testimonial->name,
                    'role' => $testimonial->designation,
                    'company' => $testimonial->company,
                    'image' => $testimonial->photo ? asset('storage/'.$testimonial->photo) : null,
                    'text' => $testimonial->testimonial,
                    'rating' => $testimonial->rating,
                ];
            });

        return response()->json($testimonials);
    }
}
