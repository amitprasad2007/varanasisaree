<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Aboutus;

class AboutusController extends Controller
{
    public function show()
    {
        $about = Aboutus::with(['sections' => function ($query) {
            $query->orderBy('order');
        }])->active()->first();

        if (!$about) {
            return response()->json(['message' => 'About Us not found'], 404);
        }

        $formatted = [
            'id' => $about->id,
            'page_title' => $about->page_title,
            'description' => $about->description,
            'image' => $about->image ? asset('storage/' . $about->image) : null,
            'status' => $about->status,
            'sections' => $about->sections->map(function ($section) use ($about) {
                $sectionData = [
                    'id' => $section->id,
                    'aboutus_id' => $about->id,
                    'section_title' => $section->section_title,
                    'order' => $section->order,
                    'status' => $section->status,
                ];

                if (!empty($section->image)) {
                    $sectionData['image'] = asset('storage/' . $section->image);
                }

                $sectionData['section_content'] = $section->section_content ?? [];

                return $sectionData;
            })->toArray(),
        ];

        return response()->json($formatted);
    }
}


