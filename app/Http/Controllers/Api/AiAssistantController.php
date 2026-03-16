<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AiService;
use App\Models\Product;
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
            'history' => 'nullable|array'
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
            'preferences' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Fetch some products to ground the recommendations
        $products = Product::with('category')->limit(20)->get();

        $recommendations = $this->aiService->getSareeRecommendations(
            $request->preferences,
            $products
        );

        return response()->json([
            'recommendations' => $recommendations
        ]);
    }

    /**
     * AI Product Description Generator (Admin/Internal)
     */
    public function generateDescription(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_name' => 'required|string',
            'attributes' => 'required|array'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $description = $this->aiService->generateProductDescription(
            $request->product_name,
            $request->attributes
        );

        return response()->json([
            'description' => $description
        ]);
    }

    /**
     * AI Product Image Generator
     */
    public function generateImage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'prompt' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $result = $this->aiService->generateProductImage($request->prompt);

        return response()->json($result);
    }
}
