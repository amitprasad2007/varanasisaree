<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Product;
use App\Models\Customer;
use App\Models\ProductReview;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;

class AdminProductReviewTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Create an admin user if needed, or just a user if auth check is simple
        // Assuming 'auth' middleware is used.
        $this->user = User::factory()->create();
    }

    public function test_admin_can_view_reviews_page()
    {
        $response = $this->actingAs($this->user)->get(route('product-reviews.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/ProductReviews/Index')
            ->has('reviews')
        );
    }

    public function test_admin_can_approve_review()
    {
        $customer = Customer::factory()->create();
        $product = Product::factory()->create();
        $review = ProductReview::create([
            'customer_id' => $customer->id,
            'product_id' => $product->id,
            'rating' => 5,
            'review' => 'Great product',
            'status' => 'pending'
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('product-reviews.approve', $review->id));

        $response->assertRedirect();
        $this->assertDatabaseHas('product_reviews', [
            'id' => $review->id,
            'status' => 'approved'
        ]);
    }

    public function test_admin_can_reject_review()
    {
        $customer = Customer::factory()->create();
        $product = Product::factory()->create();
        $review = ProductReview::create([
            'customer_id' => $customer->id,
            'product_id' => $product->id,
            'rating' => 5,
            'review' => 'Bad product',
            'status' => 'pending'
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('product-reviews.reject', $review->id));

        $response->assertRedirect();
        $this->assertDatabaseHas('product_reviews', [
            'id' => $review->id,
            'status' => 'rejected'
        ]);
    }

    public function test_admin_can_delete_review()
    {
        $customer = Customer::factory()->create();
        $product = Product::factory()->create();
        $review = ProductReview::create([
            'customer_id' => $customer->id,
            'product_id' => $product->id,
            'rating' => 5,
            'review' => 'Bad product',
            'status' => 'pending'
        ]);

        $response = $this->actingAs($this->user)
            ->delete(route('product-reviews.destroy', $review->id));

        $response->assertRedirect();
        $this->assertDatabaseMissing('product_reviews', [
            'id' => $review->id
        ]);
    }
}
