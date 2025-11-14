<?php

namespace App\Services;

use App\Models\Refund;
use App\Models\RefundItem;
use App\Models\RefundTransaction;
use App\Models\CreditNote;
use App\Models\Sale;
use App\Models\Order;
use App\Models\SaleReturn;
use App\Models\SaleReturnItem;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Vendor;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class RefundService
{
    /**
     * Create a refund request
     */
    public function createRefundRequest(array $data): Refund
    {
        return DB::transaction(function () use ($data) {
            // Determine source transaction
            $sourceTransaction = $this->getSourceTransaction($data);
            $customer = $this->getCustomer($data, $sourceTransaction);
            $vendor = $this->getVendor($data, $sourceTransaction);

            // Validate refund eligibility
            $this->validateRefundEligibility($sourceTransaction, $data['amount']);
            
            // Validate vendor permissions
            $this->validateVendorPermissions($vendor, $sourceTransaction);
        
            // Create refund record
            $refund = Refund::create([
                'sale_id' => $data['sale_id'] ?? null,
                'order_id' => $data['order_id'] ?? null,
                'sale_return_id' => $data['sale_return_id'] ?? null,
                'customer_id' => $customer->id,
                'vendor_id' => $vendor?->id,
                'amount' => $data['amount'],
                'method' => $data['method'] ?? 'credit_note',
                'refund_status' => 'pending',
                'reason' => $data['reason'] ?? 'Customer return',
                'admin_notes' => $data['admin_notes'] ?? null,
                'reference' => $this->generateRefundReference(),
                'requested_at' => now(),
            ]);

            // Create refund items
            if (isset($data['items']) && is_array($data['items'])) {
                $this->createRefundItems($refund, $data['items'], $vendor?->id);
            }

            // Notify customer: requested
            if (class_exists(\App\Services\NotificationService::class)) {
                app(\App\Services\NotificationService::class)->sendRefundStatusNotification($refund, 'requested');
            }
            
            return $refund;
        });
    }

    /**
     * Approve a refund request
     */
    public function approveRefund(Refund $refund, array $data = []): Refund
    {
        // Validation checks
        if ($refund->refund_status !== 'pending') {
            throw new \InvalidArgumentException("Refund is not in pending status. Current status: {$refund->refund_status}");
        }

        if (!Auth::id()) {
            throw new \InvalidArgumentException('No authenticated user found');
        }

        // Additional business logic validation
        $sourceTransaction = $refund->sale ?? $refund->order;
        if ($sourceTransaction) {
            $totalRefunded = $sourceTransaction->refunds()
                ->where('id', '!=', $refund->id)
                ->where('refund_status', '!=', 'rejected')
                ->sum('amount');
            
            $maxRefundable = $sourceTransaction->total ?? $sourceTransaction->total_amount ?? 0;
            
            if (($totalRefunded + $refund->amount) > $maxRefundable) {
                throw new \InvalidArgumentException('Refund amount would exceed the maximum refundable amount');
            }
        }

        return DB::transaction(function () use ($refund, $data) {
            try {
                $refund->update([
                    'refund_status' => 'approved',
                    'approved_at' => now(),
                    'processed_by' => Auth::id(),
                    'admin_notes' => $data['admin_notes'] ?? $refund->admin_notes,
                ]);

                // Notify customer: approved
                if (class_exists(\App\Services\NotificationService::class)) {
                    app(\App\Services\NotificationService::class)->sendRefundStatusNotification($refund, 'approved');
                }

                // Process refund based on method
                $this->processRefund($refund);

                return $refund->fresh();
            } catch (\Exception $e) {
                // Log the error for debugging
                \Log::error('Refund approval failed in service', [
                    'refund_id' => $refund->id,
                    'error' => $e->getMessage(),
                    'data' => $data
                ]);
                throw $e;
            }
        });
    }

    /**
     * Reject a refund request
     */
    public function rejectRefund(Refund $refund, string $reason, array $data = []): Refund
    {
        return DB::transaction(function () use ($refund, $reason, $data) {
            $refund->update([
                'refund_status' => 'rejected',
                'rejection_reason' => $reason,
                'processed_by' => Auth::id(),
                'admin_notes' => $data['admin_notes'] ?? $refund->admin_notes,
            ]);

            // Notify customer: rejected
            app(\App\Services\NotificationService::class)->sendRefundStatusNotification($refund, 'rejected');

            return $refund->fresh();
        });
    }

    /**
     * Process refund based on method
     */
    public function processRefund(Refund $refund): Refund
    {
        return DB::transaction(function () use ($refund) {
            $refund->update(['refund_status' => 'processing', 'processed_at' => now()]);

            if ($refund->method === 'credit_note') {
                $this->processCreditNoteRefund($refund);
            } else {
                $this->processMoneyRefund($refund);
            }

            $refund->update([
                'refund_status' => 'completed',
                'completed_at' => now(),
                'paid_at' => now(),
            ]);

            // Notify customer: completed (type-sensitive)
            $event = $refund->method === 'credit_note' ? 'completed_credit_note' : 'completed_money';
            app(\App\Services\NotificationService::class)->sendRefundStatusNotification($refund, $event);

            // Update source transaction
            $this->updateSourceTransaction($refund);

            return $refund->fresh();
        });
    }

    /**
     * Process credit note refund
     */
    protected function processCreditNoteRefund(Refund $refund): CreditNote
    {
        $creditNote = CreditNote::create([
            'sale_id' => $refund->sale_id,
            'order_id' => $refund->order_id,
            'sale_return_id' => $refund->sale_return_id,
            'refund_id' => $refund->id,
            'customer_id' => $refund->customer_id,
            'vendor_id' => $refund->vendor_id,
            'credit_note_number' => $this->generateCreditNoteNumber(),
            'amount' => $refund->amount,
            'used_amount' => 0,
            'remaining_amount' => $refund->amount,
            'reference' => $this->generateCreditNoteReference(),
            'status' => 'active',
            'issued_at' => now()->toDateString(),
            'expires_at' => now()->addYear()->toDateString(), // 1 year expiry
            'notes' => 'Auto-generated from refund: ' . $refund->reference,
        ]);

        $refund->update(['credit_note_id' => $creditNote->id]);

        return $creditNote;
    }

    /**
     * Process money refund
     */
    protected function processMoneyRefund(Refund $refund): RefundTransaction
    {
        $transaction = RefundTransaction::create([
            'refund_id' => $refund->id,
            'transaction_id' => $this->generateTransactionId(),
            'gateway' => $refund->method,
            'status' => 'processing',
            'amount' => $refund->amount,
            'processed_at' => now(),
        ]);

        // Process refund based on gateway
        if ($refund->method === 'razorpay') {
            $this->processRazorpayRefund($transaction);
        } else {
            // For other gateways or manual refunds
            $this->simulateGatewayRefund($transaction);
        }

        return $transaction;
    }

    /**
     * Process Razorpay refund
     */
    protected function processRazorpayRefund(RefundTransaction $transaction): void
    {
        try {
            $razorpayService = app(\App\Services\RazorpayRefundService::class);

            $result = $razorpayService->processRefund(
                $transaction,
                $transaction->amount,
                $transaction->refund->reason
            );

            if ($result['success']) {
                $transaction->update([
                    'status' => $result['status'],
                    'gateway_transaction_id' => $result['refund_id'],
                    'gateway_refund_id' => $result['refund_id'],
                    'gateway_response' => json_encode($result['gateway_response']),
                    'completed_at' => $result['processed_at'],
                ]);
            } else {
                $transaction->update([
                    'status' => 'failed',
                    'gateway_response' => json_encode(['error' => $result['error']]),
                    'completed_at' => now(),
                ]);
            }
        } catch (\Exception $e) {
            $transaction->update([
                'status' => 'failed',
                'gateway_response' => json_encode(['error' => $e->getMessage()]),
                'completed_at' => now(),
            ]);
        }
    }

    /**
     * Simulate gateway refund (replace with actual gateway integration)
     */
    protected function simulateGatewayRefund(RefundTransaction $transaction): void
    {
        // Simulate processing delay
        sleep(1);

        $transaction->update([
            'status' => 'completed',
            'gateway_transaction_id' => 'TXN_' . Str::random(10),
            'gateway_refund_id' => 'REF_' . Str::random(10),
            'completed_at' => now(),
        ]);
    }

    /**
     * Update source transaction with refund information
     */
    protected function updateSourceTransaction(Refund $refund): void
    {
        if ($refund->sale) {
            $this->updateSaleRefundStatus($refund->sale, $refund->amount);
        }

        if ($refund->order) {
            $this->updateOrderRefundStatus($refund->order, $refund->amount);
        }
    }

    /**
     * Update sale refund status
     */
    protected function updateSaleRefundStatus(Sale $sale, float $refundAmount): void
    {
        $totalRefunded = $sale->refunds()->sum('amount');
        $sale->update([
            'refunded_amount' => $totalRefunded,
            'refund_status' => $totalRefunded >= $sale->total ? 'full' : 'partial',
            'last_refund_at' => now(),
        ]);
    }

    /**
     * Update order refund status
     */
    protected function updateOrderRefundStatus(Order $order, float $refundAmount): void
    {
        $totalRefunded = $order->refunds()->sum('amount');
        $order->update([
            'refunded_amount' => $totalRefunded,
            'refund_status' => $totalRefunded >= $order->total_amount ? 'full' : 'partial',
            'last_refund_at' => now(),
        ]);
    }

    /**
     * Create refund items
     */
    protected function createRefundItems(Refund $refund, array $items, ?int $vendorId = null): void
    {
        foreach ($items as $item) {
            RefundItem::create([
                'refund_id' => $refund->id,
                'vendor_id' => $vendorId,
                'sale_return_item_id' => $item['sale_return_item_id'] ?? null,
                'order_item_id' => $item['order_item_id'] ?? null,
                'product_id' => $item['product_id'],
                'product_variant_id' => $item['product_variant_id'] ?? null,
                'quantity' => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'total_amount' => $item['total_amount'],
                'reason' => $item['reason'] ?? null,
            ]);
        }
    }

    /**
     * Get source transaction
     */
    protected function getSourceTransaction(array $data)
    {
        if (isset($data['sale_id'])) {
            return Sale::findOrFail($data['sale_id']);
        }

        if (isset($data['order_id'])) {
            return Order::where('order_id', $data['order_id'])
            ->where('customer_id', Auth::id())
            ->firstOrFail();
        }

        throw new \InvalidArgumentException('Either sale_id or order_id must be provided');
    }

    /**
     * Get customer from data or source transaction
     */
    protected function getCustomer(array $data, $sourceTransaction)
    {
        if (isset($data['customer_id'])) {
            return \App\Models\Customer::findOrFail($data['customer_id']);
        }

        if ($sourceTransaction instanceof Sale) {
            return $sourceTransaction->customer;
        }

        if ($sourceTransaction instanceof Order) {
            return $sourceTransaction->customer;
        }

        throw new \InvalidArgumentException('Customer information not found');
    }

    /**
     * Validate refund eligibility
     */
    protected function validateRefundEligibility($sourceTransaction, float $amount): void
    {
        $totalRefunded = $sourceTransaction->refunds()->sum('amount');
        $maxRefundable = $sourceTransaction->total ?? $sourceTransaction->total_amount;

        if ($totalRefunded + $amount > $maxRefundable) {
            throw new \InvalidArgumentException('Refund amount exceeds maximum refundable amount');
        }

        if ($amount <= 0) {
            throw new \InvalidArgumentException('Refund amount must be greater than zero');
        }
    }

    /**
     * Generate refund reference
     */
    protected function generateRefundReference(): string
    {
        return 'REF-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6));
    }

    /**
     * Generate credit note reference
     */
    protected function generateCreditNoteReference(): string
    {
        return 'CN-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6));
    }

    /**
     * Generate transaction ID
     */
    protected function generateTransactionId(): string
    {
        return 'TXN-' . now()->format('YmdHis') . '-' . strtoupper(Str::random(4));
    }

    /**
     * Generate credit note number
     */
    protected function generateCreditNoteNumber(): string
    {
        $prefix = 'CN';
        $dateCode = now()->format('Ymd');
        $sequence = str_pad((CreditNote::max('id') ?? 0) + 1, 4, '0', STR_PAD_LEFT);
        
        return "{$prefix}-{$dateCode}-{$sequence}";
    }

    /**
     * Get vendor from data or source transaction
     */
    protected function getVendor(array $data, $sourceTransaction): ?Vendor
    {
        if (isset($data['vendor_id'])) {
            return Vendor::find($data['vendor_id']);
        }

        if ($sourceTransaction instanceof Sale && $sourceTransaction->vendor_id) {
            return $sourceTransaction->vendor;
        }

        if ($sourceTransaction instanceof Order && $sourceTransaction->vendor_id) {
            return $sourceTransaction->vendor;
        }

        return null;
    }

    /**
     * Validate vendor permissions
     */
    protected function validateVendorPermissions(?Vendor $vendor, $sourceTransaction): void
    {
        // If we have a vendor, ensure the source transaction belongs to them
        if ($vendor) {
            if ($sourceTransaction instanceof Sale && $sourceTransaction->vendor_id !== $vendor->id) {
                throw new \InvalidArgumentException('Sale does not belong to the specified vendor');
            }

            if ($sourceTransaction instanceof Order && $sourceTransaction->vendor_id !== $vendor->id) {
                throw new \InvalidArgumentException('Order does not belong to the specified vendor');
            }
        }

        // For multi-vendor systems, ensure we have vendor context
        if ($sourceTransaction instanceof Sale && $sourceTransaction->vendor_id && !$vendor) {
            throw new \InvalidArgumentException('Vendor context required for this sale');
        }

        if ($sourceTransaction instanceof Order && $sourceTransaction->vendor_id && !$vendor) {
            throw new \InvalidArgumentException('Vendor context required for this order');
        }
    }

    /**
     * Get refund statistics
     */
    public function getRefundStatistics(): array
    {
        return [
            'total_refunds' => Refund::count(),
            'pending_refunds' => Refund::pending()->count(),
            'approved_refunds' => Refund::approved()->count(),
            'completed_refunds' => Refund::completed()->count(),
            'total_refunded_amount' => Refund::completed()->sum('amount'),
            'credit_note_refunds' => Refund::whereNotNull('credit_note_id')->count(),
            'money_refunds' => Refund::whereNull('credit_note_id')->where('method', 'money')->count(),
        ];
    }
}
