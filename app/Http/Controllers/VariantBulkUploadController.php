<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductVariantImage;
use App\Models\Color;
use App\Models\Size;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Spatie\Image\Image;
use PhpOffice\PhpSpreadsheet\IOFactory;

class VariantBulkUploadController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Products/VariantBulkUpload');
    }

    public function downloadTemplate()
    {
        $filePath = base_path('variant_product_template.csv');
        if (file_exists($filePath)) {
            return response()->download($filePath, 'variant_bulk_upload_template.csv');
        }

        // Fallback default template if file doesn't exist
        $csvData = [
            ['SKU', 'color', 'size', 'Main Product Title', 'Variant Compare At Price', 'Variant Price', 'Variant Inventory Qty', 'Image Src'],
            ['SKU001', 'Red', 'M', 'Sample Product', '1000', '900', '10', 'https://example.com/img1.jpg|https://example.com/img2.jpg']
        ];

        $filename = 'variant_bulk_upload_template.csv';
        $handle = fopen('php://output', 'w');
        header('Content-Type: application/csv');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        foreach ($csvData as $row) { fputcsv($handle, $row); }
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
                $realPath = $file->getRealPath() ?: $file->getPathname();
                // If zip extension is missing, PhpSpreadsheet might fail. 
                // We'll try to use PowerShell to convert it to a temporary CSV if we're on Windows.
                if (!extension_loaded('zip') && PHP_OS_FAMILY === 'Windows') {
                    $tmpCsv = tempnam(sys_get_temp_dir(), 'export_v_') . '.csv';
                    $filePath = str_replace('/', '\\', $realPath);
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
                    $spreadsheet = IOFactory::load($realPath);
                    $worksheet = $spreadsheet->getActiveSheet();
                    $rows = $worksheet->toArray();
                    $headers = array_shift($rows);
                    $data = $rows;
                }
            } else {
                $path = $file->getRealPath() ?: $file->getPathname();
                $csvData = array_map('str_getcsv', file($path));
                $headers = array_shift($csvData);
                $data = $csvData;
            }

            // Cleanup headers (remove BOM, whitespace, etc.)
            $headers = array_map(function($h) {
                return trim(preg_replace('/[\x00-\x1F\x7F-\xFF]/', '', $h));
            }, $headers);

            $results = ['success' => 0, 'errors' => [], 'warnings' => []];

            foreach ($data as $rowIndex => $row) {
                if (empty(array_filter($row))) continue;

                DB::beginTransaction();
                try {
                    $rowData = array_combine($headers, $row);
                    $this->processVariantRow($rowData, $rowIndex + 2, $results);
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

    private function processVariantRow($data, $rowNumber, &$results)
    {
        $productTitle = $data['Main Product Title'] ?? null;
        if (empty($productTitle)) {
             throw new \Exception("Main Product Title is required.");
        }

        $product = Product::where('name', $productTitle)->first();
        if (!$product) {
            throw new \Exception("Product not found with title: " . $productTitle);
        }

        $sku = trim($data['SKU'] ?? '');
        if (empty($sku)) {
            throw new \Exception("SKU is required.");
        }

        $colorName = trim($data['color'] ?? '');
        $color = null;
        if (!empty($colorName) && strtolower($colorName) !== 'default') {
            $color = Color::firstOrCreate(['name' => $colorName], ['status' => 'active']);
        }

        $sizeName = trim($data['size'] ?? '');
        $size = null;
        if (!empty($sizeName)) {
            $size = Size::firstOrCreate(['name' => $sizeName], ['status' => 'active']);
        }

        $price = (float) ($data['Variant Price'] ?? 0);
        $comparePrice = (float) ($data['Variant Compare At Price'] ?? 0);
        
        // Calculate discount if possible
        $discount = 0;
        if ($comparePrice > $price && $comparePrice > 0) {
            $discount = (($comparePrice - $price) / $comparePrice) * 100;
        }

        $variant = ProductVariant::updateOrCreate(
            ['sku' => $sku],
            [
                'product_id' => $product->id,
                'color_id' => $color ? $color->id : $product->color_id, // Fallback to product level color if possible? Actually variants often have their own.
                'size_id' => $size ? $size->id : null,
                'price' => $price,
                'discount' => $discount,
                'stock_quantity' => (int) ($data['Variant Inventory Qty'] ?? 0),
                'status' => 'active'
            ]
        );

        // Process Images
        $imagesData = $data['Image Src'] ?? '';
        if (!empty($imagesData)) {
            $this->processVariantImages($variant, $imagesData, $results);
        }
    }

    private function processVariantImages($variant, $imagesData, &$results)
    {
        $images = explode('|', $imagesData);
        foreach ($images as $index => $imageUrl) {
            $imageUrl = trim($imageUrl);
            if (empty($imageUrl)) continue;
            
            // Shopify partial URLs fallback? The user template had things like d/IMG_...
            // But usually we expect full URLs. Let's assume full URLs for now, or prefix if needed.
            if (!filter_var($imageUrl, FILTER_VALIDATE_URL)) {
                 $results['warnings'][] = "Invalid image URL for variant {$variant->sku}: {$imageUrl}";
                 continue;
            }

            $path = $this->downloadAndOptimizeImage($variant->product, $imageUrl, 'variants');
            if ($path) {
                ProductVariantImage::create([
                    'product_variant_id' => $variant->id,
                    'image_path' => $path,
                    'alt_text' => $variant->sku . ' image ' . ($index + 1),
                    'is_primary' => $index === 0 && !ProductVariantImage::where('product_variant_id', $variant->id)->where('is_primary', true)->exists(),
                    'display_order' => ProductVariantImage::where('product_variant_id', $variant->id)->count() + 1
                ]);
                
                // If it's the first image, also set it as variant's main image_path if empty
                if ($index === 0 && empty($variant->image_path)) {
                    $variant->update(['image_path' => $path]);
                }
            } else {
                $results['warnings'][] = "Failed to download image: " . $imageUrl;
            }
        }
    }

    private function downloadAndOptimizeImage($product, $imageUrl, $subDir = 'products')
    {
        $imageUrl = trim($imageUrl);
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

        $filename = $subDir . '/' . $product->id . '_' . Str::random(8) . '.webp';
        
        if (!Storage::disk('public')->exists($subDir)) {
            Storage::disk('public')->makeDirectory($subDir);
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
}
