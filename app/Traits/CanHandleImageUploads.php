<?php

namespace App\Traits;

use App\Models\ImageProduct;
use App\Models\Product;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Spatie\Image\Image;

trait CanHandleImageUploads
{
    /**
     * Download an image from a URL, optimize it to WebP, and save it.
     *
     * @return string|null The saved filename or null on failure
     */
    protected function downloadAndOptimizeImage(Product $product, string $imageUrl, string $folder = 'products')
    {
        $imageUrl = trim($imageUrl);
        if (! filter_var($imageUrl, FILTER_VALIDATE_URL)) {
            return null;
        }

        $options = [
            'http' => [
                'header' => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36\r\n",
                'timeout' => 30,
            ],
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
            ],
        ];
        $context = stream_context_create($options);
        $imageContent = @file_get_contents($imageUrl, false, $context);

        if ($imageContent === false) {
            return null;
        }

        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->buffer($imageContent);
        if (strpos($mimeType, 'image/') !== 0) {
            return null;
        }

        if (! Storage::disk('public')->exists($folder)) {
            Storage::disk('public')->makeDirectory($folder);
        }

        $filename = $folder.'/'.$product->id.'_'.Str::random(8).'.webp';
        $imagePath = Storage::disk('public')->path($filename);

        $tempFile = tempnam(sys_get_temp_dir(), 'img_trait_');
        file_put_contents($tempFile, $imageContent);

        try {
            Image::load($tempFile)->quality(80)->save($imagePath);

            return $filename;
        } catch (\Exception $e) {
            \Log::error("Failed to optimize image from $imageUrl: ".$e->getMessage());

            return null;
        } finally {
            if (file_exists($tempFile)) {
                unlink($tempFile);
            }
        }
    }

    /**
     * Process multiple images from a pipe-separated string of URLs.
     *
     * @param  array  $results  Reference to results array for warnings
     * @return void
     */
    protected function processImageUrlString(Product $product, string $imagesData, &$results = [])
    {
        $images = array_filter(explode('|', $imagesData));
        if (empty($images)) {
            return;
        }

        foreach ($images as $index => $imageUrl) {
            $imageUrl = trim($imageUrl);
            if (empty($imageUrl)) {
                continue;
            }

            // Avoid re-downloading existing images if they are already in the database
            // We use basename of the URL as a weak check, similar to existing logic
            $imageName = basename(explode('?', $imageUrl)[0]);
            $existingImage = ImageProduct::where('product_id', $product->id)
                ->where('alt_text', 'LIKE', '%'.$imageName.'%')
                ->first();

            if ($existingImage) {
                continue;
            }

            $filename = $this->downloadAndOptimizeImage($product, $imageUrl);

            if ($filename) {
                ImageProduct::create([
                    'product_id' => $product->id,
                    'image_path' => $filename,
                    'alt_text' => $product->name.' - '.$imageName,
                    'is_primary' => $index === 0 && ! ImageProduct::where('product_id', $product->id)->where('is_primary', true)->exists(),
                    'display_order' => ImageProduct::where('product_id', $product->id)->count() + 1,
                ]);
            } else {
                $results['warnings'][] = "Failed to download image from URL: $imageUrl";
            }
        }
    }
}
