<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BackendAiAssistantController extends Controller
{
    protected $aiService;

    public function __construct(AiService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * Backend Technical Assistant Chat
     */
    public function chat(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'message' => 'required|string',
            'history' => 'nullable|array',
            'image' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $result = $this->aiService->chatWithBackendAssistant(
            $request->message,
            $request->history ?? [],
            $request->image
        );

        return response()->json($result);
    }

    /**
     * Generate an image using AI
     */
    public function generateImage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'prompt' => 'required|string|max:1000',
            'aspect_ratio' => 'nullable|string|in:1:1,2:3,3:2,3:4,4:3,9:16,16:9,21:9'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $result = $this->aiService->generateProductImage(
            $request->prompt,
            $request->aspect_ratio ?? '1:1'
        );

        return response()->json($result);
    }
}
