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
use App\Models\ImageProduct;
use App\Models\ProductVideo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Spatie\Image\Image;
use PhpOffice\PhpSpreadsheet\IOFactory;

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
        $request->validate([
            'file' => 'required|file|mimes:csv,txt,xlsx,xls|max:20480',
        ]);

        try {
            $file = $request->file('file');
            $extension = $file->getClientOriginalExtension();
            $data = [];
            $headers = [];

            if (in_array($extension, ['xlsx', 'xls'])) {
                // If zip extension is missing, PhpSpreadsheet might fail. 
                // We'll try to use PowerShell to convert it to a temporary CSV if we're on Windows.
                if (!extension_loaded('zip') && PHP_OS_FAMILY === 'Windows') {
                    $tmpCsv = tempnam(sys_get_temp_dir(), 'export_') . '.csv';
                    $filePath = str_replace('/', '\\', $file->getRealPath());
                    $cmd = "powershell -Command \"\$excel = New-Object -ComObject Excel.Application; \$workbook = \$excel.Workbooks.Open('$filePath'); \$workbook.SaveAs('$tmpCsv', 6); \$workbook.Close(\$false); \$excel.Quit()\"";
                    shell_exec($cmd);
                    
                    if (file_exists($tmpCsv)) {
                        $csvData = array_map('str_getcsv', file($tmpCsv));
                        $headers = array_shift($csvData);
                        $data = $csvData;
                        unlink($tmpCsv);
                    }
                }

                if (empty($data)) {
                    $spreadsheet = IOFactory::load($file->getRealPath());
                    $worksheet = $spreadsheet->getActiveSheet();
                    $rows = $worksheet->toArray();
                    $headers = array_shift($rows);
                    $data = $rows;
                }
            } else {
                $csvData = array_map('str_getcsv', file($file->getRealPath()));
                $headers = array_shift($csvData);
                $data = $csvData;
            }

            $isShopify = in_array('Handle', $headers) && in_array('Image Src', $headers);

            $results = [
                'success' => 0,
                'errors' => [],
                'warnings' => []
            ];

            $currentProduct = null;
            $handleMap = [];

            foreach ($data as $rowIndex => $row) {
                if (empty(array_filter($row))) continue;

                DB::beginTransaction();
                try {
                    $rowData = array_combine($headers, $row);

                    if ($isShopify) {
                        $this->processShopifyRow($rowData, $rowIndex + 2, $results, $currentProduct, $handleMap);
                    } else {
                        $this->processProductRow($rowData, $rowIndex + 2, $results);
                    }

                    DB::commit();
                    $results['success']++;
                } catch (\Exception $e) {
                    DB::rollBack();
                    $results['errors'][] = "Row " . ($rowIndex + 2) . ": " . $e->getMessage();
                }
            }

            return response()->json($results);
        } catch (\Exception $e) {
            return response()->json([
                'success' => 0,
                'errors' => ['File processing failed: ' . $e->getMessage()],
                'warnings' => []
            ], 422);
        }
    }

    private function processShopifyRow($data, $rowNumber, &$results, &$currentProduct, &$handleMap)
    {
        $handle = $data['Handle'] ?? null;
        if (empty($handle)) return;

        // If this row has a Title, it's a new product or the first row of a product
        if (!empty($data['Title'])) {
            // Find or create category (Shopify uses 'Product Category' or 'Type')
            $categoryName = !empty($data['Product Category']) ? $data['Product Category'] : (!empty($data['Type']) ? $data['Type'] : 'Uncategorized');
            $category = Category::firstOrCreate(
                ['title' => $categoryName],
                ['slug' => Str::slug($categoryName), 'status' => 'active']
            );

            // Shopify doesn't have a direct subcategory in standard export, we'll use Type if Category was present
            $subcategory = null;
            if (!empty($data['Product Category']) && !empty($data['Type'])) {
                $subcategory = Category::firstOrCreate(
                    ['title' => $data['Type'], 'parent_id' => $category->id],
                    ['slug' => Str::slug($data['Type']), 'status' => 'active']
                );
            }

            // Brand (Vendor in Shopify)
            $brandName = $data['Vendor'] ?? 'Generic';
            $brand = Brand::firstOrCreate(
                ['name' => $brandName],
                ['slug' => Str::slug($brandName), 'status' => 'active']
            );

            // Create or Update Product
            $product = Product::updateOrCreate(
                ['slug' => $handle],
                [
                    'name' => $data['Title'],
                    'category_id' => $category->id,
                    'subcategory_id' => $subcategory ? $subcategory->id : $category->id,
                    'brand_id' => $brand->id,
                    'description' => $data['Body (HTML)'] ?? null,
                    'price' => (float) ($data['Variant Price'] ?? 0),
                    'discount' => 0,
                    'stock_quantity' => (int) ($data['Variant Inventory Qty'] ?? 0),
                    'status' => 'active',
                ]
            );
            $currentProduct = $product;
            $handleMap[$handle] = $product;
        } else {
            $product = $handleMap[$handle] ?? $currentProduct;
        }

        if (!$product) return;

        // Process Variants (Shopify has Option1 Name, Option1 Value, etc.)
        if (!empty($data['Option1 Value']) || !empty($data['Variant SKU'])) {
            $this->processShopifyVariant($product, $data, $results);
        }

        // Process Images
        if (!empty($data['Image Src'])) {
            $this->processImages($product, $data['Image Src'], $results);
        }
    }

    private function processShopifyVariant($product, $data, &$results)
    {
        $colorName = null;
        $sizeName = null;

        for ($i = 1; $i <= 3; $i++) {
            $optionName = strtolower($data["Option{$i} Name"] ?? '');
            $optionValue = $data["Option{$i} Value"] ?? null;

            if (strpos($optionName, 'color') !== false || strpos($optionName, 'colour') !== false) {
                $colorName = $optionValue;
            } elseif (strpos($optionName, 'size') !== false) {
                $sizeName = $optionValue;
            }
        }

        $color = null;
        if ($colorName) {
            $color = Color::firstOrCreate(['name' => trim($colorName)], ['status' => 'active']);
        }

        $size = null;
        if ($sizeName) {
            $size = Size::firstOrCreate(['name' => trim($sizeName)], ['status' => 'active']);
        }

        $variantImagePath = null;
        if (!empty($data['Variant Image'])) {
            $variantImagePath = $this->downloadAndOptimizeImage($product, $data['Variant Image']);
        }

        ProductVariant::updateOrCreate(
            ['sku' => trim($data['Variant SKU'] ?? $product->slug . '-' . time())],
            [
                'product_id' => $product->id,
                'color_id' => $color ? $color->id : null,
                'size_id' => $size ? $size->id : null,
                'price' => (float) ($data['Variant Price'] ?? $product->price),
                'discount' => 0,
                'stock_quantity' => (int) ($data['Variant Inventory Qty'] ?? 0),
                'image_path' => $variantImagePath,
                'status' => 'active'
            ]
        );
    }

    private function downloadAndOptimizeImage($product, $imageUrl)
    {
        $imageUrl = trim($imageUrl);
        if (!filter_var($imageUrl, FILTER_VALIDATE_URL)) return null;

        $options = [
            "http" => ["header" => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36\r\n"],
            "ssl" => ["verify_peer" => false, "verify_peer_name" => false]
        ];
        $context = stream_context_create($options);
        $imageContent = @file_get_contents($imageUrl, false, $context);

        if ($imageContent === false) return null;

        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->buffer($imageContent);
        if (strpos($mimeType, 'image/') !== 0) return null;

        $filename = 'products/' . $product->id . '_' . Str::random(8) . '.webp';
        
        if (!Storage::disk('public')->exists('products')) {
            Storage::disk('public')->makeDirectory('products');
        }

        $imagePath = Storage::disk('public')->path($filename);
        $tempFile = tempnam(sys_get_temp_dir(), 'img_v_');
        file_put_contents($tempFile, $imageContent);

        try {
            Image::load($tempFile)->quality(80)->save($imagePath);
            return $filename;
        } catch (\Exception $e) {
            return null;
        } finally {
            if (file_exists($tempFile)) unlink($tempFile);
        }
    }

    private function processProductRow($data, $rowNumber, &$results)
    {
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
        // Process specifications
        if (!empty($data['specifications'])) {
            $this->processSpecifications($product, $data['specifications'], $results);
        }

        // Process variants
        if (!empty($data['variants'])) {
            $this->processVariants($product, $data['variants'], $results);
        }

        // Process images
        if (empty($data['images'])) {
             throw new \Exception("Images are required for product: " . $data['name']);
        }
        $this->processImages($product, $data['images'], $results);

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

                $color = null;
                if (!empty($colorName)) {
                    $color = Color::firstOrCreate(['name' => trim($colorName)], ['status' => 'active']);
                }

                $size = null;
                if (!empty($sizeName)) {
                    $size = Size::firstOrCreate(['name' => trim($sizeName)], ['status' => 'active']);
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
        if (empty($images)) return;

        foreach ($images as $index => $imageUrl) {
            $imageUrl = trim($imageUrl);
            if (!filter_var($imageUrl, FILTER_VALIDATE_URL)) continue;

            // Avoid re-downloading existing images if they are already in the database
            $existingImage = ImageProduct::where('product_id', $product->id)
                ->where('alt_text', 'LIKE', '%' . basename($imageUrl) . '%')
                ->first();
            if ($existingImage) continue;

            $options = [
                "http" => ["header" => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36\r\n"],
                "ssl" => ["verify_peer" => false, "verify_peer_name" => false]
            ];
            $context = stream_context_create($options);
            $imageContent = @file_get_contents($imageUrl, false, $context);

            if ($imageContent === false) continue;

            $finfo = new \finfo(FILEINFO_MIME_TYPE);
            $mimeType = $finfo->buffer($imageContent);
            if (strpos($mimeType, 'image/') !== 0) continue;

            $filename = 'products/' . $product->id . '_' . Str::random(5) . '_' . ($index + 1) . '.webp';
            
            if (!Storage::disk('public')->exists('products')) {
                Storage::disk('public')->makeDirectory('products');
            }

            $imagePath = Storage::disk('public')->path($filename);
            $tempFile = tempnam(sys_get_temp_dir(), 'img_upload_');
            file_put_contents($tempFile, $imageContent);

            try {
                Image::load($tempFile)->quality(80)->save($imagePath);
                
                ImageProduct::create([
                    'product_id' => $product->id,
                    'image_path' => $filename,
                    'alt_text' => $product->name . ' - ' . basename($imageUrl),
                    'is_primary' => $index === 0 && !ImageProduct::where('product_id', $product->id)->where('is_primary', true)->exists(),
                    'display_order' => ImageProduct::where('product_id', $product->id)->count() + 1
                ]);
            } catch (\Exception $e) {
                $results['warnings'][] = "Failed to process image $imageUrl: " . $e->getMessage();
            } finally {
                if (file_exists($tempFile)) unlink($tempFile);
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
