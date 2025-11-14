<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Refund;
use App\Models\RefundItem;
use App\Models\Sale;
use App\Models\Order;
use App\Services\RefundService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RefundManagementController extends Controller
{
    protected $refundService;

    public function __construct(RefundService $refundService)
    {
        $this->refundService = $refundService;
    }

    /**
     * Display a listing of refunds
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        
        $query = Refund::with([
            'sale.customer',
            'order.customer',
            'customer',
            'vendor',
            'processedBy',
            'creditNote',
            'refundTransaction',
            'refundItems.product',
            'refundItems.productVariant'
        ]);

        // // Apply vendor isolation for non-admin users
        // if ($user->vendor_id && !$user->hasRole('admin')) {
        //     $query->where('vendor_id', $user->vendor_id);
        // }

        // Apply filters
        if ($request->filled('status')) {
            $query->where('refund_status', $request->status);
        }

        if ($request->filled('refund_type')) {
            $query->byType($request->refund_type);
        }

        // if ($request->filled('vendor_id') && $user->hasRole('admin')) {
        //     $query->where('vendor_id', $request->vendor_id);
        // }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->filled('customer_search')) {
            $query->whereHas('customer', function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->customer_search . '%')
                  ->orWhere('email', 'like', '%' . $request->customer_search . '%')
                  ->orWhere('phone', 'like', '%' . $request->customer_search . '%');
            });
        }

        if ($request->filled('reference')) {
            $query->where('reference', 'like', '%' . $request->reference . '%');
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $refunds = $query->paginate(20)->withQueryString();

        // Get filter options
        $statusOptions = ['pending', 'approved', 'rejected', 'processing', 'completed', 'failed'];
        $refundTypeOptions = ['credit_note', 'money'];
        
        $vendors = [];
        // if ($user->hasRole('admin')) {
        //     $vendors = \App\Models\Vendor::active()->pluck('business_name', 'id');
        // }

        return Inertia::render('Admin/Refunds/Index', [
            'refunds' => $refunds,
            'vendors' => $vendors,
            'filters' => $request->only([
                'status', 'refund_type', 'vendor_id', 'date_from', 'date_to',
                'customer_search', 'reference', 'sort_by', 'sort_direction'
            ]),
            'statusOptions' => $statusOptions,
            'refundTypeOptions' => $refundTypeOptions,
            'statistics' => $this->refundService->getRefundStatistics(),
            // 'can' => [
            //     'create' => $user->can('create', Refund::class),
            //     'view_all_vendors' => $user->hasRole('admin'),
            // ],
        ]);
    }

    /**
     * Display the specified refund
     */
    public function show(Refund $refund): Response
    {
        $refund->load([
            'sale.customer',
            'order.customer',
            'customer',
            'processedBy',
            'creditNote',
            'refundTransaction',
            'refundItems.product',
            'refundItems.productVariant',
            'refundItems.saleReturnItem',
            'refundItems.orderItem'
        ]);

        return Inertia::render('Admin/Refunds/Show', [
            'refund' => $refund,
        ]);
    }

    /**
     * Create a new refund request
     */
    public function create(Request $request): Response
    {
        $saleId = $request->get('sale_id');
        $orderId = $request->get('order_id');

        $sourceTransaction = null;
        if ($saleId) {
            $sourceTransaction = Sale::with(['customer', 'items.product', 'items.variant'])->findOrFail($saleId);
        } elseif ($orderId) {
            $sourceTransaction = Order::with(['customer', 'productItems.product', 'productItems.variant'])->findOrFail($orderId);
        }

        return Inertia::render('Admin/Refunds/Create', [
            'sourceTransaction' => $sourceTransaction,
            'saleId' => $saleId,
            'orderId' => $orderId,
        ]);
    }

    /**
     * Store a new refund request
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'sale_id' => 'nullable|exists:sales,id',
            'order_id' => 'nullable|exists:orders,id',
            'vendor_id' => 'nullable|exists:vendors,id',
            'amount' => 'required|numeric|min:0.01',
            'method' => 'required|in:credit_note,money,bank_transfer,manual',
            'reason' => 'required|string|max:1000',
            'admin_notes' => 'nullable|string|max:1000',
            'items' => 'nullable|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.product_variant_id' => 'nullable|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.total_amount' => 'required|numeric|min:0',
            'items.*.reason' => 'nullable|string|max:500',
        ]);

        // Validate vendor permissions
        // $vendorId = $request->vendor_id ?? $user->vendor_id;
        // if (!$user->can('createForVendor', [Refund::class, $vendorId])) {
        //     abort(403, 'Unauthorized to create refunds for this vendor');
        // }

        try {
            $refundData = $request->all();
            if (!isset($refundData['vendor_id']) && $user->vendor_id) {
                $refundData['vendor_id'] = $user->vendor_id;
            }

            $refund = $this->refundService->createRefundRequest($refundData);

            return redirect()->route('refunds.show', $refund)
                ->with('success', 'Refund request created successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()])->withInput();
        }
    }

    /**
     * Approve a refund request
     */
    public function approve(Request $request, Refund $refund)
    {
        // Additional validation
        $request->validate([
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        // Check if refund is in valid state for approval
        if ($refund->refund_status !== 'pending') {
            return back()->withErrors(['error' => "Refund cannot be approved. Current status: {$refund->refund_status}"]);
        }

        // Check permissions
        $user = Auth::user();
        if (!$user) {
            return back()->withErrors(['error' => 'User not authenticated']);
        }

        // Validate refund amount doesn't exceed source transaction
        $sourceTransaction = $refund->sale ?? $refund->order;
        if ($sourceTransaction) {
            $totalRefunded = $sourceTransaction->refunds()->where('refund_status', '!=', 'rejected')->sum('amount');
            $maxRefundable = $sourceTransaction->total ?? $sourceTransaction->total_amount ?? 0;
            
            if ($totalRefunded > $maxRefundable) {
                return back()->withErrors(['error' => 'Total refunds exceed transaction amount']);
            }
        }

        try {
            $this->refundService->approveRefund($refund, $request->all());

            return redirect()->back()->with('success', 'Refund approved successfully.');
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['error' => 'Validation Error: ' . $e->getMessage()]);
        } catch (\Exception $e) {
            Log::error('Refund approval failed', [
                'refund_id' => $refund->id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'An unexpected error occurred. Please try again or contact support.']);
        }
    }

    /**
     * Reject a refund request
     */
    public function reject(Request $request, Refund $refund)
    {
        $request->validate([
            'rejection_reason' => 'required|string|max:1000',
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        try {
            $this->refundService->rejectRefund($refund, $request->rejection_reason, $request->all());

            return redirect()->back()->with('success', 'Refund rejected successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Process a refund
     */
    public function process(Refund $refund)
    {
        try {
            $this->refundService->processRefund($refund);

            return redirect()->back()->with('success', 'Refund processed successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Update refund item QC status
     */
    public function updateItemQcStatus(Request $request, RefundItem $refundItem)
    {
        $request->validate([
            'qc_status' => 'required|in:pending,passed,failed',
            'qc_notes' => 'nullable|string|max:500',
        ]);

        $refundItem->update([
            'qc_status' => $request->qc_status,
            'qc_notes' => $request->qc_notes,
        ]);

        return redirect()->back()->with('success', 'QC status updated successfully.');
    }

    /**
     * Get refund statistics for dashboard
     */
    public function getStatistics(): JsonResponse
    {
        return response()->json($this->refundService->getRefundStatistics());
    }

    /**
     * Export refunds to CSV
     */
    public function export(Request $request)
    {
        // Get date filters
        $dateFrom = $request->get('date_from', now()->subDays(30)->format('Y-m-d'));
        $dateTo = $request->get('date_to', now()->format('Y-m-d'));
        $exportType = $request->get('type', 'summary'); // 'summary' or 'detailed'
        
        // Helper function to create fresh base query
        $getBaseQuery = function() use ($dateFrom, $dateTo) {
            return \App\Models\Refund::whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);
        };
        
        $filename = "refund_report_{$dateFrom}_to_{$dateTo}.csv";
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];
        
        $callback = function() use ($getBaseQuery, $exportType) {
            $file = fopen('php://output', 'w');
            
            if ($exportType === 'detailed') {
                // Detailed refund export
                fputcsv($file, [
                    'Reference', 'Customer Name', 'Customer Email', 'Amount', 'Method', 
                    'Status', 'Reason', 'Created Date', 'Approved Date', 'Completed Date',
                    'Processing Days', 'Admin Notes'
                ]);
                
                $getBaseQuery()->with(['customer', 'sale.customer', 'order.customer'])
                    ->chunk(1000, function($refunds) use ($file) {
                        foreach($refunds as $refund) {
                            $customer = $refund->customer ?? $refund->sale?->customer ?? $refund->order?->customer;
                            $processingDays = $refund->completed_at && $refund->created_at 
                                ? $refund->created_at->diffInDays($refund->completed_at)
                                : 'N/A';
                                
                            fputcsv($file, [
                                $refund->reference,
                                $customer?->name ?? 'Guest',
                                $customer?->email ?? 'N/A',
                                $refund->amount,
                                ucfirst(str_replace('_', ' ', $refund->method)),
                                ucfirst($refund->refund_status),
                                $refund->reason,
                                $refund->created_at?->format('Y-m-d H:i:s'),
                                $refund->approved_at?->format('Y-m-d H:i:s'),
                                $refund->completed_at?->format('Y-m-d H:i:s'),
                                $processingDays,
                                $refund->admin_notes
                            ]);
                        }
                    });
            } else {
                // Summary report export
                fputcsv($file, ['Refund Report Summary', 'Generated on: ' . now()->format('Y-m-d H:i:s')]);
                fputcsv($file, []);
                
                // Basic statistics
                fputcsv($file, ['BASIC STATISTICS']);
                fputcsv($file, ['Total Refunds', $getBaseQuery()->count()]);
                fputcsv($file, ['Completed Amount', '₹' . number_format($getBaseQuery()->where('refund_status', 'completed')->sum('amount'), 2)]);
                fputcsv($file, ['Pending Amount', '₹' . number_format($getBaseQuery()->where('refund_status', 'pending')->sum('amount'), 2)]);
                fputcsv($file, ['Average Refund', '₹' . number_format($getBaseQuery()->avg('amount'), 2)]);
                fputcsv($file, []);
                
                // By Status
                fputcsv($file, ['BREAKDOWN BY STATUS']);
                fputcsv($file, ['Status', 'Count', 'Total Amount']);
                $statusBreakdown = $getBaseQuery()->select('refund_status', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount) as total'))
                    ->groupBy('refund_status')->get();
                foreach($statusBreakdown as $status) {
                    fputcsv($file, [ucfirst($status->refund_status), $status->count, '₹' . number_format($status->total, 2)]);
                }
                fputcsv($file, []);
                
                // By Method
                fputcsv($file, ['BREAKDOWN BY METHOD']);
                fputcsv($file, ['Method', 'Count', 'Total Amount']);
                $methodBreakdown = $getBaseQuery()->select('method', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount) as total'))
                    ->groupBy('method')->get();
                foreach($methodBreakdown as $method) {
                    fputcsv($file, [ucfirst(str_replace('_', ' ', $method->method)), $method->count, '₹' . number_format($method->total, 2)]);
                }
            }
            
            fclose($file);
        };
        
        return response()->stream($callback, 200, $headers);
    }

    /**
     * Refund analytics/report (JSON summary)
     */
    public function report(Request $request)
    {
        // Get date filters
        $dateFrom = $request->get('date_from', now()->subDays(30)->format('Y-m-d'));
        $dateTo = $request->get('date_to', now()->format('Y-m-d'));
        
        // Helper function to create fresh base query
        $getBaseQuery = function() use ($dateFrom, $dateTo) {
            return \App\Models\Refund::whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);
        };
        
        $stats = [
            // Basic stats
            'total_refunds' => $getBaseQuery()->count(),
            'completed_amount' => $getBaseQuery()->where('refund_status', 'completed')->sum('amount'),
            'pending_amount' => $getBaseQuery()->where('refund_status', 'pending')->sum('amount'),
            'rejected_amount' => $getBaseQuery()->where('refund_status', 'rejected')->sum('amount'),
            'average_refund' => $getBaseQuery()->avg('amount'),
            
            // Existing breakdowns
            'breakdown_by_method' => $getBaseQuery()->select('method', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount) as total'))
                ->groupBy('method')->get(),
            'breakdown_by_status' => $getBaseQuery()->select('refund_status as status', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount) as total'))
                ->groupBy('refund_status')->get(),
            'breakdown_by_day' => $getBaseQuery()->selectRaw('DATE(created_at) as day, COUNT(*) as count, SUM(amount) as total')
                ->groupBy(DB::raw('DATE(created_at)'))->orderBy('day','desc')->limit(30)->get(),
                
            // New breakdowns
            'breakdown_by_customer' => $getBaseQuery()->with('customer')
                ->select('customer_id', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount) as total'))
                ->groupBy('customer_id')
                ->havingRaw('COUNT(*) > 1') // Only customers with multiple refunds
                ->orderBy('total', 'desc')
                ->limit(10)
                ->get()
                ->map(function($item) {
                    return [
                        'customer_name' => $item->customer ? $item->customer->name : 'Guest',
                        'customer_email' => $item->customer ? $item->customer->email : 'N/A',
                        'count' => $item->count,
                        'total' => $item->total
                    ];
                }),
                
            'breakdown_by_amount_range' => [
                ['range' => '₹0 - ₹500', 'count' => $getBaseQuery()->whereBetween('amount', [0, 500])->count()],
                ['range' => '₹501 - ₹1,000', 'count' => $getBaseQuery()->whereBetween('amount', [501, 1000])->count()],
                ['range' => '₹1,001 - ₹5,000', 'count' => $getBaseQuery()->whereBetween('amount', [1001, 5000])->count()],
                ['range' => '₹5,001 - ₹10,000', 'count' => $getBaseQuery()->whereBetween('amount', [5001, 10000])->count()],
                ['range' => '₹10,001+', 'count' => $getBaseQuery()->where('amount', '>', 10000)->count()],
            ],
            
            'breakdown_by_source' => [
                'pos_sales' => $getBaseQuery()->whereNotNull('sale_id')->count(),
                'online_orders' => $getBaseQuery()->whereNotNull('order_id')->count(),
            ],
            
            'processing_time_stats' => [
                'avg_approval_time' => $getBaseQuery()->whereNotNull('approved_at')
                    ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, created_at, approved_at)) as avg_hours')
                    ->value('avg_hours'),
                'avg_completion_time' => $getBaseQuery()->whereNotNull('completed_at')
                    ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, approved_at, completed_at)) as avg_hours')
                    ->value('avg_hours'),
            ],
            
            // Date filters for frontend
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo
            ]
        ];
        
        return Inertia::render('Admin/Refunds/Report', [
            'stats' => $stats,
        ]);
    }
}
