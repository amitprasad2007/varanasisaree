<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ImageOptimizerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    public function test_can_view_image_optimizer_page()
    {
        $user = User::factory()->create();
        $response = $this->actingAs($user)->get(route('image-optimizer.index'));
        $response->assertStatus(200);
    }

    public function test_can_get_images_list()
    {
        $user = User::factory()->create();
        
        // Create some dummy images in specific directories
        Storage::disk('public')->put('products/test1.jpg', 'fake content');
        Storage::disk('public')->put('banners/test2.png', 'fake content');

        $response = $this->actingAs($user)->get(route('image-optimizer.get-images'));
        
        $response->assertStatus(200)
                 ->assertJsonCount(2);
    }

    public function test_can_optimize_image_to_webp()
    {
        $user = User::factory()->create();
        
        // Create a real image for Spatie Image to load
        $file = UploadedFile::fake()->image('test.jpg');
        Storage::disk('public')->put('products/test.jpg', file_get_contents($file));

        $response = $this->actingAs($user)->post(route('image-optimizer.optimize'), [
            'images' => ['products/test.jpg'],
            'format' => 'webp',
            'quality' => 80,
            'delete_original' => true
        ]);

        $response->assertStatus(200);
        
        // Check if webp exists and jpg is deleted
        Storage::disk('public')->assertExists('products/test.webp');
        Storage::disk('public')->assertMissing('products/test.jpg');
    }
}
