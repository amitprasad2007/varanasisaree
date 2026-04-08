<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Laravel\Ai\Ai;
use Laravel\Ai\Exceptions\ProviderOverloadedException;
use Laravel\Ai\Files\Base64Image;
use Laravel\Ai\Messages\AssistantMessage;
use Laravel\Ai\Messages\UserMessage;

use function Laravel\Ai\agent;

class AiService
{
    /**
     * Generate a professional product description for a saree.
     */
    public function generateProductDescription(string $productName, array $attributes): string
    {
        $attributesStr = implode(', ', array_map(fn ($k, $v) => "$k: $v", array_keys($attributes), $attributes));

        $prompt = "Generate a rich, elegant, and persuasive product description for a saree named '$productName'. 
        The description should highlight the craftmanship, fabric, and traditional value.
        Key attributes: $attributesStr.
        Make it suitable for a high-end Varanasi saree e-commerce website.";

        try {
            return agent()->prompt($prompt)->text;
        } catch (ProviderOverloadedException $e) {
            Log::warning('AI Gemini Overloaded (Description): '.$e->getMessage());

            return 'The AI service is currently busy. Please try again in a few moments.';
        } catch (\Exception $e) {
            Log::error('AI Description Generation Error: '.$e->getMessage());

            return 'Unable to generate description at this time.';
        }
    }

    /**
     * Chat with the AI Shopping Assistant.
     */
    public function chatWithAssistant(string $userMessage, array $history = []): array
    {
        try {
            $inventoryContext = $this->getInventoryContext();
            $systemInstruction = "You are the Samar Silk Palace AI Shopping Assistant. 
            Your goal is to help customers find the perfect sarees from our collection.
            
            GUIDELINES:
            1. Use the provided inventory context to recommend SPECIFIC products.
            2. For each recommendation, PROVIDE:
               - A clickable link in the format: [Product Name](/product/slug)
               - An image if available: ![Product Name](image_url)
            3. If you can't find a specific match, suggest the closest alternatives from the inventory.
            4. Be polite, professional, and knowledgeable about Varanasi sarees.
            5. Present your response in a beautiful Markdown format.
            
            INVENTORY CONTEXT:
            $inventoryContext";

            // Map history to Ai SDK format
            $messages = collect($history)->map(function ($item) {
                return match ($item['role']) {
                    'user' => new UserMessage($item['parts'][0]['text']),
                    'model', 'assistant' => new AssistantMessage($item['parts'][0]['text']),
                    default => new UserMessage($item['parts'][0]['text']),
                };
            })->toArray();

            $response = agent($systemInstruction, $messages)->prompt($userMessage);

            return [
                'response' => $response->text,
                'history' => $this->mapResponseMessages($response->messages->all()),
            ];
        } catch (ProviderOverloadedException $e) {
            Log::warning('AI Gemini Overloaded (Chat): '.$e->getMessage());

            return [
                'response' => 'The AI assistant is currently receiving too much traffic. Please wait a minute and try again.',
                'history' => $history,
            ];
        } catch (\Exception $e) {
            Log::error('AI Chat Error: '.$e->getMessage());

            return [
                'response' => 'Error: '.$e->getMessage(),
                'history' => $history,
            ];
        }
    }

    /**
     * Technical Chat with the Backend AI Assistant.
     */
    public function chatWithBackendAssistant(string $userMessage, array $history = [], ?string $imageBase64 = null): array
    {
        try {
            $systemInstruction = "You are the Samar Silk Palace Backend Technical Assistant.
            Your goal is to help administrators and vendors manage the platform effectively.
            
            KNOWLEDGE BASE:
            1. Models: Knowledge of Product, Category, Brand, Vendor, Order, Customer, Sale, and Refund management.
            2. Features: Manual Product Entry, Bulk Upload (Product/Variant), Image Optimization, Order Tracking, User/Role Management.
            3. Navigation: Guidance on where to find specific sections in the Admin Dashboard sidebar.
            
            GUIDELINES:
            1. Provide clear, actionable advice for STORE ADMINISTRATORS and VENDORS.
            2. FOCUS on UI-based actions (e.g., 'Go to Products > Add New').
            3. DO NOT provide internal technical details like PHP code snippets, specific Controller names, Model code, or internal route definitions unless specifically asked for technical troubleshooting.
            4. If asked about production database changes, always advise caution and backups.
            5. Keep your tone professional, helpful, and focused on business operations.
            
            Your response should be in clean Markdown format.";

            $messages = collect($history)->map(function ($item) {
                return match ($item['role']) {
                    'user' => new UserMessage($item['parts'][0]['text']),
                    'model', 'assistant' => new AssistantMessage($item['parts'][0]['text']),
                    default => new UserMessage($item['parts'][0]['text']),
                };
            })->toArray();

            $attachments = [];

            if ($imageBase64) {
                // Remove the data:image/...;base64, part if present
                $mimeType = 'image/jpeg';
                if (preg_match('/^data:(image\/\w+);base64,/', $imageBase64, $match)) {
                    $mimeType = $match[1];
                    $imageBase64 = substr($imageBase64, strpos($imageBase64, ',') + 1);
                }

                $attachments[] = new Base64Image($imageBase64, $mimeType);
            }

            $response = agent($systemInstruction, $messages)->prompt($userMessage, $attachments);

            return [
                'response' => $response->text,
                'history' => $this->mapResponseMessages($response->messages->all()),
            ];
        } catch (ProviderOverloadedException $e) {
            Log::warning('AI Gemini Overloaded (Backend): '.$e->getMessage());

            return [
                'response' => 'Technical Error: The AI provider is currently overloaded. Please try again in 30-60 seconds.',
                'history' => $history,
            ];
        } catch (\Exception $e) {
            Log::error('AI Backend Chat Error: '.$e->getMessage());

            return [
                'response' => 'Technical Error: '.$e->getMessage(),
                'history' => $history,
            ];
        }
    }

    /**
     * Extract structured search criteria from natural language preferences using AI.
     *
     * @return array{keywords: string[], min_price: ?float, max_price: ?float, budget_tier: ?string, follow_up_question: ?string}
     */
    public function extractSearchCriteria(string $preferences): array
    {
        $defaultCriteria = [
            'keywords' => [],
            'min_price' => null,
            'max_price' => null,
            'budget_tier' => null,
            'follow_up_question' => null,
        ];

        $prompt = <<<PROMPT
        You are a search-criteria extractor for a Varanasi Saree e-commerce store.
        Analyze the customer's message and extract structured search filters.

        CUSTOMER MESSAGE: "$preferences"

        RULES:
        1. Extract keywords that could match product names, descriptions, fabrics (silk, cotton, banarasi, monga, etc.), colors, occasions, or work types.
        2. If the customer mentions "budget" or "affordable" WITHOUT specifying a price, set budget_tier to "budget" (under ₹5000) AND generate a follow_up_question asking for their specific range (e.g., "Under ₹2000" or "₹2000-₹5000").
        3. If the customer mentions "premium", "expensive", "high-end", or "luxury", set budget_tier to "premium" (₹5000 and above).
        4. If a specific price range is mentioned, set min_price and/or max_price.
        5. If the request is too vague to give useful recommendations (e.g., just "saree" or "show me something") or the budget is unclear, generate a polite follow_up_question asking about their occasion, preferred fabric, color, or specific budget range.
        6. Return ONLY valid JSON, no markdown, no explanation.

        RESPOND WITH THIS EXACT JSON FORMAT:
        {
            "keywords": ["keyword1", "keyword2"],
            "min_price": null,
            "max_price": null,
            "budget_tier": null,
            "follow_up_question": "Your question here if needed, otherwise null"
        }
        PROMPT;

        try {
            $responseText = agent()->prompt($prompt)->text;

            // Extract JSON from potential markdown code blocks
            $jsonText = $responseText;
            if (preg_match('/```(?:json)?\s*(.*?)\s*```/s', $responseText, $matches)) {
                $jsonText = $matches[1];
            }

            $criteria = json_decode(trim($jsonText), true);

            if (! is_array($criteria)) {
                return $defaultCriteria;
            }

            return array_merge($defaultCriteria, $criteria);
        } catch (\Exception $e) {
            Log::error('AI Criteria Extraction Error: '.$e->getMessage());

            return $defaultCriteria;
        }
    }

    /**
     * Fetch fallback products: bestsellers first, then highest-rated, then newest.
     *
     * @return \Illuminate\Database\Eloquent\Collection<int, Product>
     */
    public function buildFallbackProducts(int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        // Bestsellers first
        $products = Product::with(['category', 'imageproducts'])
            ->where('status', 'active')
            ->where('is_bestseller', true)
            ->limit($limit)
            ->get();

        if ($products->count() >= $limit) {
            return $products;
        }

        // Fill remaining with top-rated products
        $existingIds = $products->pluck('id')->toArray();
        $remaining = $limit - $products->count();

        $topRated = Product::with(['category', 'imageproducts'])
            ->where('status', 'active')
            ->whereNotIn('id', $existingIds)
            ->withAvg('ratings', 'rating')
            ->orderByDesc('ratings_avg_rating')
            ->limit($remaining)
            ->get();

        $products = $products->merge($topRated);

        if ($products->count() >= $limit) {
            return $products;
        }

        // Fill remaining with newest products
        $existingIds = $products->pluck('id')->toArray();
        $remaining = $limit - $products->count();

        $newest = Product::with(['category', 'imageproducts'])
            ->where('status', 'active')
            ->whereNotIn('id', $existingIds)
            ->latest()
            ->limit($remaining)
            ->get();

        return $products->merge($newest);
    }

    /**
     * Get Saree recommendations based on user preferences.
     */
    public function getSareeRecommendations(
        string $preferences,
        Collection|array $products,
        bool $isFallback = false
    ): string {
        $productListStr = '';
        foreach ($products as $product) {
            $categoryName = $product->category->title ?? 'N/A';
            $primaryImage = $product->imageproducts->where('is_primary', true)->first()
                            ?? $product->imageproducts->first();
            $imageUrl = $primaryImage ? asset('storage/'.$primaryImage->image_path) : '';

            $productListStr .= "- **{$product->name}** (Slug: {$product->slug}, Category: {$categoryName}, Price: ₹{$product->price}";
            if ($product->fabric) {
                $productListStr .= ", Fabric: {$product->fabric}";
            }
            if ($product->color) {
                $productListStr .= ", Color: {$product->color}";
            }
            if ($product->occasion) {
                $productListStr .= ", Occasion: {$product->occasion}";
            }
            $productListStr .= ')';
            if ($imageUrl) {
                $productListStr .= " | Image: $imageUrl";
            }
            $productListStr .= "\n";
        }

        $fallbackContext = $isFallback
            ? "\n\nNOTE: No exact matches were found for the customer's specific request. The products below are our bestsellers, highest-rated, and newest additions. Present them gracefully — mention that while you couldn't find an exact match, these are hand-picked popular choices they might love."
            : '';

        $prompt = <<<PROMPT
        You are the Samar Silk Palace AI Shopping Assistant.
        A customer asked: "$preferences"
        $fallbackContext

        Recommend 3-5 sarees from this inventory. For each recommendation:
        1. Use a clickable link format: [Product Name](/product/slug)
        2. If an image URL is available, display it: ![Product Name](image_url)
        3. Explain WHY this product matches their needs (fabric, occasion, value, etc.)
        4. If this is a budget inquiry, highlight the price-to-quality ratio.
        5. If this is a premium inquiry, emphasize craftsmanship and exclusivity.

        AVAILABLE PRODUCTS:
        $productListStr

        Format your response in beautiful Markdown.
        PROMPT;

        try {
            return agent()->prompt($prompt)->text;
        } catch (\Exception $e) {
            Log::error('AI Recommendation Error: '.$e->getMessage());

            return 'We recommend checking our featured collection for the latest designs.';
        }
    }

    /**
     * Generate a product image using Gemini's image generation capabilities.
     */
    public function generateProductImage(string $prompt, string $aspectRatio = '1:1'): array
    {
        try {
            $response = Ai::image($prompt, size: $aspectRatio);

            // Store the first generated image
            $path = $response->store('ai-generated', 'public');

            if ($path) {
                return [
                    'status' => 'success',
                    'message' => 'Image generated successfully.',
                    'url' => asset('storage/'.$path),
                ];
            }

            return [
                'status' => 'error',
                'message' => 'No image was generated. Try rephrasing your prompt.',
                'url' => null,
            ];
        } catch (\Exception $e) {
            Log::error('AI Image Generation Error: '.$e->getMessage());

            return [
                'status' => 'error',
                'message' => 'Image generation failed: '.$e->getMessage(),
                'url' => null,
            ];
        }
    }

    /**
     * Map response messages back to the front-end format.
     */
    protected function mapResponseMessages(array $messages): array
    {
        return array_map(function ($msg) {
            $role = match (true) {
                $msg instanceof UserMessage => 'user',
                $msg instanceof AssistantMessage => 'model',
                default => 'model',
            };

            return [
                'role' => $role,
                'parts' => [['text' => $msg->content]],
            ];
        }, $messages);
    }

    /**
     * Get a summary of the current inventory for AI context.
     */
    protected function getInventoryContext(): string
    {
        try {
            $products = Product::with(['category', 'imageproducts'])
                ->where('status', 'active')
                ->limit(30)
                ->get();

            $context = "Available Products:\n";
            foreach ($products as $product) {
                $primaryImage = $product->imageproducts->where('is_primary', true)->first()
                                ?? $product->imageproducts->first();
                $imageUrl = $primaryImage ? asset('storage/'.$primaryImage->image_path) : '';

                $context .= "- Name: {$product->name}\n";
                $context .= "  Slug: {$product->slug}\n";
                $context .= '  Category: '.($product->category->title ?? 'N/A')."\n";
                $context .= "  Price: ₹{$product->price}\n";
                $context .= "  Fabric: {$product->fabric}\n";
                $context .= "  Color: {$product->color}\n";
                if ($imageUrl) {
                    $context .= "  ImageURL: $imageUrl\n";
                }
                $context .= "\n";
            }

            return $context;
        } catch (\Exception $e) {
            Log::error('Error generating inventory context: '.$e->getMessage());

            return 'Inventory data currently unavailable.';
        }
    }
}
