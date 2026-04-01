<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Refund;
use App\Models\RefundTransaction;
use App\Services\RazorpayRefundService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Mockery;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class RazorpayRefundTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $customer;

    protected $order;

    protected $payment;

    protected $razorpayService;

    protected function initTestCase(): void
    {
        // Create test customer
        $this->customer = Customer::factory()->create([
            'name' => 'Test Customer',
            'email' => 'test@example.com',
            'phone' => '9876543210',
        ]);

        // Create test product
        $product = Product::factory()->create([
            'name' => 'Test Product',
            'price' => 1000,
        ]);

        // Create test order
        $this->order = Order::factory()->create([
            'customer_id' => $this->customer->id,
            'order_id' => 'ORD-'.now()->format('YmdHis').'-'.bin2hex(random_bytes(5)),
            'total_amount' => 1000,
            'payment_method' => 'razorpay',
            'payment_status' => 'paid',
            'status' => 'delivered',
            'transaction_id' => 'rzp_test_order_123',
        ]);

        // Create test order item
        OrderItem::factory()->create([
            'order_id' => $this->order->id,
            'product_id' => $product->id,
            'quantity' => 1,
            'price' => 1000,
        ]);

        // Create test payment
        $this->payment = Payment::factory()->create([
            'customer_id' => $this->customer->id,
            'order_id' => $this->order->order_id,
            'rzorder_id' => 'rzp_test_order_123',
            'payment_id' => 'pay_123',
            'status' => 'captured',
            'amount' => 1000,
            'method' => 'razorpay',
        ]);

        // Set up fresh internal service instance
        $this->razorpayService = new RazorpayRefundService;
    }

    #[Test]
    public function it_can_validate_razorpay_refund_eligibility()
    {
        $this->initTestCase();
        $validation = $this->razorpayService->validateRefundEligibility($this->payment, 500);

        $this->assertTrue($validation['eligible']);
        $this->assertEquals(1000, $validation['original_amount']);
        $this->assertEquals(0, $validation['total_refunded']);
        $this->assertEquals(1000, $validation['remaining_refundable']);
    }

    #[Test]
    public function it_rejects_refund_for_non_captured_payment()
    {
        $this->initTestCase();
        $this->payment->update(['status' => 'authorized']);

        $validation = $this->razorpayService->validateRefundEligibility($this->payment, 500);

        $this->assertFalse($validation['eligible']);
        $this->assertEquals('Payment not captured', $validation['reason']);
    }

    #[Test]
    public function it_rejects_refund_exceeding_remaining_amount()
    {
        $this->initTestCase();
        $validation = $this->razorpayService->validateRefundEligibility($this->payment, 1500);

        $this->assertFalse($validation['eligible']);
        $this->assertEquals('Refund amount exceeds remaining refundable amount', $validation['reason']);
        $this->assertEquals(1000, $validation['max_refundable']);
    }

    #[Test]
    public function it_rejects_refund_for_fully_refunded_payment()
    {
        $this->initTestCase();
        $this->payment->update(['refunded_amount' => 1000]);

        $validation = $this->razorpayService->validateRefundEligibility($this->payment, 500);

        $this->assertFalse($validation['eligible']);
        $this->assertEquals('Payment already fully refunded', $validation['reason']);
    }

    #[Test]
    public function it_can_create_refund_request_via_api()
    {
        $this->initTestCase();
        $this->withoutExceptionHandling();
        Sanctum::actingAs($this->customer, ['customer']);

        $refundData = [
            'order_id' => $this->order->order_id,
            'amount' => 500.00,
            'method' => 'razorpay',
            'reason' => 'Product defect',
            'items' => [
                [
                    'product_id' => $this->order->productItems->first()->product_id,
                    'quantity' => 1,
                    'reason' => 'Product defect',
                ],
            ],
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
                    'refund_status',
                    'reason',
                    'reference',
                ],
            ]);

        $this->assertDatabaseHas('refunds', [
            'order_id' => $this->order->order_id,
            'customer_id' => $this->customer->id,
            'amount' => 500,
            'method' => 'razorpay',
            'refund_status' => 'pending',
        ]);
    }

    #[Test]
    public function it_validates_razorpay_eligibility_before_creating_refund()
    {
        $this->initTestCase();
        Sanctum::actingAs($this->customer, ['customer']);

        // Make payment non-refundable
        $this->payment->update(['status' => 'authorized']);

        $refundData = [
            'order_id' => $this->order->order_id,
            'amount' => 500,
            'method' => 'razorpay',
            'reason' => 'Product defect',
        ];

        $response = $this->postJson('/api/refunds', $refundData);

        $response->assertStatus(400);
        $this->assertFalse($response->json('success'));
    }

    #[Test]
    public function it_can_check_razorpay_eligibility_via_api()
    {
        $this->initTestCase();
        Sanctum::actingAs($this->customer, ['customer']);

        $response = $this->getJson('/api/refunds/check-razorpay-eligibility?order_id='.$this->order->id);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'eligible',
                    'original_amount',
                    'total_refunded',
                    'remaining_refundable',
                ],
            ]);

        $this->assertTrue($response->json('data.eligible'));
    }

    #[Test]
    public function it_rejects_razorpay_eligibility_for_non_razorpay_orders()
    {
        $this->initTestCase();
        Sanctum::actingAs($this->customer, ['customer']);

        $this->order->update(['payment_method' => 'cod']);

        $response = $this->getJson('/api/refunds/check-razorpay-eligibility?order_id='.$this->order->id);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Order was not paid via Razorpay',
            ]);
    }

    #[Test]
    public function it_can_get_customer_refunds()
    {
        $this->initTestCase();
        Sanctum::actingAs($this->customer, ['customer']);

        // Create a refund
        Refund::factory()->create([
            'customer_id' => $this->customer->id,
            'order_id' => $this->order->order_id,
            'amount' => 500,
            'method' => 'razorpay',
            'refund_status' => 'pending',
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
                            'reference',
                        ],
                    ],
                ],
            ]);
    }

    #[Test]
    public function it_can_cancel_pending_refund()
    {
        $this->initTestCase();
        Sanctum::actingAs($this->customer, ['customer']);

        $refund = Refund::factory()->create([
            'customer_id' => $this->customer->id,
            'order_id' => $this->order->order_id,
            'amount' => 500,
            'method' => 'razorpay',
            'refund_status' => 'pending',
        ]);

        $response = $this->postJson("/api/refunds/{$refund->id}/cancel");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Refund request cancelled successfully.',
            ]);

        $this->assertDatabaseHas('refunds', [
            'id' => $refund->id,
            'refund_status' => 'cancelled',
        ]);
    }

    #[Test]
    public function it_cannot_cancel_non_pending_refund()
    {
        $this->initTestCase();
        Sanctum::actingAs($this->customer, ['customer']);

        $refund = Refund::factory()->create([
            'customer_id' => $this->customer->id,
            'order_id' => $this->order->order_id,
            'amount' => 500,
            'method' => 'razorpay',
            'refund_status' => 'approved',
        ]);

        $response = $this->postJson("/api/refunds/{$refund->id}/cancel");

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Only pending refunds can be cancelled.',
            ]);
    }

    #[Test]
    public function it_can_get_refund_statistics()
    {
        $this->initTestCase();
        Sanctum::actingAs($this->customer, ['customer']);

        // Create some refunds
        Refund::factory()->create([
            'customer_id' => $this->customer->id,
            'amount' => 500,
            'refund_status' => 'pending',
        ]);

        Refund::factory()->create([
            'customer_id' => $this->customer->id,
            'amount' => 300,
            'refund_status' => 'completed',
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
                    'total_credit_amount',
                ],
            ]);

        $data = $response->json('data');
        $this->assertEquals(2, $data['total_refunds']);
        $this->assertEquals(1, $data['pending_refunds']);
        $this->assertEquals(1, $data['completed_refunds']);
        $this->assertEquals(300, $data['total_refunded_amount']);
    }

    #[Test]
    public function it_can_process_razorpay_refund_with_mock()
    {
        $this->initTestCase();
        // Mock Razorpay Refund object
        $refundId = 'ref_test_'.time();

        // Use an anonymous class that behaves like the Razorpay Refund entity
        $mockRazorpayRefund = new class($refundId)
        {
            public string $id;

            public string $status = 'processed';

            public int $amount = 50000;

            public function __construct(string $id)
            {
                $this->id = $id;
            }

            public function toArray(): array
            {
                return [
                    'id' => $this->id,
                    'status' => $this->status,
                    'amount' => $this->amount,
                ];
            }
        };

        $mockApi = Mockery::mock('Razorpay\Api\Api')->makePartial();
        $mockPayment = Mockery::mock();

        $mockApi->payment = $mockPayment;
        $mockPayment->shouldReceive('fetch')->with('pay_123')->andReturn($mockPayment);
        $mockPayment->shouldReceive('refund')->once()->with(Mockery::on(function ($data) {
            return (int) $data['amount'] === 50000;
        }))->andReturn($mockRazorpayRefund);

        $this->app->instance('Razorpay\Api\Api', $mockApi);
        $this->razorpayService = new RazorpayRefundService($mockApi);

        // Create refund and transaction
        $refund = Refund::factory()->create([
            'customer_id' => $this->customer->id,
            'order_id' => $this->order->order_id,
            'amount' => 500,
            'method' => 'razorpay',
            'refund_status' => 'approved',
        ]);

        $refundTransaction = RefundTransaction::factory()->create([
            'refund_id' => $refund->id,
            'gateway' => 'razorpay',
            'status' => 'processing',
            'amount' => 500,
        ]);

        // Process refund
        $result = $this->razorpayService->processRefund($refundTransaction, 500, 'Test refund');

        $this->assertTrue($result['success']);
        $this->assertEquals('processed', $result['status']);
        $this->assertEquals(500, $result['amount']);
    }

    #[Test]
    public function it_handles_razorpay_refund_failure()
    {
        $this->initTestCase();
        // Mock Razorpay API to throw exception
        $mockApi = Mockery::mock('Razorpay\Api\Api')->makePartial();
        $mockPayment = Mockery::mock();

        $mockApi->payment = $mockPayment;
        $mockPayment->shouldReceive('fetch')->with('pay_123')->andReturn($mockPayment);
        $mockPayment->shouldReceive('refund')->once()->andThrow(new \Exception('Payment not found'));

        $this->app->instance('Razorpay\Api\Api', $mockApi);
        $this->razorpayService = new RazorpayRefundService($mockApi);

        // Create refund and transaction
        $refund = Refund::factory()->create([
            'customer_id' => $this->customer->id,
            'order_id' => $this->order->order_id,
            'amount' => 500,
            'method' => 'razorpay',
            'refund_status' => 'approved',
        ]);

        $refundTransaction = RefundTransaction::factory()->create([
            'refund_id' => $refund->id,
            'gateway' => 'razorpay',
            'status' => 'processing',
            'amount' => 500,
        ]);

        // Process refund
        $result = $this->razorpayService->processRefund($refundTransaction, 500, 'Test refund');

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('Payment not found', $result['error']);
    }

    #[Test]
    public function it_can_check_razorpay_refund_status()
    {
        $this->initTestCase();
        // Mock Razorpay Refund object
        $refundId = 'ref_test_'.time();
        $now = time();

        // Use an anonymous class for the Razorpay Refund entity
        $mockRefund = new class($refundId, $now)
        {
            public string $id;

            public string $status = 'processed';

            public int $amount = 50000;

            public int $created_at;

            public int $processed_at;

            public function __construct(string $id, int $ts)
            {
                $this->id = $id;
                $this->created_at = $ts;
                $this->processed_at = $ts;
            }

            public function toArray(): array
            {
                return [
                    'id' => $this->id,
                    'status' => $this->status,
                    'amount' => $this->amount,
                ];
            }
        };

        $mockApi = Mockery::mock('Razorpay\Api\Api')->makePartial();
        $mockRefundApi = Mockery::mock();

        $mockApi->refund = $mockRefundApi;
        $mockRefundApi->shouldReceive('fetch')->with('ref_test_123')->andReturn($mockRefund);

        $this->app->instance('Razorpay\Api\Api', $mockApi);
        $this->razorpayService = new RazorpayRefundService($mockApi);

        $result = $this->razorpayService->checkRefundStatus('ref_test_123');

        $this->assertTrue($result['success']);
        $this->assertEquals('processed', $result['status']);
        $this->assertEquals(500, $result['amount']); // Converted from paise
    }

    #[Test]
    public function it_can_test_razorpay_connection()
    {
        $this->initTestCase();
        // Mock Razorpay API to return "not found" error (which means connection is working)
        $mockApi = Mockery::mock('Razorpay\Api\Api')->makePartial();
        $mockPayment = Mockery::mock();

        $mockApi->payment = $mockPayment;
        $mockPayment->shouldReceive('fetch')->andThrow(new \Exception('Payment not found'));

        $this->app->instance('Razorpay\Api\Api', $mockApi);
        $this->razorpayService = new RazorpayRefundService($mockApi);

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
