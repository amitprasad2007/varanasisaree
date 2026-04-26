<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use Illuminate\Http\JsonResponse;

class FaqController extends Controller
{
    /**
     * Display a listing of active FAQs
     *
     * @return JsonResponse
     */
    public function index()
    {
        try {
            $faqs = Faq::where('status', 'active')
                ->orderBy('order', 'asc')
                ->get()
                ->map(function ($faq) {
                    return [
                        'id' => $faq->id,
                        'question' => $faq->question,
                        'answer' => $faq->answer,
                        'order' => $faq->order,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $faqs,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch FAQs',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get FAQs by category (if needed later)
     *
     * @return JsonResponse
     */
    public function byCategory(string $category)
    {
        try {
            $faqs = Faq::where('status', 'active')
                ->where('category', $category)
                ->orderBy('order', 'asc')
                ->get()
                ->map(function ($faq) {
                    return [
                        'id' => $faq->id,
                        'question' => $faq->question,
                        'answer' => $faq->answer,
                        'order' => $faq->order,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $faqs,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch FAQs',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
