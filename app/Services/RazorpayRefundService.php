<?php

namespace App\Services;

use Razorpay\Api\Api;
use App\Models\RefundTransaction;
use App\Models\Payment;
use App\Models\Order;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class RazorpayRefundService
{
    protected $api;
    protected $keyId;
    protected $keySecret;

    public function __construct()
    {
        $this->keyId = env('RAZOR_KEY_ID');
        $this->keySecret = env('RAZOR_KEY_SECRET');
        $this->api = new Api($this->keyId, $this->keySecret);
    }

    /**
     * Process Razorpay refund for an order
     */
    public function processRefund(RefundTransaction $refundTransaction, float $amount, string $reason = null): array
    {
        try {
            DB::beginTransaction();

            // Get the original payment
            $transactionId = null;
            
            // Try to get transaction_id from order or sale
            if ($refundTransaction->refund->order && $refundTransaction->refund->order->transaction_id) {
                $transactionId = $refundTransaction->refund->order->transaction_id;
            } elseif ($refundTransaction->refund->sale && $refundTransaction->refund->sale->transaction_id) {
                $transactionId = $refundTransaction->refund->sale->transaction_id;
            }
            
            if (!$transactionId) {
                throw new \Exception('No transaction ID found for this refund');
            }
            
            $payment = Payment::where('rzorder_id', $transactionId)
                ->where('status', 'captured')
                ->first();

            if (!$payment) {
                throw new \Exception('Original payment not found or not captured');
            }

            // Convert amount to paise (Razorpay expects amount in smallest currency unit)
            $amountInPaise = round($amount * 100);

            // Create refund data
            $refundData = [
                'amount' => $amountInPaise,
                'notes' => [
                    'reason' => $reason ?? 'Customer refund request',
                    'refund_reference' => $refundTransaction->refund->reference,
                    'order_id' => $refundTransaction->refund->order->order_id,
                ]
            ];

            Log::info('Creating Razorpay refund', [
                'payment_id' => $payment->payment_id,
                'amount' => $amountInPaise,
                'refund_data' => $refundData
            ]);

            // Create refund with Razorpay
            $razorpayRefund = $this->api->payment->refund($payment->payment_id, $refundData);

            if (!$razorpayRefund || !isset($razorpayRefund->id)) {
                throw new \Exception('Failed to create Razorpay refund');
            }

            // Update refund transaction with Razorpay details
            $refundTransaction->update([
                'gateway_transaction_id' => $razorpayRefund->id,
                'gateway_refund_id' => $razorpayRefund->id,
                'status' => $razorpayRefund->status,
                'gateway_response' => json_encode($razorpayRefund->toArray()),
                'processed_at' => now(),
            ]);

            // Update payment record with refund information
            $payment->update([
                'refunded_amount' => ($payment->refunded_amount ?? 0) + $amount,
                'refund_status' => $this->calculateRefundStatus($payment, $amount),
                'refund_details' => json_encode([
                    'refund_id' => $razorpayRefund->id,
                    'refund_amount' => $amount,
                    'refund_status' => $razorpayRefund->status,
                    'refunded_at' => now()->toISOString(),
                ])
            ]);

            DB::commit();

            Log::info('Razorpay refund created successfully', [
                'refund_id' => $razorpayRefund->id,
                'amount' => $amount,
                'status' => $razorpayRefund->status
            ]);

            return [
                'success' => true,
                'refund_id' => $razorpayRefund->id,
                'status' => $razorpayRefund->status,
                'amount' => $amount,
                'processed_at' => now(),
                'gateway_response' => $razorpayRefund->toArray()
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Razorpay refund failed', [
                'error' => $e->getMessage(),
                'refund_transaction_id' => $refundTransaction->id,
                'amount' => $amount
            ]);

            // Update refund transaction with error
            $refundTransaction->update([
                'status' => 'failed',
                'gateway_response' => json_encode(['error' => $e->getMessage()]),
                'processed_at' => now(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'refund_transaction_id' => $refundTransaction->id
            ];
        }
    }

    /**
     * Check refund status with Razorpay
     */
    public function checkRefundStatus(string $refundId): array
    {
        try {
            $refund = $this->api->refund->fetch($refundId);
            
            return [
                'success' => true,
                'refund_id' => $refund->id,
                'status' => $refund->status,
                'amount' => $refund->amount / 100, // Convert from paise to rupees
                'created_at' => $refund->created_at,
                'processed_at' => $refund->processed_at ?? null,
                'gateway_response' => $refund->toArray()
            ];
        } catch (\Exception $e) {
            Log::error('Failed to check Razorpay refund status', [
                'refund_id' => $refundId,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get refund details from Razorpay
     */
    public function getRefundDetails(string $refundId): array
    {
        try {
            $refund = $this->api->refund->fetch($refundId);
            
            return [
                'success' => true,
                'refund' => $refund->toArray()
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Calculate refund status based on payment and refund amount
     */
    protected function calculateRefundStatus(Payment $payment, float $refundAmount): string
    {
        $totalRefunded = ($payment->refunded_amount ?? 0) + $refundAmount;
        $originalAmount = $payment->amount / 100; // Convert from paise to rupees

        if ($totalRefunded >= $originalAmount) {
            return 'fully_refunded';
        } elseif ($totalRefunded > 0) {
            return 'partially_refunded';
        } else {
            return 'not_refunded';
        }
    }

    /**
     * Validate if refund is possible for a payment
     */
    public function validateRefundEligibility(Payment $payment, float $refundAmount): array
    {
        try {
            // Check if payment is captured
            if ($payment->status !== 'captured') {
                return [
                    'eligible' => false,
                    'reason' => 'Payment not captured'
                ];
            }

            // Check if payment is not already fully refunded
            $totalRefunded = $payment->refunded_amount ?? 0;
            $originalAmount = $payment->amount / 100; // Convert from paise to rupees

            if ($totalRefunded >= $originalAmount) {
                return [
                    'eligible' => false,
                    'reason' => 'Payment already fully refunded'
                ];
            }

            // Check if refund amount is valid
            if ($refundAmount <= 0) {
                return [
                    'eligible' => false,
                    'reason' => 'Invalid refund amount'
                ];
            }

            if ($totalRefunded + $refundAmount > $originalAmount) {
                return [
                    'eligible' => false,
                    'reason' => 'Refund amount exceeds remaining refundable amount',
                    'max_refundable' => $originalAmount - $totalRefunded
                ];
            }

            return [
                'eligible' => true,
                'original_amount' => $originalAmount,
                'total_refunded' => $totalRefunded,
                'remaining_refundable' => $originalAmount - $totalRefunded,
                'max_refundable' => $originalAmount - $totalRefunded
            ];

        } catch (\Exception $e) {
            return [
                'eligible' => false,
                'reason' => 'Validation error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get payment details from Razorpay
     */
    public function getPaymentDetails(string $paymentId): array
    {
        try {
            $payment = $this->api->payment->fetch($paymentId);
            
            return [
                'success' => true,
                'payment' => $payment->toArray()
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Test Razorpay connection
     */
    public function testConnection(): array
    {
        try {
            // Try to fetch a test payment (this will fail but we can check the error)
            $this->api->payment->fetch('test_payment_id');
            
            return [
                'success' => false,
                'error' => 'Test payment not found (expected)'
            ];
        } catch (\Exception $e) {
            // If we get a "not found" error, the connection is working
            if (strpos($e->getMessage(), 'not found') !== false) {
                return [
                    'success' => true,
                    'message' => 'Razorpay connection is working'
                ];
            }
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}
