<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Facades\Log;
use Laravel\Ai\Ai;
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
        } catch (\Laravel\Ai\Exceptions\ProviderOverloadedException $e) {
            Log::warning('AI Gemini Overloaded (Description): ' . $e->getMessage());
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
        } catch (\Laravel\Ai\Exceptions\ProviderOverloadedException $e) {
            Log::warning('AI Gemini Overloaded (Chat): ' . $e->getMessage());
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
        } catch (\Laravel\Ai\Exceptions\ProviderOverloadedException $e) {
            Log::warning('AI Gemini Overloaded (Backend): ' . $e->getMessage());
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
     * Get Saree recommendations based on user preferences.
     */
    public function getSareeRecommendations(string $preferences, \Illuminate\Support\Collection|array $products): string
    {
        $productListStr = '';
        foreach ($products as $product) {
            $categoryName = $product->category->title ?? 'N/A';
            $productListStr .= "- {$product->name} (Category: {$categoryName}, Price: {$product->price})\n";
        }

        $prompt = "Based on the user's preferences: '$preferences', recommend 3-5 sarees from the following list:
        $productListStr
        Provide a brief reason for each recommendation.";

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
