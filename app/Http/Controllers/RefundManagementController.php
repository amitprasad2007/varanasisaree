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
        $query = Refund::with([
            'sale.customer',
            'order.customer',
            'customer',
            'processedBy',
            'creditNote',
            'refundTransaction',
            'refundItems.product',
            'refundItems.productVariant'
        ]);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('method')) {
            $query->byType($request->method);
        }

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

        return Inertia::render('Admin/Refunds/Index', [
            'refunds' => $refunds,
            'filters' => $request->only([
                'status', 'method', 'date_from', 'date_to',
                'customer_search', 'reference', 'sort_by', 'sort_direction'
            ]),
            'statusOptions' => $statusOptions,
            'refundTypeOptions' => $refundTypeOptions,
            'statistics' => $this->refundService->getRefundStatistics(),
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
        $request->validate([
            'sale_id' => 'nullable|exists:sales,id',
            'order_id' => 'nullable|exists:orders,id',
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

        try {
            $refund = $this->refundService->createRefundRequest($request->all());

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
        $request->validate([
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        try {
            $this->refundService->approveRefund($refund, $request->all());

            return redirect()->back()->with('success', 'Refund approved successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
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
        // Implementation for CSV export
        return response()->json(['message' => 'Export functionality to be implemented']);
    }

    /**
     * Refund analytics/report (JSON summary)
     */
    public function report(Request $request)
    {
        $stats = [
            'total_refunds' => \App\Models\Refund::count(),
            'completed_amount' => \App\Models\Refund::where('refund_status', 'completed')->sum('amount'),
            'breakdown_by_method' => \App\Models\Refund::select('method', \DB::raw('COUNT(*) as count'), \DB::raw('SUM(amount) as total'))
                ->groupBy('method')->get(),
            'breakdown_by_status' => \App\Models\Refund::select('refund_status', \DB::raw('COUNT(*) as count'))
                ->groupBy('refund_status')->get(),
            'breakdown_by_day' => \App\Models\Refund::selectRaw('DATE(created_at) as day, COUNT(*) as count, SUM(amount) as total')
                ->groupBy('day')->orderBy('day','desc')->limit(30)->get(),
        ];
        return Inertia::render('Admin/Refunds/Report', [
            'stats' => $stats,
        ]);
    }
}
