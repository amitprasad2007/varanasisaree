<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Spatie\Image\Image;

class ImageOptimizerController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/ImageOptimizer/Index');
    }

    public function getImages()
    {
        // Scan public storage - only specific directories to avoid scanning everything
        $directories = ['categories', 'banners', 'products', 'blogs', 'testimonials', 'aboutus'];
        $images = [];

        foreach ($directories as $directory) {
            if (Storage::disk('public')->exists($directory)) {
                $files = Storage::disk('public')->allFiles($directory);
                foreach ($files as $file) {
                    $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                    if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif'])) {
                        $images[] = [
                            'path' => $file,
                            'url' => Storage::url($file),
                            'size' => Storage::disk('public')->size($file),
                            'last_modified' => Storage::disk('public')->lastModified($file),
                            'extension' => $extension,
                        ];
                    }
                }
            }
        }

        return response()->json($images);
    }

    public function optimize(Request $request)
    {
        set_time_limit(300); // Increase to 5 minutes
        ini_set('memory_limit', '512M'); // Increase memory limit

        $request->validate([
            'images' => 'required|array',
            'images.*' => 'string',
            'format' => 'required|string|in:webp,original',
            'width' => 'nullable|integer|min:10',
            'height' => 'nullable|integer|min:10',
            'quality' => 'nullable|integer|between:1,100',
            'delete_original' => 'boolean'
        ]);

        $selectedImages = $request->images;
        $format = $request->format;
        $width = $request->width;
        $height = $request->height;
        $quality = $request->quality ?? 80;
        $deleteOriginal = $request->delete_original ?? false;

        $results = [];

        foreach ($selectedImages as $imagePath) {
            try {
                $fullPath = Storage::disk('public')->path($imagePath);
                
                if (!file_exists($fullPath)) {
                    $results[] = [
                        'path' => $imagePath,
                        'status' => 'error',
                        'message' => 'File not found'
                    ];
                    continue;
                }

                $image = Image::load($fullPath);

                if ($width || $height) {
                    $image->resize($width, $height);
                }

                if ($format === 'webp') {
                    $image->format('webp');
                    $newPath = preg_replace('/\.(jpg|jpeg|png|gif)$/i', '.webp', $imagePath);
                } else {
                    $newPath = $imagePath;
                }

                $image->quality($quality);
                
                $destinationPath = Storage::disk('public')->path($newPath);
                $image->save($destinationPath);

                // Update Database
                if ($newPath !== $imagePath) {
                    $this->updateDatabasePaths($imagePath, $newPath);
                }

                if ($deleteOriginal && $newPath !== $imagePath) {
                    Storage::disk('public')->delete($imagePath);
                }

                $results[] = [
                    'path' => $imagePath,
                    'new_path' => $newPath,
                    'status' => 'success'
                ];

            } catch (\Throwable $e) {
                \Log::error("Image optimization failed for $imagePath: " . $e->getMessage());
                $results[] = [
                    'path' => $imagePath,
                    'status' => 'error',
                    'message' => $e->getMessage()
                ];
            }
        }

        return response()->json([
            'message' => 'Optimization completed',
            'results' => $results
        ]);
    }

    protected function updateDatabasePaths($oldPath, $newPath)
    {
        $updates = [
            'categories' => ['photo'],
            'banners' => ['image'],
            'image_products' => ['image_path'],
            'product_variants' => ['image_path'],
            'product_variant_images' => ['image_path'],
            'testimonials' => ['photo'],
            'posts' => ['photo'],
            'aboutuses' => ['photo'],
            'blogs' => ['photo'],
            'post_categories' => ['photo'],
        ];

        foreach ($updates as $table => $columns) {
            if (Schema::hasTable($table)) {
                foreach ($columns as $column) {
                    if (Schema::hasColumn($table, $column)) {
                        DB::table($table)
                            ->where($column, $oldPath)
                            ->orWhere($column, 'like', '%' . $oldPath)
                            ->update([
                                $column => DB::raw("REPLACE($column, '$oldPath', '$newPath')")
                            ]);
                    }
                }
            }
        }
    }
}
