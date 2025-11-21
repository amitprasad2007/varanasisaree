<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Refund;
use App\Models\Sale;
use App\Models\Order;
use App\Models\Payment;
use App\Models\OrderItem;
use App\Services\RefundService;
use App\Services\RazorpayRefundService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Models\Customer;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

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
        // Validate request data
        $validator = Validator::make($request->all(), [
            'order_id' => 'required_without:sale_id|string|exists:orders,order_id',
            'sale_id' => 'required_without:order_id|string|exists:sales,invoice_number',
            'amount' => 'required|numeric|min:0.01',
            'method' => 'required|string|in:razorpay,credit_note,bank_transfer',
            'reason' => 'required|string|max:500',
            'items' => 'sometimes|array',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.product_variant_id' => 'nullable|integer|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.reason' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $customerId = Auth::id();
        
        try {
            // Use database transaction for data integrity
            $refund = DB::transaction(function () use ($request, $customerId) {
                // Verify customer owns the transaction
                $sourceTransaction = null;
                
                if ($request->filled('sale_id')) {
                    $sourceTransaction = Sale::where('invoice_number', $request->sale_id)
                        ->where('customer_id', $customerId)
                        ->firstOrFail();
                } elseif ($request->filled('order_id')) {
                    $sourceTransaction = Order::where('order_id', $request->order_id)
                        ->where('customer_id', $customerId)
                        ->where('status', 'delivered') // Only allow refunds for delivered orders
                        ->firstOrFail();
                        
                    // Validate Razorpay eligibility if needed
                    if ($sourceTransaction->payment_method === 'razorpay' && $request->method === 'razorpay') {
                        $this->validateRazorpayRefundEligibility($sourceTransaction, (float) $request->amount);
                    }
                }

                // Check refund eligibility (amount limits)
                $this->validateRefundEligibility($sourceTransaction, (float) $request->amount);

                // Create refund request
                return $this->refundService->createRefundRequest($request->all());
            });

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

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction not found or you do not have permission to access it.',
            ], 404);
        } catch (\Exception $e) {
            Log::error('Refund creation failed', [
                'customer_id' => $customerId,
                'request_data' => $request->all(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

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
     * Validate general refund eligibility (amount limits, etc.)
     */
    protected function validateRefundEligibility($transaction, float $refundAmount): void
    {
        $totalRefunded = $transaction->refunds()->sum('amount');
        $maxRefundable = $transaction->total ?? $transaction->total_amount;
        $remainingRefundable = $maxRefundable - $totalRefunded;

        if ($refundAmount > $remainingRefundable) {
            throw new \Exception("Refund amount ({$refundAmount}) exceeds remaining refundable amount ({$remainingRefundable})");
        }

        if ($remainingRefundable <= 0) {
            throw new \Exception('No refundable amount remaining for this transaction');
        }
    }

    /**
     * Validate Razorpay refund eligibility
     */
    protected function validateRazorpayRefundEligibility(Order $order, float $refundAmount): void
    {
        $payment = Payment::where('rzorder_id', $order->transaction_id)
            ->where('status', 'captured')
            ->first();

        if (!$payment) {
            throw new \Exception('Payment not found or not captured');
        }

        $razorpayService = app(RazorpayRefundService::class);
        $validation = $razorpayService->validateRefundEligibility($payment, $refundAmount);

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
    /**
     * Get detailed order information including refund status for each item
     */
    public function getOrderDetails(Request $request): JsonResponse
    {
        // Add debugging information
        $customerId = Auth::id();
        $orderIdRequested = $request->order_id;
        
        // Debug: Log the request details
        Log::info("RefundController@getOrderDetails Debug", [
            'requested_order_id' => $orderIdRequested,
            'authenticated_customer_id' => $customerId
        ]);
        
        // First, let's check if the order exists at all
        $orderExists = Order::where('order_id', $orderIdRequested)->first();
        if (!$orderExists) {
            Log::error("Order not found", ['order_id' => $orderIdRequested]);
            return response()->json([
                'success' => false,
                'message' => 'Order not found',
                'debug' => ['order_id' => $orderIdRequested]
            ], 404);
        }
        
        // Check if customer owns this order
        if ($orderExists->customer_id != $customerId) {
            Log::error("Customer mismatch", [
                'order_customer_id' => $orderExists->customer_id,
                'authenticated_customer_id' => $customerId
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to order',
                'debug' => [
                    'order_customer_id' => $orderExists->customer_id,
                    'your_customer_id' => $customerId
                ]
            ], 403);
        }
       // dd($orderExists->refunds->count());
        // Debug: Check refunds count before eager loading
        $refundsCount = $orderExists->refunds->count();
        Log::info("Refunds found for order", [
            'order_internal_id' => $orderExists->id,
            'order_id' => $orderExists->order_id,
            'refunds_count' => $refundsCount
        ]);
        
        $order = Order::where('order_id', $request->order_id)
            ->where('customer_id', Auth::id())
            ->with([
                'productItems.product.primaryImage',
                'refunds.refundItems.product',
                'refunds.refundItems.productVariant',
                'refunds.refundTransaction',
                'refunds.creditNote'
            ])
            ->get()->map(function ($order) use ($refundsCount) {
                $statusColor = match($order->status) {
                    'delivered' => 'bg-green-500',
                    'processing' => 'bg-amber-500',
                    'pending' => 'bg-blue-500',
                    'shipped' => 'bg-purple-500',
                    'cancelled' => 'bg-red-500',
                    default => 'bg-gray-500'
                };

                // Debug: Log refund information for this specific order
                Log::info("Processing order refunds", [
                    'order_id' => $order->order_id,
                    'order_internal_id' => $order->id,
                    'loaded_refunds_count' => $order->refunds->count(),
                    'refunds_data' => $order->refunds->pluck('id', 'amount')->toArray()
                ]);

                return [
                    'id' => $order->order_id,
                    'date' => $order->created_at->format('d M Y'),
                    'total' => $order->total_amount,
                    'status' => ucfirst($order->status),
                    'statusColor' => $statusColor,
                    'debug_info' => [
                        'expected_refunds_count' => $refundsCount,
                        'loaded_refunds_count' => $order->refunds->count(),
                        'refund_ids' => $order->refunds->pluck('id')->toArray()
                    ],
                    'refundamountstatus' => $order->refunds->map(function($refund) {
                        // Get refund items with their details
                        $refundItems = $refund->refundItems->map(function($refundItem) {
                            return [
                                'product_id' => $refundItem->product_id,
                                'product_variant_id' => $refundItem->product_variant_id,
                                'quantity' => $refundItem->quantity,
                                'unit_price' => $refundItem->unit_price,
                                'total_amount' => $refundItem->total_amount,
                                'status' => $refundItem->status,
                                'qc_status' => $refundItem->qc_status,
                                'reason' => $refundItem->reason,
                            ];
                        });

                        // Get refund transaction details if exists
                        $transactionDetails = null;
                        if ($refund->refundTransaction) {
                            $transactionDetails = [
                                'transaction_id' => $refund->refundTransaction->transaction_id,
                                'gateway' => $refund->refundTransaction->gateway,
                                'status' => $refund->refundTransaction->status,
                                'amount' => $refund->refundTransaction->amount,
                                'gateway_transaction_id' => $refund->refundTransaction->gateway_transaction_id,
                                'gateway_refund_id' => $refund->refundTransaction->gateway_refund_id,
                                'processed_at' => $refund->refundTransaction->processed_at,
                                'completed_at' => $refund->refundTransaction->completed_at,
                            ];
                        }

                        // Get credit note details if exists
                        $creditNoteDetails = null;
                        if ($refund->creditNote) {
                            $creditNoteDetails = [
                                'credit_note_number' => $refund->creditNote->credit_note_number,
                                'amount' => $refund->creditNote->amount,
                                'used_amount' => $refund->creditNote->used_amount,
                                'remaining_amount' => $refund->creditNote->remaining_amount,
                                'status' => $refund->creditNote->status,
                                'issued_at' => $refund->creditNote->issued_at,
                                'expires_at' => $refund->creditNote->expires_at,
                            ];
                        }

                        return [
                            'refund_id' => $refund->id,
                            'total_amount' => $refund->amount,
                            'method' => $refund->method,
                            'refund_status' => $refund->refund_status,
                            'refund_type' => $refund->refund_type,
                            'reason' => $refund->reason,
                            'requested_at' => $refund->requested_at,
                            'approved_at' => $refund->approved_at,
                            'processed_at' => $refund->processed_at,
                            'completed_at' => $refund->completed_at,
                            'vendor_id' => $refund->vendor_id,
                            'items' => $refundItems,
                            'transaction' => $transactionDetails,
                            'credit_note' => $creditNoteDetails,
                        ];
                    })->toArray(),
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


    /**
     * Check if a specific product item in an order is eligible for refund
     */
    public function getOrderitemsDetails(Request $request): JsonResponse
    {
        // Validate request parameters
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|string|exists:orders,order_id',
            'product_id' => 'required|integer|exists:products,id',
            'product_variant_id' => 'nullable|integer|exists:product_variants,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $customerId = Auth::id();
        $orderId = $request->order_id;
        $productId = $request->product_id;
        $productVariantId = $request->product_variant_id;

        try {
            // First, verify that the customer owns this order and it's delivered
            $order = Order::where('order_id', $orderId)
                ->where('customer_id', $customerId)
                ->where('status', 'delivered')
                ->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found, not delivered, or you do not have permission to access it.',
                ], 404);
            }

            // Check if the product exists in this order
            $orderItemQuery = OrderItem::where('order_id', $order->id)
                ->where('product_id', $productId);
            
            if ($productVariantId) {
                $orderItemQuery->where('product_variant_id', $productVariantId);
            }
            
            $orderItem = $orderItemQuery->first();

            if (!$orderItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found in this order.',
                ], 404);
            }

            // Check if refund already exists for this specific product/variant
            $refundQuery = Refund::where('order_id', $orderId)
                ->where('customer_id', $customerId)
                ->whereHas('refundItems', function($query) use ($productId, $productVariantId) {
                    $query->where('product_id', $productId);
                    if ($productVariantId) {
                        $query->where('product_variant_id', $productVariantId);
                    }
                });

            $existingRefund = $refundQuery->first();

            if ($existingRefund) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'eligible' => false,
                        'reason' => 'Refund has already been requested for this item',
                        'existing_refund' => [
                            'id' => $existingRefund->id,
                            'status' => $existingRefund->refund_status,
                            'amount' => $existingRefund->amount,
                            'requested_at' => $existingRefund->requested_at,
                        ]
                    ]
                ]);
            }

            // Check refund time limit (example: 30 days from delivery)
            $refundDeadline = $order->delivered_at ? 
                $order->delivered_at->addDays(30) : 
                $order->created_at->addDays(45);

            $isWithinTimeLimit = now()->lessThanOrEqualTo($refundDeadline);

            if (!$isWithinTimeLimit) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'eligible' => false,
                        'reason' => 'Refund period has expired',
                        'deadline' => $refundDeadline->format('Y-m-d H:i:s')
                    ]
                ]);
            }

            // Item is eligible for refund
            return response()->json([
                'success' => true,
                'data' => [
                    'eligible' => true,
                    'reason' => '',
                    'order_item' => [
                        'product_id' => $orderItem->product_id,
                        'product_variant_id' => $orderItem->product_variant_id,
                        'quantity' => $orderItem->quantity,
                        'price' => $orderItem->price,
                        'max_refundable_amount' => $orderItem->quantity * $orderItem->price
                    ],
                    'refund_deadline' => $refundDeadline->format('Y-m-d H:i:s')
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Refund eligibility check failed', [
                'customer_id' => $customerId,
                'order_id' => $orderId,
                'product_id' => $productId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while checking refund eligibility.',
            ], 500);
        }
    }

    /**
     * Transform order data for API response
     */
    private function transformOrderData(Order $order): array
    {
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
            'refundamountstatus' => $this->transformRefundData($order->refunds),
            'items' => $this->transformOrderItems($order->productItems)
        ];
    }

    /**
     * Transform refund data for API response
     */
    private function transformRefundData($refunds): array
    {
        return $refunds->map(function($refund) {
            $refundItems = $refund->refundItems->map(function($refundItem) {
                return [
                    'product_id' => $refundItem->product_id,
                    'product_variant_id' => $refundItem->product_variant_id,
                    'quantity' => $refundItem->quantity,
                    'unit_price' => $refundItem->unit_price,
                    'total_amount' => $refundItem->total_amount,
                    'status' => $refundItem->status,
                    'qc_status' => $refundItem->qc_status,
                    'reason' => $refundItem->reason,
                ];
            });

            $transactionDetails = null;
            if ($refund->refundTransaction) {
                $transactionDetails = [
                    'transaction_id' => $refund->refundTransaction->transaction_id,
                    'gateway' => $refund->refundTransaction->gateway,
                    'status' => $refund->refundTransaction->status,
                    'amount' => $refund->refundTransaction->amount,
                    'gateway_transaction_id' => $refund->refundTransaction->gateway_transaction_id,
                    'gateway_refund_id' => $refund->refundTransaction->gateway_refund_id,
                    'processed_at' => $refund->refundTransaction->processed_at,
                    'completed_at' => $refund->refundTransaction->completed_at,
                ];
            }

            $creditNoteDetails = null;
            if ($refund->creditNote) {
                $creditNoteDetails = [
                    'credit_note_number' => $refund->creditNote->credit_note_number,
                    'amount' => $refund->creditNote->amount,
                    'used_amount' => $refund->creditNote->used_amount,
                    'remaining_amount' => $refund->creditNote->remaining_amount,
                    'status' => $refund->creditNote->status,
                    'issued_at' => $refund->creditNote->issued_at,
                    'expires_at' => $refund->creditNote->expires_at,
                ];
            }

            return [
                'refund_id' => $refund->id,
                'total_amount' => $refund->amount,
                'method' => $refund->method,
                'refund_status' => $refund->refund_status,
                'refund_type' => $refund->refund_type,
                'reason' => $refund->reason,
                'requested_at' => $refund->requested_at,
                'approved_at' => $refund->approved_at,
                'processed_at' => $refund->processed_at,
                'completed_at' => $refund->completed_at,
                'vendor_id' => $refund->vendor_id,
                'items' => $refundItems,
                'transaction' => $transactionDetails,
                'credit_note' => $creditNoteDetails,
            ];
        })->toArray();
    }

    /**
     * Transform order items for API response
     */
    private function transformOrderItems($orderItems): array
    {
        return $orderItems->map(function ($item) {
            $images = collect();
            
            if ($item->product && method_exists($item->product, 'resolveImagePaths')) {
                $images = $item->product->resolveImagePaths()->map(function ($path) {
                    $path = (string) $path;
                    if (Str::startsWith($path, ['http://', 'https://', '//'])) {
                        return $path;
                    }
                    return asset('storage/' . ltrim($path, '/'));
                })->values();
            }

            // Skip products with no images or missing product data
            if ($images->isEmpty() || !$item->product) {
                return null;
            }

            return [
                'id' => $item->product_id,
                'name' => $item->product->name ?? 'Unknown Product',
                'image' => $images,
                'price' => $item->price,
                'quantity' => $item->quantity,
                'product_variant_id' => $item->product_variant_id,
            ];
        })->filter()->values()->toArray(); // Remove null entries and reindex
    }

    /**
     * Get all refundable items for an order
     */
    public function getRefundableItems(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|string|exists:orders,order_id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $customerId = Auth::id();
        $orderId = $request->order_id;

        try {
            $order = Order::where('order_id', $orderId)
                ->where('customer_id', $customerId)
                ->where('status', 'delivered')
                ->with(['productItems.product', 'refunds.refundItems'])
                ->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found, not delivered, or you do not have permission to access it.',
                ], 404);
            }

            // Get refund deadline
            $refundDeadline = $order->delivered_at ? 
                $order->delivered_at->addDays(30) : 
                $order->created_at->addDays(45);

            $isWithinTimeLimit = now()->lessThanOrEqualTo($refundDeadline);

            // Get already refunded items
            $refundedItems = collect();
            foreach ($order->refunds as $refund) {
                foreach ($refund->refundItems as $refundItem) {
                    $key = $refundItem->product_id . '_' . ($refundItem->product_variant_id ?? '0');
                    $refundedItems->put($key, [
                        'quantity' => $refundedItems->get($key, ['quantity' => 0])['quantity'] + $refundItem->quantity,
                        'refund_status' => $refund->refund_status
                    ]);
                }
            }

            $refundableItems = $order->productItems->map(function ($item) use ($refundedItems, $isWithinTimeLimit) {
                $key = $item->product_id . '_' . ($item->product_variant_id ?? '0');
                $refundedInfo = $refundedItems->get($key, ['quantity' => 0, 'refund_status' => null]);
                $remainingQuantity = $item->quantity - $refundedInfo['quantity'];

                return [
                    'product_id' => $item->product_id,
                    'product_variant_id' => $item->product_variant_id,
                    'product_name' => $item->product->name ?? 'Unknown Product',
                    'ordered_quantity' => $item->quantity,
                    'refunded_quantity' => $refundedInfo['quantity'],
                    'remaining_quantity' => $remainingQuantity,
                    'unit_price' => $item->price,
                    'total_refundable_amount' => $remainingQuantity * $item->price,
                    'is_eligible' => $remainingQuantity > 0 && $isWithinTimeLimit,
                    'ineligible_reason' => $remainingQuantity <= 0 ? 'Already fully refunded' : (!$isWithinTimeLimit ? 'Refund period expired' : null)
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'order_id' => $order->order_id,
                    'refund_deadline' => $refundDeadline->format('Y-m-d H:i:s'),
                    'is_within_time_limit' => $isWithinTimeLimit,
                    'items' => $refundableItems
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Get refundable items failed', [
                'customer_id' => $customerId,
                'order_id' => $orderId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching refundable items.',
            ], 500);
        }
    }
}
