<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Color;
use App\Models\Size;
use App\Models\VideoProvider;
use App\Models\ProductVariant;
use App\Models\ProductSpecification;
use App\Models\ProductImage;
use App\Models\ProductVideo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProductBulkUploadController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Products/BulkUpload');
    }

    public function downloadTemplate()
    {
        $csvData = [
            [
                'name', 'description', 'category_name', 'subcategory_name', 'brand_name',
                'price', 'discount', 'stock_quantity', 'fabric', 'color', 'size',
                'work_type', 'occasion', 'weight', 'is_bestseller', 'status',
                'specifications', 'variants', 'images', 'videos'
            ],
            [
                'Sample Product', 'Product description here', 'Electronics', 'Mobile',
                'Samsung', '299.99', '10', '50', 'Cotton', 'Blue', 'M',
                'Casual', 'Party', '1.5', 'false', 'active',
                'Material:Cotton|Care:Machine wash',
                'Red-S-SKU001-299.99-0-10|Blue-M-SKU002-349.99-5-15',
                'https://example.com/image1.jpg|https://example.com/image2.jpg',
                'YouTube-abc123-Sample Video|Vimeo-def456-Another Video'
            ]
        ];

        $filename = 'product_bulk_upload_template.csv';
        $handle = fopen('php://output', 'w');

        header('Content-Type: application/csv');
        header('Content-Disposition: attachment; filename="' . $filename . '"');

        foreach ($csvData as $row) {
            fputcsv($handle, $row);
        }

        fclose($handle);
        exit;
    }

    public function upload(Request $request)
    {
       // dd($request);
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:10240',
        ]);

       try {
            $file = $request->file('file');
            $csvData = array_map('str_getcsv', file($file->getRealPath()));

            $headers = array_shift($csvData);
            //dd($headers);

            $results = [
                'success' => 0,
                'errors' => [],
                'warnings' => []
            ];

            DB::beginTransaction();

            foreach ($csvData as $rowIndex => $row) {
               // dd($row);
                try {
                    $rowData = array_combine($headers, $row);
                    $this->processProductRow($rowData, $rowIndex + 2, $results);
                    $results['success']++;
                } catch (\Exception $e) {
                    $results['errors'][] = "Row " . ($rowIndex + 2) . ": " . $e->getMessage();
                }
            }

            DB::commit();

            return response()->json($results);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => 0,
                'errors' => ['File processing failed: ' . $e->getMessage()],
                'warnings' => []
            ], 422);
        }
    }

    private function processProductRow($data, $rowNumber, &$results)
    {
        //dd($data);
        // Find or create category
        $category = Category::firstOrCreate(
            ['title' => $data['category_name']],
            ['slug' => Str::slug($data['category_name']), 'status' => 'active']
        );

        // Find or create subcategory
        $subcategory = Category::firstOrCreate(
            ['title' => $data['subcategory_name'], 'parent_id' => $category->id],
            ['slug' => Str::slug($data['subcategory_name']), 'status' => 'active']
        );

        // Find or create brand
        $brand = Brand::firstOrCreate(
            ['name' => $data['brand_name']],
            ['slug' => Str::slug($data['brand_name']), 'status' => 'active']
        );
      //  dd( $brand);
        // Create product
        $product = Product::create([
            'name' => $data['name'],
            'slug' => Str::slug($data['name']) . '-' . time().$data['color'],
            'category_id' => $category->id,
            'subcategory_id' => $subcategory->id,
            'brand_id' => $brand->id,
            'description' => mb_convert_encoding($data['description'], 'UTF-8', 'UTF-8') ?? null,
            'price' => (float) $data['price'],
            'discount' => (float) ($data['discount'] ?? 0),
            'stock_quantity' => (int) ($data['stock_quantity'] ?? 0),
            'fabric' => $data['fabric'] ?? null,
            'color' => $data['color'] ?? null,
            'size' => $data['size'] ?? null,
            'work_type' => $data['work_type'] ?? null,
            'occasion' => $data['occasion'] ?? null,
            'weight' => $data['weight'] ? (float) $data['weight'] : null,
            'is_bestseller' => filter_var($data['is_bestseller'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'status' => $data['status'] ?? 'active',
        ]);
        //dd($product);
        // Process specifications
        if (!empty($data['specifications'])) {
            $this->processSpecifications($product, $data['specifications'], $results);
        }

        // Process variants
        if (!empty($data['variants'])) {
            $this->processVariants($product, $data['variants'], $results);
        }

        // Process images
        if (!empty($data['images'])) {
            $this->processImages($product, $data['images'], $results);
        }

        // Process videos
        if (!empty($data['videos'])) {
            $this->processVideos($product, $data['videos'], $results);
        }
    }

    private function processSpecifications($product, $specificationsData, &$results)
    {
        $specifications = explode('|', $specificationsData);
        foreach ($specifications as $spec) {
            if (strpos($spec, ':') !== false) {
                [$name, $value] = explode(':', $spec, 2);
                ProductSpecification::create([
                    'product_id' => $product->id,
                    'name' => trim($name),
                    'value' => trim($value)
                ]);
            }
        }
    }

    private function processVariants($product, $variantsData, &$results)
    {
        $variants = explode('|', $variantsData);
        foreach ($variants as $variant) {
            $variantParts = explode('-', $variant);
            if (count($variantParts) >= 6) {
                [$colorName, $sizeName, $sku, $price, $discount, $stock] = $variantParts;

                // Find or create color
                $color = null;
                if (!empty($colorName)) {
                    $color = Color::firstOrCreate(
                        ['name' => trim($colorName)],
                        ['status' => 'active']
                    );
                }

                // Find or create size
                $size = null;
                if (!empty($sizeName)) {
                    $size = Size::firstOrCreate(
                        ['name' => trim($sizeName)],
                        ['status' => 'active']
                    );
                }

                ProductVariant::create([
                    'product_id' => $product->id,
                    'color_id' => $color ? $color->id : null,
                    'size_id' => $size ? $size->id : null,
                    'sku' => trim($sku),
                    'price' => (float) $price,
                    'discount' => (float) $discount,
                    'stock_quantity' => (int) $stock,
                    'status' => 'active'
                ]);
            }
        }
    }

    private function processImages($product, $imagesData, &$results)
    {
        $images = explode('|', $imagesData);
        foreach ($images as $index => $imageUrl) {
            if (filter_var(trim($imageUrl), FILTER_VALIDATE_URL)) {
                try {
                    $imageContent = file_get_contents(trim($imageUrl));
                    if ($imageContent !== false) {
                        $extension = pathinfo(trim($imageUrl), PATHINFO_EXTENSION) ?: 'jpg';
                        $filename = 'products/' . $product->id . '_' . ($index + 1) . '.' . $extension;
                        Storage::disk('public')->put($filename, $imageContent);

                        ProductImage::create([
                            'product_id' => $product->id,
                            'image_path' => $filename,
                            'alt_text' => $product->name . ' Image ' . ($index + 1),
                            'is_primary' => $index === 0,
                            'display_order' => $index + 1
                        ]);
                    }
                } catch (\Exception $e) {
                    $results['warnings'][] = "Failed to download image: " . trim($imageUrl);
                }
            }
        }
    }

    private function processVideos($product, $videosData, &$results)
    {
        $videos = explode('|', $videosData);
        foreach ($videos as $index => $video) {
            $videoParts = explode('-', $video, 3);
            if (count($videoParts) >= 3) {
                [$providerName, $videoId, $title] = $videoParts;

                $provider = VideoProvider::firstOrCreate(
                    ['name' => trim($providerName)],
                    [
                        'base_url' => trim($providerName) === 'YouTube' ? 'https://www.youtube.com/watch?v=' : 'https://vimeo.com/',
                        'status' => 'active'
                    ]
                );

                ProductVideo::create([
                    'product_id' => $product->id,
                    'video_provider_id' => $provider->id,
                    'title' => trim($title),
                    'video_id' => trim($videoId),
                    'display_order' => $index + 1,
                    'is_featured' => $index === 0,
                    'status' => 'active'
                ]);
            }
        }
    }
}
