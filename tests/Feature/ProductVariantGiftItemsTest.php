<?php

use App\Models\GiftItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->product = Product::factory()->create(['name' => 'Main Product', 'status' => 'active']);
    $this->variant = ProductVariant::factory()->create([
        'product_id' => $this->product->id,
        'sku' => 'VAR-MAIN-SKU',
        'status' => 'active',
    ]);
});

test('admin can view gift items index page', function () {
    $response = $this->actingAs($this->user)
        ->get(route('product-variants.gift-items', [$this->product->id, $this->variant->id]));

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Admin/ProductVariants/GiftItems')
        ->has('product')
        ->has('variant')
        ->has('giftItems')
    );
});

test('admin can store a new gift item for a variant', function () {
    $giftProduct = Product::factory()->create(['name' => 'Gift Saree', 'status' => 'active']);

    $response = $this->actingAs($this->user)
        ->post(route('product-variants.gift-items.store', [$this->product->id, $this->variant->id]), [
            'product_id' => $giftProduct->id,
            'product_type' => 'main',
            'offer_type' => 'free',
            'offered_price' => 0,
            'status' => 'active',
            'min_spend' => 999,
            'min_quantity' => 2,
            'eligibility_text' => 'Buy 2 get 1 free',
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('gift_items', [
        'product_variant_id' => $this->variant->id,
        'product_id' => $giftProduct->id,
        'product_type' => 'main',
        'offer_type' => 'free',
        'offered_price' => 0.00,
        'status' => 'active',
        'min_spend' => 999.00,
        'min_quantity' => 2,
        'eligibility_text' => 'Buy 2 get 1 free',
    ]);
});

test('admin can update a gift item', function () {
    $giftProduct = Product::factory()->create(['name' => 'Gift Saree', 'status' => 'active']);
    $giftItem = GiftItem::create([
        'product_variant_id' => $this->variant->id,
        'product_id' => $giftProduct->id,
        'product_type' => 'main',
        'offer_type' => 'free',
        'offered_price' => 0,
        'status' => 'active',
    ]);

    $response = $this->actingAs($this->user)
        ->put(route('product-variants.gift-items.update', [$this->product->id, $this->variant->id, $giftItem->id]), [
            'product_id' => $giftProduct->id,
            'product_type' => 'main',
            'offer_type' => 'discounted',
            'offered_price' => 99.50,
            'status' => 'inactive',
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('gift_items', [
        'id' => $giftItem->id,
        'offer_type' => 'discounted',
        'offered_price' => 99.50,
        'status' => 'inactive',
    ]);
});

test('admin can delete a gift item', function () {
    $giftProduct = Product::factory()->create(['name' => 'Gift Saree', 'status' => 'active']);
    $giftItem = GiftItem::create([
        'product_variant_id' => $this->variant->id,
        'product_id' => $giftProduct->id,
        'product_type' => 'main',
        'offer_type' => 'free',
        'offered_price' => 0,
        'status' => 'active',
    ]);

    $response = $this->actingAs($this->user)
        ->delete(route('product-variants.gift-items.destroy', [$this->product->id, $this->variant->id, $giftItem->id]));

    $response->assertRedirect();
    $this->assertDatabaseMissing('gift_items', [
        'id' => $giftItem->id,
    ]);
});

test('admin can search for products and variants', function () {
    $searchProduct = Product::factory()->create(['name' => 'Unique Saree Match', 'status' => 'active']);
    $searchVariant = ProductVariant::factory()->create([
        'product_id' => $this->product->id,
        'sku' => 'SKU-UNIQUE-MATCH',
        'status' => 'active',
    ]);

    $response = $this->actingAs($this->user)
        ->get(route('product-variants.gift-items.search', ['query' => 'UNIQUE']));

    $response->assertStatus(200);
    $response->assertJsonFragment([
        'id' => $searchProduct->id,
        'type' => 'main',
        'name' => 'Unique Saree Match',
    ]);
    $response->assertJsonFragment([
        'id' => $searchVariant->id,
        'type' => 'variant',
        'sku' => 'SKU-UNIQUE-MATCH',
    ]);
});

test('public api getProductDetails returns gift items for variants', function () {
    $giftProduct = Product::factory()->create(['name' => 'Gift Saree Item', 'price' => 1500, 'status' => 'active']);
    $giftItem = GiftItem::create([
        'product_variant_id' => $this->variant->id,
        'product_id' => $giftProduct->id,
        'product_type' => 'main',
        'offer_type' => 'free',
        'offered_price' => 0,
        'status' => 'active',
    ]);

    $response = $this->get("/api/getProductDetails/{$this->product->slug}");

    $response->assertStatus(200);
    $response->assertJsonPath('variants.0.gift_items.0.name', 'Gift Saree Item');
    $response->assertJsonPath('variants.0.gift_items.0.offer_type', 'free');
    $response->assertJsonPath('variants.0.gift_items.0.original_price', 1500);
    $response->assertJsonPath('variants.0.gift_items.0.slug', $giftProduct->slug);
});
