<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Payment;
use App\Models\Refund;
use App\Models\RefundTransaction;
use App\Services\RazorpayRefundService;
use App\Services\RefundService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Mockery;

class RazorpayRefundTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $customer;
    protected $order;
    protected $payment;
    protected $razorpayService;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test customer
        $this->customer = Customer::factory()->create([
            'name' => 'Test Customer',
            'email' => 'test@example.com',
            'phone' => '9876543210'
        ]);

        // Create test product
        $product = Product::factory()->create([
            'name' => 'Test Product',
            'price' => 1000
        ]);

        // Create test order
        $this->order = Order::factory()->create([
            'customer_id' => $this->customer->id,
            'order_id' => 'ORD' . time(),
            'total_amount' => 1000,
            'payment_method' => 'razorpay',
            'payment_status' => 'paid',
            'status' => 'delivered',
            'transaction_id' => 'rzp_test_order_' . time()
        ]);

        // Create order item
        OrderItem::factory()->create([
            'order_id' => $this->order->id,
            'product_id' => $product->id,
            'quantity' => 1,
            'price' => 1000
        ]);

        // Create test payment
        $this->payment = Payment::factory()->create([
            'customer_id' => $this->customer->id,
            'payment_id' => 'pay_test_' . time(),
            'amount' => 100000, // Amount in paise
            'status' => 'captured',
            'method' => 'card',
            'order_id' => $this->order->order_id,
            'rzorder_id' => $this->order->transaction_id,
            'refunded_amount' => 0
        ]);

        $this->razorpayService = app(RazorpayRefundService::class);
    }

    /** @test */
    public function it_can_validate_razorpay_refund_eligibility()
    {
        $validation = $this->razorpayService->validateRefundEligibility($this->payment, 500);

        $this->assertTrue($validation['eligible']);
        $this->assertEquals(1000, $validation['original_amount']);
        $this->assertEquals(0, $validation['total_refunded']);
        $this->assertEquals(1000, $validation['remaining_refundable']);
    }

    /** @test */
    public function it_rejects_refund_for_non_captured_payment()
    {
        $this->payment->update(['status' => 'authorized']);
        
        $validation = $this->razorpayService->validateRefundEligibility($this->payment, 500);

        $this->assertFalse($validation['eligible']);
        $this->assertEquals('Payment not captured', $validation['reason']);
    }

    /** @test */
    public function it_rejects_refund_exceeding_remaining_amount()
    {
        $validation = $this->razorpayService->validateRefundEligibility($this->payment, 1500);

        $this->assertFalse($validation['eligible']);
        $this->assertEquals('Refund amount exceeds remaining refundable amount', $validation['reason']);
        $this->assertEquals(1000, $validation['max_refundable']);
    }

    /** @test */
    public function it_rejects_refund_for_fully_refunded_payment()
    {
        $this->payment->update(['refunded_amount' => 1000]);
        
        $validation = $this->razorpayService->validateRefundEligibility($this->payment, 500);

        $this->assertFalse($validation['eligible']);
        $this->assertEquals('Payment already fully refunded', $validation['reason']);
    }

    /** @test */
    public function it_can_create_refund_request_via_api()
    {
        $this->actingAs($this->customer, 'sanctum');

        $refundData = [
            'order_id' => $this->order->id,
            'amount' => 500,
            'method' => 'razorpay',
            'reason' => 'Product defect',
            'items' => [
                [
                    'product_id' => $this->order->orderItems->first()->product_id,
                    'quantity' => 1,
                    'unit_price' => 1000,
                    'total_amount' => 500,
                    'reason' => 'Product defect'
                ]
            ]
        ];

        $response = $this->postJson('/api/refunds', $refundData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'order_id',
                    'amount',
                    'method',
                    'status',
                    'reason',
                    'reference'
                ]
            ]);

        $this->assertDatabaseHas('refunds', [
            'order_id' => $this->order->id,
            'customer_id' => $this->customer->id,
            'amount' => 500,
            'method' => 'razorpay',
            'status' => 'pending'
        ]);
    }

    /** @test */
    public function it_validates_razorpay_eligibility_before_creating_refund()
    {
        $this->actingAs($this->customer, 'sanctum');

        // Make payment non-refundable
        $this->payment->update(['status' => 'authorized']);

        $refundData = [
            'order_id' => $this->order->id,
            'amount' => 500,
            'method' => 'razorpay',
            'reason' => 'Product defect'
        ];

        $response = $this->postJson('/api/refunds', $refundData);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Payment not found or not captured'
            ]);
    }

    /** @test */
    public function it_can_check_razorpay_eligibility_via_api()
    {
        $this->actingAs($this->customer, 'sanctum');

        $response = $this->getJson('/api/refunds/check-razorpay-eligibility', [
            'order_id' => $this->order->id
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'eligible',
                    'original_amount',
                    'total_refunded',
                    'remaining_refundable'
                ]
            ]);

        $this->assertTrue($response->json('data.eligible'));
    }

    /** @test */
    public function it_rejects_razorpay_eligibility_for_non_razorpay_orders()
    {
        $this->actingAs($this->customer, 'sanctum');

        $this->order->update(['payment_method' => 'cod']);

        $response = $this->getJson('/api/refunds/check-razorpay-eligibility', [
            'order_id' => $this->order->id
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Order was not paid via Razorpay'
            ]);
    }

    /** @test */
    public function it_can_get_customer_refunds()
    {
        $this->actingAs($this->customer, 'sanctum');

        // Create a refund
        Refund::factory()->create([
            'customer_id' => $this->customer->id,
            'order_id' => $this->order->id,
            'amount' => 500,
            'method' => 'razorpay',
            'status' => 'pending'
        ]);

        $response = $this->getJson('/api/refunds');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'amount',
                            'method',
                            'status',
                            'reason',
                            'reference'
                        ]
                    ]
                ]
            ]);
    }

    /** @test */
    public function it_can_cancel_pending_refund()
    {
        $this->actingAs($this->customer, 'sanctum');

        $refund = Refund::factory()->create([
            'customer_id' => $this->customer->id,
            'order_id' => $this->order->id,
            'amount' => 500,
            'method' => 'razorpay',
            'status' => 'pending'
        ]);

        $response = $this->postJson("/api/refunds/{$refund->id}/cancel");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Refund request cancelled successfully.'
            ]);

        $this->assertDatabaseHas('refunds', [
            'id' => $refund->id,
            'status' => 'cancelled'
        ]);
    }

    /** @test */
    public function it_cannot_cancel_non_pending_refund()
    {
        $this->actingAs($this->customer, 'sanctum');

        $refund = Refund::factory()->create([
            'customer_id' => $this->customer->id,
            'order_id' => $this->order->id,
            'amount' => 500,
            'method' => 'razorpay',
            'status' => 'approved'
        ]);

        $response = $this->postJson("/api/refunds/{$refund->id}/cancel");

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Only pending refunds can be cancelled.'
            ]);
    }

    /** @test */
    public function it_can_get_refund_statistics()
    {
        $this->actingAs($this->customer, 'sanctum');

        // Create some refunds
        Refund::factory()->create([
            'customer_id' => $this->customer->id,
            'amount' => 500,
            'status' => 'pending'
        ]);

        Refund::factory()->create([
            'customer_id' => $this->customer->id,
            'amount' => 300,
            'status' => 'completed'
        ]);

        $response = $this->getJson('/api/refund-statistics');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'total_refunds',
                    'pending_refunds',
                    'completed_refunds',
                    'total_refunded_amount',
                    'active_credit_notes',
                    'total_credit_amount'
                ]
            ]);

        $data = $response->json('data');
        $this->assertEquals(2, $data['total_refunds']);
        $this->assertEquals(1, $data['pending_refunds']);
        $this->assertEquals(1, $data['completed_refunds']);
        $this->assertEquals(300, $data['total_refunded_amount']);
    }

    /** @test */
    public function it_can_process_razorpay_refund_with_mock()
    {
        // Mock Razorpay API
        $mockRazorpayRefund = (object) [
            'id' => 'ref_test_' . time(),
            'status' => 'processed',
            'amount' => 50000, // Amount in paise
            'created_at' => time(),
            'processed_at' => time(),
            'toArray' => function() {
                return [
                    'id' => 'ref_test_' . time(),
                    'status' => 'processed',
                    'amount' => 50000
                ];
            }
        ];

        $mockApi = Mockery::mock('Razorpay\Api\Api');
        $mockPayment = Mockery::mock('Razorpay\Api\Payment');
        
        $mockPayment->shouldReceive('refund')
            ->once()
            ->andReturn($mockRazorpayRefund);
            
        $mockApi->shouldReceive('payment->refund')
            ->once()
            ->andReturn($mockRazorpayRefund);

        $this->app->instance('Razorpay\Api\Api', $mockApi);

        // Create refund and transaction
        $refund = Refund::factory()->create([
            'customer_id' => $this->customer->id,
            'order_id' => $this->order->id,
            'amount' => 500,
            'method' => 'razorpay',
            'status' => 'approved'
        ]);

        $refundTransaction = RefundTransaction::factory()->create([
            'refund_id' => $refund->id,
            'gateway' => 'razorpay',
            'status' => 'processing',
            'amount' => 500
        ]);

        // Process refund
        $result = $this->razorpayService->processRefund($refundTransaction, 500, 'Test refund');

        $this->assertTrue($result['success']);
        $this->assertEquals('processed', $result['status']);
        $this->assertEquals(500, $result['amount']);
    }

    /** @test */
    public function it_handles_razorpay_refund_failure()
    {
        // Mock Razorpay API to throw exception
        $mockApi = Mockery::mock('Razorpay\Api\Api');
        $mockPayment = Mockery::mock('Razorpay\Api\Payment');
        
        $mockPayment->shouldReceive('refund')
            ->once()
            ->andThrow(new \Exception('Payment not found'));
            
        $mockApi->shouldReceive('payment->refund')
            ->once()
            ->andThrow(new \Exception('Payment not found'));

        $this->app->instance('Razorpay\Api\Api', $mockApi);

        // Create refund and transaction
        $refund = Refund::factory()->create([
            'customer_id' => $this->customer->id,
            'order_id' => $this->order->id,
            'amount' => 500,
            'method' => 'razorpay',
            'status' => 'approved'
        ]);

        $refundTransaction = RefundTransaction::factory()->create([
            'refund_id' => $refund->id,
            'gateway' => 'razorpay',
            'status' => 'processing',
            'amount' => 500
        ]);

        // Process refund
        $result = $this->razorpayService->processRefund($refundTransaction, 500, 'Test refund');

        $this->assertFalse($result['success']);
        $this->assertStringContains('Payment not found', $result['error']);
    }

    /** @test */
    public function it_can_check_razorpay_refund_status()
    {
        // Mock Razorpay API
        $mockRefund = (object) [
            'id' => 'ref_test_' . time(),
            'status' => 'processed',
            'amount' => 50000,
            'created_at' => time(),
            'processed_at' => time(),
            'toArray' => function() {
                return [
                    'id' => 'ref_test_' . time(),
                    'status' => 'processed',
                    'amount' => 50000
                ];
            }
        ];

        $mockApi = Mockery::mock('Razorpay\Api\Api');
        $mockRefundApi = Mockery::mock('Razorpay\Api\Refund');
        
        $mockRefundApi->shouldReceive('fetch')
            ->once()
            ->andReturn($mockRefund);
            
        $mockApi->shouldReceive('refund->fetch')
            ->once()
            ->andReturn($mockRefund);

        $this->app->instance('Razorpay\Api\Api', $mockApi);

        $result = $this->razorpayService->checkRefundStatus('ref_test_123');

        $this->assertTrue($result['success']);
        $this->assertEquals('processed', $result['status']);
        $this->assertEquals(500, $result['amount']); // Converted from paise
    }

    /** @test */
    public function it_can_test_razorpay_connection()
    {
        // Mock Razorpay API to return "not found" error (which means connection is working)
        $mockApi = Mockery::mock('Razorpay\Api\Api');
        $mockPayment = Mockery::mock('Razorpay\Api\Payment');
        
        $mockPayment->shouldReceive('fetch')
            ->once()
            ->andThrow(new \Exception('Payment not found'));
            
        $mockApi->shouldReceive('payment->fetch')
            ->once()
            ->andThrow(new \Exception('Payment not found'));

        $this->app->instance('Razorpay\Api\Api', $mockApi);

        $result = $this->razorpayService->testConnection();

        $this->assertTrue($result['success']);
        $this->assertEquals('Razorpay connection is working', $result['message']);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
