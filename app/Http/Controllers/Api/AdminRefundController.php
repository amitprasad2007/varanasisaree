<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Refund;
use App\Models\RefundTransaction;
use App\Services\RefundService;
use App\Services\RazorpayRefundService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class AdminRefundController extends Controller
{
    protected $refundService;

    public function __construct(RefundService $refundService)
    {
        $this->refundService = $refundService;
        $this->middleware('auth:sanctum');
    }

    /**
     * Get all refund requests (admin)
     */
    public function index(Request $request): JsonResponse
    {
        $query = Refund::with([
            'customer',
            'sale',
            'order',
            'creditNote',
            'refundTransaction',
            'refundItems.product',
            'refundItems.productVariant'
        ]);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('refund_status', $request->status);
        }

        if ($request->filled('method')) {
            $query->where('method', $request->method);
        }

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $refunds = $query->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $refunds,
        ]);
    }

    /**
     * Get specific refund request (admin)
     */
    public function show(Refund $refund): JsonResponse
    {
        $refund->load([
            'customer',
            'sale.customer',
            'order.customer',
            'creditNote',
            'refundTransaction',
            'refundItems.product',
            'refundItems.productVariant',
            'refundItems.saleReturnItem',
            'refundItems.orderItem'
        ]);

        return response()->json([
            'success' => true,
            'data' => $refund,
        ]);
    }

    /**
     * Approve a refund request
     */
    public function approve(Refund $refund, Request $request): JsonResponse
    {
        $request->validate([
            'admin_notes' => 'nullable|string|max:1000'
        ]);

        if ($refund->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending refunds can be approved.',
            ], 400);
        }

        try {
            $refund = $this->refundService->approveRefund($refund, $request->all());

            return response()->json([
                'success' => true,
                'message' => 'Refund approved successfully.',
                'data' => $refund,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Reject a refund request
     */
    public function reject(Refund $refund, Request $request): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|max:1000',
            'admin_notes' => 'nullable|string|max:1000'
        ]);

        if ($refund->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending refunds can be rejected.',
            ], 400);
        }

        try {
            $refund = $this->refundService->rejectRefund($refund, $request->reason, $request->all());

            return response()->json([
                'success' => true,
                'message' => 'Refund rejected successfully.',
                'data' => $refund,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Process a refund manually (admin override)
     */
    public function process(Refund $refund, Request $request): JsonResponse
    {
        $request->validate([
            'admin_notes' => 'nullable|string|max:1000'
        ]);

        if ($refund->refund_status !== 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Only approved refunds can be processed.',
            ], 400);
        }

        try {
            $refund = $this->refundService->processRefund($refund);

            return response()->json([
                'success' => true,
                'message' => 'Refund processed successfully.',
                'data' => $refund,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Retry failed Razorpay refund
     */
    public function retryRazorpayRefund(Refund $refund): JsonResponse
    {
        if ($refund->method !== 'razorpay') {
            return response()->json([
                'success' => false,
                'message' => 'This refund is not a Razorpay refund.',
            ], 400);
        }

        $refundTransaction = $refund->refundTransaction;
        if (!$refundTransaction || $refundTransaction->status !== 'failed') {
            return response()->json([
                'success' => false,
                'message' => 'No failed Razorpay transaction found for this refund.',
            ], 400);
        }

        try {
            $razorpayService = app(RazorpayRefundService::class);
            
            $result = $razorpayService->processRefund(
                $refundTransaction, 
                $refundTransaction->amount, 
                $refund->reason
            );

            if ($result['success']) {
                $refundTransaction->update([
                    'status' => $result['status'],
                    'gateway_transaction_id' => $result['refund_id'],
                    'gateway_refund_id' => $result['refund_id'],
                    'gateway_response' => json_encode($result['gateway_response']),
                    'completed_at' => $result['processed_at'],
                ]);

                $refund->update([
                    'refund_status' => 'completed',
                    'completed_at' => now(),
                    'paid_at' => now(),
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Razorpay refund retried successfully.',
                    'data' => $refund->fresh(),
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to retry Razorpay refund: ' . $result['error'],
                ], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get refund statistics (admin)
     */
    public function statistics(): JsonResponse
    {
        $statistics = $this->refundService->getRefundStatistics();

        // Add additional admin statistics
        $statistics['pending_approval'] = Refund::pending()->count();
        $statistics['processing_refunds'] = Refund::where('refund_status', 'processing')->count();
        $statistics['failed_refunds'] = Refund::whereHas('refundTransaction', function($query) {
            $query->where('status', 'failed');
        })->count();

        return response()->json([
            'success' => true,
            'data' => $statistics,
        ]);
    }

    /**
     * Get refunds by status (admin)
     */
    public function getByStatus(string $status): JsonResponse
    {
        $validStatuses = ['pending', 'approved', 'rejected', 'processing', 'completed', 'cancelled'];
        
        if (!in_array($status, $validStatuses)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid status provided.',
            ], 400);
        }

        $refunds = Refund::where('refund_status', $status)
            ->with([
                'customer',
                'sale',
                'order',
                'refundTransaction'
            ])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $refunds,
        ]);
    }

    /**
     * Test Razorpay connection (admin)
     */
    public function testRazorpayConnection(): JsonResponse
    {
        try {
            $razorpayService = app(RazorpayRefundService::class);
            $result = $razorpayService->testConnection();

            return response()->json([
                'success' => $result['success'],
                'message' => $result['message'] ?? $result['error'],
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
