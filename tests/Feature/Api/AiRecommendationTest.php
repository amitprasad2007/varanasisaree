<?php

/** @var TestCase $this */

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Services\AiService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->category = Category::factory()->create(['title' => 'Saris & Lehengas']);
    $this->brand = Brand::factory()->create();
});

it('returns validation error when preferences is missing', function () {
    $response = $this->postJson('/api/ai/recommendations', []);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['preferences']);
});

it('returns follow-up question when AI detects vague input', function () {
    $this->mock(AiService::class, function ($mock) {
        $mock->shouldReceive('extractSearchCriteria')
            ->once()
            ->andReturn([
                'keywords' => [],
                'min_price' => null,
                'max_price' => null,
                'budget_tier' => null,
                'follow_up_question' => 'What occasion are you shopping for? Do you have a preferred color or fabric?',
            ]);
    });

    $response = $this->postJson('/api/ai/recommendations', [
        'preferences' => 'saree',
    ]);

    $response->assertOk()
        ->assertJsonStructure(['follow_up_question', 'recommendations', 'matched_count'])
        ->assertJson(['matched_count' => 0]);

    expect($response->json('recommendations'))->toBeString()
        ->toContain("I'd love to help you find the perfect saree!");
});

it('builds dynamic query from AI-extracted criteria and returns matched products', function () {
    // Create products that match "silk" keyword
    Product::factory()->count(3)->create([
        'name' => 'Banarasi Silk Saree',
        'category_id' => $this->category->id,
        'brand_id' => $this->brand->id,
        'status' => 'active',
        'price' => 4500,
    ]);

    // Create products that should NOT match
    Product::factory()->count(2)->create([
        'name' => 'Cotton Dupatta',
        'category_id' => $this->category->id,
        'brand_id' => $this->brand->id,
        'status' => 'active',
        'price' => 1500,
    ]);

    $this->mock(AiService::class, function ($mock) {
        $mock->shouldReceive('extractSearchCriteria')
            ->once()
            ->andReturn([
                'keywords' => ['silk'],
                'min_price' => null,
                'max_price' => null,
                'budget_tier' => null,
                'follow_up_question' => null,
            ]);

        $mock->shouldReceive('getSareeRecommendations')
            ->once()
            ->withArgs(function ($prefs, $products, $isFallback) {
                return $prefs === 'I want a silk saree'
                    && count($products) === 3
                    && $isFallback === false;
            })
            ->andReturn('Here are 3 silk sarees for you...');
    });

    $response = $this->postJson('/api/ai/recommendations', [
        'preferences' => 'I want a silk saree',
    ]);

    $response->assertOk()
        ->assertJson([
            'is_fallback' => false,
            'matched_count' => 3,
        ]);
});

it('applies budget tier pricing when customer asks for budget sarees', function () {
    // Create budget product (under 5000)
    Product::factory()->create([
        'name' => 'Budget Silk Saree',
        'category_id' => $this->category->id,
        'brand_id' => $this->brand->id,
        'status' => 'active',
        'price' => 3000,
    ]);

    // Create premium product (above 5000) — should be excluded
    Product::factory()->create([
        'name' => 'Premium Silk Saree',
        'category_id' => $this->category->id,
        'brand_id' => $this->brand->id,
        'status' => 'active',
        'price' => 8000,
    ]);

    $this->mock(AiService::class, function ($mock) {
        $mock->shouldReceive('extractSearchCriteria')
            ->once()
            ->andReturn([
                'keywords' => ['silk'],
                'min_price' => null,
                'max_price' => null,
                'budget_tier' => 'budget',
                'follow_up_question' => null,
            ]);

        $mock->shouldReceive('getSareeRecommendations')
            ->once()
            ->withArgs(function ($prefs, $products, $isFallback) {
                // Only the budget product should be returned
                return count($products) === 1
                    && $products->first()->price <= 5000
                    && $isFallback === false;
            })
            ->andReturn('Here is a great budget silk option...');
    });

    $response = $this->postJson('/api/ai/recommendations', [
        'preferences' => 'affordable silk saree',
    ]);

    $response->assertOk()
        ->assertJson(['is_fallback' => false, 'matched_count' => 1]);
});

it('falls back to bestsellers when no products match criteria', function () {
    // Create bestseller products (these should be returned as fallback)
    Product::factory()->count(2)->create([
        'name' => 'Bestseller Monga Saree',
        'category_id' => $this->category->id,
        'brand_id' => $this->brand->id,
        'status' => 'active',
        'is_bestseller' => true,
        'price' => 6000,
    ]);

    $this->mock(AiService::class, function ($mock) {
        $mock->shouldReceive('extractSearchCriteria')
            ->once()
            ->andReturn([
                'keywords' => ['neon', 'galaxy', 'space'],
                'min_price' => null,
                'max_price' => null,
                'budget_tier' => null,
                'follow_up_question' => null,
            ]);

        $mock->shouldReceive('buildFallbackProducts')
            ->once()
            ->with(10)
            ->andReturn(Product::where('is_bestseller', true)->with(['category', 'imageproducts'])->get());

        $mock->shouldReceive('getSareeRecommendations')
            ->once()
            ->withArgs(function ($prefs, $products, $isFallback) {
                return $isFallback === true && count($products) === 2;
            })
            ->andReturn('No exact matches, but here are our bestsellers...');
    });

    $response = $this->postJson('/api/ai/recommendations', [
        'preferences' => 'neon galaxy space saree',
    ]);

    $response->assertOk()
        ->assertJson([
            'is_fallback' => true,
            'matched_count' => 2,
        ]);
});
