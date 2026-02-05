<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Http\Controllers\ProductBulkUploadController;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class FreshProductImportSeeder extends Seeder
{
    public function run()
    {
        echo "Starting Fresh Product Import...\n";

        // 1. Clear existing images from storage
        echo "Clearing existing product images from storage...\n";
        if (Storage::disk('public')->exists('products')) {
            Storage::disk('public')->deleteDirectory('products');
            Storage::disk('public')->makeDirectory('products');
        }

        // 2. Truncate tables (Foreign Key checks disabled temporarily)
        echo "Truncating database tables...\n";
        Schema::disableForeignKeyConstraints();
        
        $tables = [
            'product_variant_images',
            'image_products',
            'product_variants',
            'product_specifications',
            'product_videos',
            'products',
            'categories',
            'brands',
            'colors',
            'sizes'
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                echo " - Truncating $table\n";
                DB::table($table)->truncate();
            }
        }
        
        Schema::enableForeignKeyConstraints();

        // 3. Prepare the import
        $filePath = 'e:/laragon/www/varanasisaree/products_export_allitesm.xlsx';
        
        if (!file_exists($filePath)) {
            echo "ABORTED: Excel file not found at $filePath\n";
            return;
        }

        echo "Importing products from Excel (this may take a while)...\n";

        // Simulate a request with the file
        $file = new UploadedFile(
            $filePath,
            'products_export_allitesm.xlsx',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            null,
            true
        );

        $request = new Request([], [], [], [], ['file' => $file]);
        
        $controller = new ProductBulkUploadController();
        $response = $controller->upload($request);

        echo "\nImport Result:\n";
        $result = $response->getData();
        echo "Success: " . ($result->success ?? 0) . " rows processed.\n";
        
        if (!empty($result->errors)) {
            echo "Errors found:\n";
            print_r($result->errors);
        }

        if (!empty($result->warnings)) {
            echo "Warnings found:\n";
            print_r($result->warnings);
        }

        echo "\nFresh Import Complete!\n";
    }
}
