<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Refund;
use App\Models\Sale;
use App\Models\Order;
use App\Models\Payment;
use App\Services\RefundService;
use App\Services\RazorpayRefundService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Models\Customer;
use Illuminate\Support\Str;

class RefundController extends Controller
{
    protected $refundService;

    public function __construct(RefundService $refundService)
    {
        $this->refundService = $refundService;
    }

    /**
     * Get customer's refund requests
     */
    public function index(Request $request): JsonResponse
    {
        $customer = Auth::user();

        $query = Refund::where('customer_id', $customer->id)
            ->with([
                'sale',
                'order',
                'creditNote',
                'refundTransaction',
                'refundItems.product',
                'refundItems.productVariant'
            ]);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('refund_type')) {
            $query->byType($request->refund_type);
        }

        $refunds = $query->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $refunds,
        ]);
    }

    /**
     * Create a new refund request
     */
    public function store(Request $request): JsonResponse
    {
        
        $allrequest = $request->all();        

        // Verify customer owns the transaction
        if ($request->sale_id) {
            $sale = Sale::where('invoice_number', $request->sale_id)
                ->where('customer_id', Auth::id())
                ->firstOrFail();
        }
        
        if ($allrequest['order_id'] !='') {
            $order = Order::where('order_id', $allrequest['order_id'])
                ->where('customer_id', Auth::id())
                ->firstOrFail();
            if ($order->payment_method === 'razorpay' && $request->method === 'razorpay') {
                $this->validateRazorpayRefundEligibility($order, $request->amount);
            }
        }
       
        try {
            $refund = $this->refundService->createRefundRequest($request->all());
           

            return response()->json([
                'success' => true,
                'message' => 'Refund request created successfully.',
                'data' => $refund->load([
                    'sale',
                    'order',
                    'refundItems.product',
                    'refundItems.productVariant'
                ]),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get specific refund request
     */
    public function show(Refund $refund): JsonResponse
    {
        // Verify customer owns the refund
        if ($refund->customer_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to refund.',
            ], 403);
        }

        $refund->load([
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
     * Cancel a refund request (only if pending)
     */
    public function cancel(Refund $refund): JsonResponse
    {
        // Verify customer owns the refund
        if ($refund->customer_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to refund.',
            ], 403);
        }

        if ($refund->refund_status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending refunds can be cancelled.',
            ], 400);
        }

        $refund->update(['refund_status' => 'cancelled']);

        return response()->json([
            'success' => true,
            'message' => 'Refund request cancelled successfully.',
        ]);
    }

    /**
     * Get refund eligibility for a transaction
     */
    public function checkEligibility(Request $request): JsonResponse
    {
       // dd($request);
        $request->validate([
            'sale_id' => 'nullable|exists:sales,invoice_number',
            'order_id' => 'nullable|exists:orders,order_id',
        ]);

        try {
            $sourceTransaction = null;
            if ($request->sale_id) {
                $sourceTransaction = Sale::where('invoice_number', $request->sale_id)
                    ->where('customer_id', Auth::id())
                    ->firstOrFail();
            } elseif ($request->order_id) {
                $sourceTransaction = Order::where('order_id', $request->order_id)
                    ->where('customer_id', Auth::id())
                    ->where('status','delivered')
                    ->firstOrFail();
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Either sale_id or order_id must be provided.',
                ], 400);
            }
           // print_r($sourceTransaction);
            $totalRefunded = $sourceTransaction->refunds()->sum('amount');
            $maxRefundable = $sourceTransaction->total ?? $sourceTransaction->total_amount;
            $remainingRefundable = $maxRefundable - $totalRefunded;

            return response()->json([
                'success' => true,
                'data' => [
                    'is_eligible' => $remainingRefundable > 0,
                    'max_refundable' => $maxRefundable,
                    'total_refunded' => $totalRefunded,
                    'remaining_refundable' => $remainingRefundable,
                    'transaction_type' => $sourceTransaction instanceof Sale ? 'sale' : 'order',
                    'transaction_id' => $sourceTransaction->id,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get customer's credit notes
     */
    public function creditNotes(Request $request): JsonResponse
    {
        $customer = $request->user();

        if (!$customer instanceof Customer) {
            $customer = Auth::guard('sanctum')->user();
        }

        if (!$customer instanceof Customer) {
            return response()->json([
                'success' => false,
                'message' => 'Authenticated customer not found.',
            ], 401);
        }

        $query = $customer->creditNotes()
            ->with(['sale', 'order', 'refund'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $creditNotes = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $creditNotes,
        ]);
    }

    /**
     * Get refund statistics for customer
     */
    public function statistics(): JsonResponse
    {
        $customer = request()->user();

        if (!$customer instanceof Customer) {
            $customer = Auth::guard('sanctum')->user();
        }

        if (!$customer instanceof Customer) {
            return response()->json([
                'success' => false,
                'message' => 'Authenticated customer not found.',
            ], 401);
        }

        $statistics = [
            'total_refunds' => $customer->refunds()->count(),
            'pending_refunds' => $customer->refunds()->pending()->count(),
            'completed_refunds' => $customer->refunds()->completed()->count(),
            'total_refunded_amount' => $customer->refunds()->completed()->sum('amount'),
            'active_credit_notes' => $customer->creditNotes()->active()->count(),
            'total_credit_amount' => $customer->creditNotes()->active()->sum('remaining_amount'),
        ];

        return response()->json([
            'success' => true,
            'data' => $statistics,
        ]);
    }

    /**
     * Validate Razorpay refund eligibility
     */
    protected function validateRazorpayRefundEligibility(Order $order, float $refundAmount): void
    {
        $payment = Payment::where('rzorder_id', $order->transaction_id)
            ->where('status', 'captured')
            ->first();
       // dd($payment);
        if (!$payment) {
            throw new \Exception('Payment not found or not captured');
        }

        $razorpayService = app(RazorpayRefundService::class);
        $validation = $razorpayService->validateRefundEligibility($payment, $refundAmount);
        //dd($validation);

        if (!$validation['eligible']) {
            throw new \Exception($validation['reason']);
        }
    }

    /**
     * Check Razorpay refund status
     */
    public function checkRazorpayRefundStatus(Request $request): JsonResponse
    {
        $request->validate([
            'refund_id' => 'required|string'
        ]);

        try {
            $razorpayService = app(RazorpayRefundService::class);
            $result = $razorpayService->checkRefundStatus($request->refund_id);

            return response()->json([
                'success' => $result['success'],
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get refund eligibility for Razorpay payments
     */
    public function checkRazorpayEligibility(Request $request): JsonResponse
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id'
        ]);

        try {
            $order = Order::where('id', $request->order_id)
                ->where('customer_id', Auth::id())
                ->where ('status','delivered')
                ->firstOrFail();

            if ($order->payment_method !== 'razorpay') {
                return response()->json([
                    'success' => false,
                    'message' => 'Order was not paid via Razorpay'
                ], 400);
            }

            $payment = Payment::where('rzorder_id', $order->transaction_id)
                ->where('status', 'captured')
                ->where('customer_id', Auth::id())
                ->first();

            if (!$payment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment not found or not captured'
                ], 400);
            }

            $razorpayService = app(RazorpayRefundService::class);
            $validation = $razorpayService->validateRefundEligibility($payment, 0);

            return response()->json([
                'success' => true,
                'data' => $validation
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
    public function getOrderDetails(Request $request): JsonResponse
    {
        $order = Order::where('order_id', $request->order_id)
            ->where('customer_id', Auth::id())
            ->with(['productItems.product.primaryImage'])
            ->get()->map(function ($order) {
                $statusColor = match($order->status) {
                    'delivered' => 'bg-green-500',
                    'processing' => 'bg-amber-500',
                    'pending' => 'bg-blue-500',
                    'shipped' => 'bg-purple-500',
                    'cancelled' => 'bg-red-500',
                    default => 'bg-gray-500'
                };

                return [
                    'id' => $order->order_id,
                    'date' => $order->created_at->format('d M Y'),
                    'total' => $order->total_amount,
                    'status' => ucfirst($order->status),
                    'statusColor' => $statusColor,
                    'items' => $order->productItems->map(function ($item) {
                        $images = $item->product->resolveImagePaths()->map(function ($path) {
                            $path = (string) $path;
                            if (Str::startsWith($path, ['http://', 'https://', '//'])) {
                                return $path;
                            }
                            return asset('storage/' . ltrim($path, '/'));
                        })->values();
            
                        // Skip products with no images
                        if ($images->isEmpty()) {
                            return null;
                        }


                        return [
                            'id' => $item->product_id,
                            'name' => $item->product->name,
                            'image' => $images,
                            'price' => $item->price,
                            'quantity' => $item->quantity,
                        ];
                    })->toArray()
                ];
            });


            return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }
}
