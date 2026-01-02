<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Customer;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\SaleReturn;
use App\Models\SaleReturnItem;
use App\Models\CreditNote;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class POSRefundTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test complete POS refund flow with credit note creation
     */
    public function test_pos_refund_creates_credit_note_and_restores_stock()
    {
        $this->actingAs(User::factory()->create());
        // Create a customer
        $customer = Customer::factory()->create([
            'name' => 'Test Customer',
            'email' => 'test@example.com',
        ]);

        // Create a product with variants
        $product = Product::factory()->create([
            'name' => 'Test Product',
            'price' => 1000,
            'stock_quantity' => 10,
        ]);

        $variant = ProductVariant::factory()->create([
            'product_id' => $product->id,
            'price' => 1200,
            'stock_quantity' => 5,
        ]);

        // Create a sale
        $sale = Sale::factory()->create([
            'customer_id' => $customer->id,
            'invoice_number' => 'INV-000001',
            'status' => 'completed',
            'subtotal' => 2400,
            'tax_amount' => 0,
            'total' => 2400,
            'paid_total' => 2400,
        ]);

        $initialStock = 5;
        $saleItem = SaleItem::factory()->create([
            'sale_id' => $sale->id,
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'name' => 'Test Product Variant',
            'sku' => 'SKU-001',
            'quantity' => 2,
            'price' => 1200,
            'line_total' => 2400,
        ]);

        // Simulate stock deduction
        $variant->decrement('stock_quantity', 2);
        $this->assertEquals(3, $variant->fresh()->stock_quantity);

        // Process return
        $response = $this->postJson("/pos/sales/{$sale->id}/return", [
            'items' => [
                [
                    'sale_item_id' => $saleItem->id,
                    'quantity' => 2,
                ],
            ],
            'reason' => 'Defective product',
        ]);

        $response->assertStatus(200);
        $responseData = $response->json();

        // Verify sale return was created
        $this->assertDatabaseHas('sale_returns', [
            'sale_id' => $sale->id,
            'refund_total' => 2400,
        ]);

        $saleReturn = SaleReturn::where('sale_id', $sale->id)->first();
        $this->assertNotNull($saleReturn);

        // Verify return items were created
        $this->assertDatabaseHas('sale_return_items', [
            'sale_return_id' => $saleReturn->id,
            'sale_item_id' => $saleItem->id,
            'quantity' => 2,
            'amount' => 2400,
        ]);

        // Verify stock was restored
        $this->assertEquals(5, $variant->fresh()->stock_quantity);

        // Verify refund and credit note were created via unified RefundService
        $this->assertDatabaseHas('refunds', [
            'sale_id' => $sale->id,
            'refund_status' => 'completed',
            'amount' => 2400,
        ]);

        // Verify credit note was created
        $this->assertDatabaseHas('credit_notes', [
            'customer_id' => $customer->id,
            'sale_id' => $sale->id,
            'sale_return_id' => $saleReturn->id,
            'amount' => 2400,
            'remaining_amount' => 2400,
            'status' => 'active',
        ]);

        $creditNote = CreditNote::where('sale_id', $sale->id)->first();
        $this->assertNotNull($creditNote);
        $this->assertEquals(2400, $creditNote->amount);
        $this->assertEquals(2400, $creditNote->remaining_amount);
    }

    /**
     * Test partial refund
     */
    public function test_partial_refund_process()
    {
        $this->actingAs(User::factory()->create());
        $customer = Customer::factory()->create();
        $product = Product::factory()->create(['stock_quantity' => 10]);
        $variant = ProductVariant::factory()->create(['product_id' => $product->id, 'stock_quantity' => 10]);

        $sale = Sale::factory()->create([
            'customer_id' => $customer->id,
            'status' => 'completed',
        ]);

        // Create sale items
        $saleItem1 = SaleItem::factory()->create([
            'sale_id' => $sale->id,
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'quantity' => 5,
            'price' => 1000,
        ]);

        $saleItem2 = SaleItem::factory()->create([
            'sale_id' => $sale->id,
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'quantity' => 3,
            'price' => 1000,
        ]);

        $variant->decrement('stock_quantity', 8);

        // Process partial return (only 5 items)
        $response = $this->postJson("/pos/sales/{$sale->id}/return", [
            'items' => [
                [
                    'sale_item_id' => $saleItem1->id,
                    'quantity' => 5,
                ],
            ],
            'reason' => 'Partial return',
        ]);

        $response->assertStatus(200);

        // Verify only partial credit was issued and refund recorded
        $this->assertDatabaseHas('refunds', [
            'sale_id' => $sale->id,
            'refund_status' => 'completed',
            'amount' => 5000,
        ]);

        // Verify only partial credit was issued
        $this->assertDatabaseHas('credit_notes', [
            'sale_id' => $sale->id,
            'amount' => 5000,
        ]);

        // Stock should be partially restored
        $this->assertEquals(5, $variant->fresh()->stock_quantity);
    }

    /**
     * Test using credit note for payment
     */
    public function test_using_credit_note_for_payment()
    {
        $this->actingAs(User::factory()->create());
        $customer = Customer::factory()->create();

        // Create credit note
        $creditNote = CreditNote::factory()->create([
            'customer_id' => $customer->id,
            'amount' => 1000,
            'remaining_amount' => 1000,
            'status' => 'active',
        ]);

        $product = Product::factory()->create(['stock_quantity' => 10]);

        $paymentAmount = 600;

        // Use credit note for payment
        $creditNotes = CreditNote::where('customer_id', $customer->id)
            ->where('status', 'active')
            ->where('remaining_amount', '>', 0)
            ->orderBy('created_at')
            ->get();

        $toUseAmount = $paymentAmount;
        foreach ($creditNotes as $note) {
            if ($toUseAmount <= 0) break;
            $apply = min($note->remaining_amount, $toUseAmount);
            $note->remaining_amount -= $apply;
            if ($note->remaining_amount <= 0.001) {
                $note->status = 'used';
                $note->remaining_amount = 0;
            }
            $note->save();
            $toUseAmount -= $apply;
        }

        // Verify credit note was updated
        $creditNote->refresh();
        $this->assertEquals(400, $creditNote->remaining_amount);
        $this->assertEquals('active', $creditNote->status);

        // Test using remaining credit
        $paymentAmount = 500;
        $creditNotes = CreditNote::where('customer_id', $customer->id)
            ->where('status', 'active')
            ->where('remaining_amount', '>', 0)
            ->orderBy('created_at')
            ->get();

        $toUseAmount = $paymentAmount;
        foreach ($creditNotes as $note) {
            if ($toUseAmount <= 0) break;
            $apply = min($note->remaining_amount, $toUseAmount);
            $note->remaining_amount -= $apply;
            if ($note->remaining_amount <= 0.001) {
                $note->status = 'used';
                $note->remaining_amount = 0;
            }
            $note->save();
            $toUseAmount -= $apply;
        }

        // Verify credit note is now used
        $creditNote->refresh();
        $this->assertEquals(0, $creditNote->remaining_amount);
        $this->assertEquals('used', $creditNote->status);
    }
}

