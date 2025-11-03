<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Vendor;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Refund;
use App\Models\CreditNote;
use App\Services\RefundService;
use Illuminate\Support\Facades\DB;

class MultiVendorRefundTest extends TestCase
{
    use RefreshDatabase;

    protected $vendor1;
    protected $vendor2;
    protected $customer;
    protected $adminUser;
    protected $vendorUser1;
    protected $vendorUser2;
    protected $refundService;

    protected function setUp(): void
    {
        parent::setUp();

        // Create vendors
        $this->vendor1 = Vendor::factory()->create([
            'business_name' => 'Vendor One Store',
            'status' => 'active',
            'is_verified' => true,
        ]);

        $this->vendor2 = Vendor::factory()->create([
            'business_name' => 'Vendor Two Store', 
            'status' => 'active',
            'is_verified' => true,
        ]);

        // Create customer
        $this->customer = Customer::factory()->create();

        // Create users
        $this->adminUser = User::factory()->create();
        $this->adminUser->assignRole('admin');

        $this->vendorUser1 = User::factory()->create(['vendor_id' => $this->vendor1->id]);
        $this->vendorUser1->assignRole('vendor_manager');

        $this->vendorUser2 = User::factory()->create(['vendor_id' => $this->vendor2->id]);
        $this->vendorUser2->assignRole('vendor_manager');

        $this->refundService = app(RefundService::class);
    }

    /** @test */
    public function test_vendor_can_only_view_their_own_refunds()
    {
        // Create sales for different vendors
        $sale1 = Sale::factory()->create([
            'vendor_id' => $this->vendor1->id,
            'customer_id' => $this->customer->id,
            'total' => 100.00,
        ]);

        $sale2 = Sale::factory()->create([
            'vendor_id' => $this->vendor2->id,
            'customer_id' => $this->customer->id,
            'total' => 200.00,
        ]);

        // Create refunds for each sale
        $refund1 = Refund::factory()->create([
            'sale_id' => $sale1->id,
            'vendor_id' => $this->vendor1->id,
            'customer_id' => $this->customer->id,
            'amount' => 50.00,
        ]);

        $refund2 = Refund::factory()->create([
            'sale_id' => $sale2->id,
            'vendor_id' => $this->vendor2->id,
            'customer_id' => $this->customer->id,
            'amount' => 75.00,
        ]);

        // Test vendor 1 user can only see their refunds
        $this->actingAs($this->vendorUser1);
        $response = $this->get(route('refunds.index'));
        $response->assertStatus(200);
        
        $refunds = $response->getOriginalContent()->getData()['page']['props']['refunds']['data'];
        $this->assertCount(1, $refunds);
        $this->assertEquals($refund1->id, $refunds[0]['id']);

        // Test vendor 2 user can only see their refunds
        $this->actingAs($this->vendorUser2);
        $response = $this->get(route('refunds.index'));
        $response->assertStatus(200);
        
        $refunds = $response->getOriginalContent()->getData()['page']['props']['refunds']['data'];
        $this->assertCount(1, $refunds);
        $this->assertEquals($refund2->id, $refunds[0]['id']);

        // Test admin can see all refunds
        $this->actingAs($this->adminUser);
        $response = $this->get(route('refunds.index'));
        $response->assertStatus(200);
        
        $refunds = $response->getOriginalContent()->getData()['page']['props']['refunds']['data'];
        $this->assertCount(2, $refunds);
    }

    /** @test */
    public function test_vendor_isolation_in_credit_notes()
    {
        // Create products for each vendor
        $product1 = Product::factory()->create(['vendor_id' => $this->vendor1->id]);
        $product2 = Product::factory()->create(['vendor_id' => $this->vendor2->id]);

        // Create sales for different vendors
        $sale1 = Sale::factory()->create([
            'vendor_id' => $this->vendor1->id,
            'customer_id' => $this->customer->id,
            'total' => 100.00,
        ]);

        $sale2 = Sale::factory()->create([
            'vendor_id' => $this->vendor2->id,
            'customer_id' => $this->customer->id,
            'total' => 200.00,
        ]);

        // Create refunds that generate credit notes
        $refundData1 = [
            'sale_id' => $sale1->id,
            'vendor_id' => $this->vendor1->id,
            'customer_id' => $this->customer->id,
            'amount' => 50.00,
            'method' => 'credit_note',
            'reason' => 'Test refund vendor 1',
        ];

        $refundData2 = [
            'sale_id' => $sale2->id,
            'vendor_id' => $this->vendor2->id,
            'customer_id' => $this->customer->id,
            'amount' => 75.00,
            'method' => 'credit_note',
            'reason' => 'Test refund vendor 2',
        ];

        $refund1 = $this->refundService->createRefundRequest($refundData1);
        $this->refundService->approveRefund($refund1);

        $refund2 = $this->refundService->createRefundRequest($refundData2);
        $this->refundService->approveRefund($refund2);

        // Verify credit notes are created with correct vendor associations
        $creditNote1 = CreditNote::where('vendor_id', $this->vendor1->id)->first();
        $creditNote2 = CreditNote::where('vendor_id', $this->vendor2->id)->first();

        $this->assertNotNull($creditNote1);
        $this->assertNotNull($creditNote2);
        $this->assertEquals(50.00, $creditNote1->amount);
        $this->assertEquals(75.00, $creditNote2->amount);

        // Verify credit notes can only be used for their respective vendors
        $vendor1CreditNotes = CreditNote::byVendor($this->vendor1->id)
            ->byCustomer($this->customer->id)
            ->usable()
            ->get();

        $vendor2CreditNotes = CreditNote::byVendor($this->vendor2->id)
            ->byCustomer($this->customer->id)
            ->usable()
            ->get();

        $this->assertCount(1, $vendor1CreditNotes);
        $this->assertCount(1, $vendor2CreditNotes);
        $this->assertEquals($this->vendor1->id, $vendor1CreditNotes->first()->vendor_id);
        $this->assertEquals($this->vendor2->id, $vendor2CreditNotes->first()->vendor_id);
    }

    /** @test */
    public function test_vendor_cannot_create_refund_for_other_vendors_sale()
    {
        $sale = Sale::factory()->create([
            'vendor_id' => $this->vendor1->id,
            'customer_id' => $this->customer->id,
            'total' => 100.00,
        ]);

        $refundData = [
            'sale_id' => $sale->id,
            'vendor_id' => $this->vendor2->id, // Different vendor
            'amount' => 50.00,
            'method' => 'credit_note',
            'reason' => 'Test refund',
        ];

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Sale does not belong to the specified vendor');

        $this->refundService->createRefundRequest($refundData);
    }

    /** @test */
    public function test_refund_authorization_policies()
    {
        $sale = Sale::factory()->create([
            'vendor_id' => $this->vendor1->id,
            'customer_id' => $this->customer->id,
            'total' => 100.00,
        ]);

        $refund = Refund::factory()->create([
            'sale_id' => $sale->id,
            'vendor_id' => $this->vendor1->id,
            'customer_id' => $this->customer->id,
            'amount' => 50.00,
            'refund_status' => 'pending',
        ]);

        // Vendor 1 user can manage their own refunds
        $this->assertTrue($refund->canBeManaged($this->vendorUser1));
        
        // Vendor 2 user cannot manage vendor 1's refunds
        $this->assertFalse($refund->canBeManaged($this->vendorUser2));
        
        // Admin can manage all refunds
        $this->assertTrue($refund->canBeManaged($this->adminUser));
    }

    /** @test */
    public function test_pos_refund_with_vendor_context()
    {
        $product = Product::factory()->create([
            'vendor_id' => $this->vendor1->id,
            'price' => 25.00,
        ]);

        // Create a POS sale
        $sale = Sale::factory()->create([
            'vendor_id' => $this->vendor1->id,
            'customer_id' => $this->customer->id,
            'total' => 100.00,
            'status' => 'completed',
        ]);

        $saleItem = SaleItem::factory()->create([
            'sale_id' => $sale->id,
            'product_id' => $product->id,
            'quantity' => 4,
            'price' => 25.00,
            'line_total' => 100.00,
        ]);

        // Mock POS return data
        $returnData = [
            'items' => [
                [
                    'sale_item_id' => $saleItem->id,
                    'quantity' => 2, // Return 2 out of 4 items
                ]
            ],
            'reason' => 'Customer return'
        ];

        // Act as vendor user
        $this->actingAs($this->vendorUser1);

        // Process return via POS controller
        $response = $this->post(route('pos.sales.return', $sale->id), $returnData);
        
        $response->assertStatus(200);
        $responseData = $response->json();
        
        $this->assertArrayHasKey('returnId', $responseData);
        $this->assertEquals(50.00, $responseData['refundTotal']);

        // Verify refund was created with vendor context
        $refund = Refund::where('sale_id', $sale->id)->first();
        $this->assertNotNull($refund);
        $this->assertEquals($this->vendor1->id, $refund->vendor_id);
        $this->assertEquals('completed', $refund->refund_status);
        $this->assertEquals(50.00, $refund->amount);

        // Verify credit note was created for the correct vendor
        $creditNote = CreditNote::where('refund_id', $refund->id)->first();
        $this->assertNotNull($creditNote);
        $this->assertEquals($this->vendor1->id, $creditNote->vendor_id);
        $this->assertEquals(50.00, $creditNote->remaining_amount);
    }

    /** @test */
    public function test_vendor_specific_statistics()
    {
        // Create refunds for vendor 1
        Refund::factory()->count(3)->create([
            'vendor_id' => $this->vendor1->id,
            'customer_id' => $this->customer->id,
            'refund_status' => 'completed',
            'amount' => 100.00,
        ]);

        // Create refunds for vendor 2
        Refund::factory()->count(2)->create([
            'vendor_id' => $this->vendor2->id,
            'customer_id' => $this->customer->id,
            'refund_status' => 'completed',
            'amount' => 150.00,
        ]);

        $vendor1Stats = $this->vendor1->getRefundStatistics();
        $vendor2Stats = $this->vendor2->getRefundStatistics();

        $this->assertEquals(3, $vendor1Stats['total_refunds']);
        $this->assertEquals(300.00, $vendor1Stats['total_refunded_amount']);

        $this->assertEquals(2, $vendor2Stats['total_refunds']);
        $this->assertEquals(300.00, $vendor2Stats['total_refunded_amount']);
    }

    /** @test */
    public function test_high_value_refund_requires_additional_approval()
    {
        $sale = Sale::factory()->create([
            'vendor_id' => $this->vendor1->id,
            'customer_id' => $this->customer->id,
            'total' => 2000.00,
        ]);

        $refund = Refund::factory()->create([
            'sale_id' => $sale->id,
            'vendor_id' => $this->vendor1->id,
            'customer_id' => $this->customer->id,
            'amount' => 1500.00, // High value refund
            'refund_status' => 'pending',
        ]);

        // High value refund should require vendor approval
        $this->assertTrue($refund->requiresVendorApproval());

        // Vendor manager can approve, but admin approval may still be required
        $this->actingAs($this->vendorUser1);
        $this->assertTrue($this->vendorUser1->can('approve', $refund));
    }

    protected function tearDown(): void
    {
        parent::tearDown();
    }
}