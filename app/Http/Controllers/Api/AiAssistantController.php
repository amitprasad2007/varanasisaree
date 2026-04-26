<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\AiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AiAssistantController extends Controller
{
    protected $aiService;

    public function __construct(AiService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * AI Shopping Assistant / Customer Support Chat
     */
    public function chat(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'message' => 'required|string',
            'history' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $result = $this->aiService->chatWithAssistant(
            $request->message,
            $request->history ?? []
        );

        return response()->json($result);
    }

    /**
     * AI Saree Recommendations
     */
    public function recommendations(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'preferences' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $preferences = $request->input('preferences');

        // Step 1: Ask AI to extract structured search criteria
        $criteria = $this->aiService->extractSearchCriteria($preferences);

        // Step 2: If AI needs clarification, return a follow-up question
        if (! empty($criteria['follow_up_question'])) {
            return response()->json([
                'follow_up_question' => $criteria['follow_up_question'],
                'recommendations' => "I'd love to help you find the perfect saree! ".$criteria['follow_up_question'],
                'matched_count' => 0,
            ]);
        }

        // Step 3: Build dynamic query from AI-extracted criteria
        $query = Product::query()
            ->with(['category', 'imageproducts'])
            ->where('status', 'active');

        // Keyword search across name and description
        $keywords = $criteria['keywords'] ?? [];
        if (count($keywords) > 0) {
            $query->where(function ($q) use ($keywords) {
                foreach ($keywords as $keyword) {
                    $q->orWhere('name', 'LIKE', "%{$keyword}%")
                        ->orWhere('description', 'LIKE', "%{$keyword}%")
                        ->orWhere('fabric', 'LIKE', "%{$keyword}%")
                        ->orWhere('color', 'LIKE', "%{$keyword}%")
                        ->orWhere('occasion', 'LIKE', "%{$keyword}%")
                        ->orWhere('work_type', 'LIKE', "%{$keyword}%");
                }
            });
        }

        // Price filters from explicit range or budget tier
        $minPrice = $criteria['min_price'];
        $maxPrice = $criteria['max_price'];

        if ($criteria['budget_tier'] === 'budget' && $maxPrice === null) {
            $maxPrice = 5000;
        } elseif ($criteria['budget_tier'] === 'premium' && $minPrice === null) {
            $minPrice = 5000;
        }

        if ($minPrice !== null) {
            $query->where('price', '>=', $minPrice);
        }
        if ($maxPrice !== null) {
            $query->where('price', '<=', $maxPrice);
        }

        $products = $query->limit(15)->get();

        // Step 4: Fallback to bestsellers / top-rated / newest if no matches
        $isFallback = false;
        if ($products->isEmpty()) {
            $products = $this->aiService->buildFallbackProducts(10);
            $isFallback = true;
        }

        // Step 5: Let AI create personalized recommendations from the result set
        $recommendations = $this->aiService->getSareeRecommendations(
            $preferences,
            $products,
            $isFallback
        );

        return response()->json([
            'recommendations' => $recommendations,
            'matched_count' => $products->count(),
            'is_fallback' => $isFallback,
        ]);
    }

    /**
     * AI Product Description Generator (Admin/Internal)
     */
    public function generateDescription(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_name' => 'required|string',
            'attributes' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $description = $this->aiService->generateProductDescription(
            $request->product_name,
            $request->input('attributes')
        );

        return response()->json([
            'description' => $description,
        ]);
    }

    /**
     * AI Product Image Generator
     */
    public function generateImage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'prompt' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $result = $this->aiService->generateProductImage($request->prompt);

        return response()->json($result);
    }
}
