<?php

namespace App\Services;

use Gemini\Laravel\Facades\Gemini;
use Gemini\Data\Content;
use Gemini\Data\Blob;
use Gemini\Data\Part;
use Gemini\Data\GenerationConfig;
use Gemini\Data\ImageConfig;
use Gemini\Enums\MimeType;
use Gemini\Enums\ResponseModality;
use App\Models\Product;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class AiService
{
    /**
     * Generate a professional product description for a saree.
     */
    public function generateProductDescription(string $productName, array $attributes): string
    {
        $attributesStr = implode(', ', array_map(fn($k, $v) => "$k: $v", array_keys($attributes), $attributes));
        
        $prompt = "Generate a rich, elegant, and persuasive product description for a saree named '$productName'. 
        The description should highlight the craftmanship, fabric, and traditional value.
        Key attributes: $attributesStr.
        Make it suitable for a high-end Varanasi saree e-commerce website.";

        try {
            $result = Gemini::generativeModel(config('gemini.model'))->generateContent($prompt);
            return $result->text();
        } catch (\Exception $e) {
            Log::error("Gemini Description Generation Error: " . $e->getMessage());
            return "Unable to generate description at this time.";
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

            $mappedHistory = array_map(fn($item) => Content::from($item), $history);

            $chat = Gemini::generativeModel(config('gemini.model'))
                ->withSystemInstruction(Content::parse($systemInstruction))
                ->startChat(
                    history: $mappedHistory
                );

            $response = $chat->sendMessage($userMessage);
            
            return [
                'response' => $response->text(),
                'history' => $chat->history
            ];
        } catch (\Exception $e) {
            Log::error("Gemini Chat Error: " . $e->getMessage());
            return [
                'response' => "Error: " . $e->getMessage(),
                'history' => $history
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

            $mappedHistory = array_map(fn($item) => Content::from($item), $history);

            $chat = Gemini::generativeModel(config('gemini.model'))
                ->withSystemInstruction(Content::parse($systemInstruction))
                ->startChat(
                    history: $mappedHistory
                );

            if ($imageBase64) {
                // Remove the data:image/...;base64, part if present
                if (preg_match('/^data:image\/(\w+);base64,/', $imageBase64, $type)) {
                    $mimeTypeStr = "image/" . strtolower($type[1]);
                    $imageBase64 = substr($imageBase64, strpos($imageBase64, ',') + 1);
                    $mimeType = MimeType::from($mimeTypeStr);
                } else {
                    $mimeType = MimeType::IMAGE_JPEG; // Fallback
                }

                $response = $chat->sendMessage([
                    $userMessage,
                    new Blob(
                        mimeType: $mimeType,
                        data: $imageBase64
                    )
                ]);
            } else {
                $response = $chat->sendMessage($userMessage);
            }
            
            return [
                'response' => $response->text(),
                'history' => $chat->history
            ];
        } catch (\Exception $e) {
            Log::error("Gemini Backend Chat Error: " . $e->getMessage());
            return [
                'response' => "Technical Error: " . $e->getMessage(),
                'history' => $history
            ];
        }
    }

    /**
     * Get Saree recommendations based on user preferences.
     */
    public function getSareeRecommendations(string $preferences, array $products): string
    {
        $productListStr = "";
        foreach ($products as $product) {
            $productListStr .= "- {$product->name} (Category: {$product->category->name}, Price: {$product->price})\n";
        }

        $prompt = "Based on the user's preferences: '$preferences', recommend 3-5 sarees from the following list:
        $productListStr
        Provide a brief reason for each recommendation.";

        try {
            $result = Gemini::generativeModel(config('gemini.model'))->generateContent($prompt);
            return $result->text();
        } catch (\Exception $e) {
            Log::error("Gemini Recommendation Error: " . $e->getMessage());
            return "We recommend checking our featured collection for the latest designs.";
        }
    }

    /**
     * Generate a product image using Gemini's image generation capabilities.
     */
    public function generateProductImage(string $prompt, string $aspectRatio = '1:1'): array
    {
        try {
            $generationConfig = new GenerationConfig(
                responseModalities: [ResponseModality::TEXT, ResponseModality::IMAGE],
                imageConfig: new ImageConfig(aspectRatio: $aspectRatio),
            );

            $result = Gemini::generativeModel(config('gemini.image_model'))
                ->withGenerationConfig($generationConfig)
                ->generateContent($prompt);

            $textContent = '';
            $imageUrl = null;

            foreach ($result->parts() as $part) {
                if ($part->text !== null) {
                    $textContent .= $part->text;
                }

                if ($part->inlineData !== null) {
                    // Determine file extension from MIME type
                    $mimeType = $part->inlineData->mimeType;
                    $extension = match ($mimeType) {
                        MimeType::IMAGE_PNG, 'image/png' => 'png',
                        MimeType::IMAGE_WEBP, 'image/webp' => 'webp',
                        default => 'jpg',
                    };

                    // Generate a unique filename and save the image
                    $filename = 'ai_' . time() . '_' . uniqid() . '.' . $extension;
                    $storagePath = 'public/ai-generated/' . $filename;

                    // Ensure the directory exists
                    $directory = storage_path('app/public/ai-generated');
                    if (!is_dir($directory)) {
                        mkdir($directory, 0755, true);
                    }

                    // Decode and save the base64 image data
                    $imageData = base64_decode($part->inlineData->data);
                    Storage::put($storagePath, $imageData);

                    $imageUrl = asset('storage/ai-generated/' . $filename);
                }
            }

            if ($imageUrl) {
                return [
                    'status' => 'success',
                    'message' => $textContent ?: 'Image generated successfully.',
                    'url' => $imageUrl,
                ];
            }

            return [
                'status' => 'error',
                'message' => $textContent ?: 'No image was generated. Try rephrasing your prompt.',
                'url' => null,
            ];
        } catch (\Exception $e) {
            Log::error("Gemini Image Generation Error: " . $e->getMessage());
            return [
                'status' => 'error',
                'message' => 'Image generation failed: ' . $e->getMessage(),
                'url' => null,
            ];
        }
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
                $imageUrl = $primaryImage ? asset('storage/' . $primaryImage->image_path) : '';
                
                $context .= "- Name: {$product->name}\n";
                $context .= "  Slug: {$product->slug}\n";
                $context .= "  Category: " . ($product->category->title ?? 'N/A') . "\n";
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
            Log::error("Error generating inventory context: " . $e->getMessage());
            return "Inventory data currently unavailable.";
        }
    }
}
