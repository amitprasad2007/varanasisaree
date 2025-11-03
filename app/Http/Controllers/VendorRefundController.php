<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Refund;
use App\Models\Vendor;
use App\Services\RefundService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VendorRefundController extends Controller
{
    protected $refundService;

    public function __construct(RefundService $refundService)
    {
        $this->refundService = $refundService;
        $this->middleware('auth');
    }

    /**
     * Display vendor's refunds dashboard
     */
    public function index(Request $request): Response
    {
        $vendor = auth()->user()->vendor ?? Vendor::findOrFail(auth()->user()->vendor_id);
        
        $query = $vendor->refunds()->with([
            'sale.customer',
            'order.customer', 
            'customer',
            'processedBy',
            'creditNote',
            'refundItems.product'
        ]);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('refund_status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $refunds = $query->orderBy('created_at', 'desc')->paginate(15);

        $statistics = $vendor->getRefundStatistics();

        return Inertia::render('Vendor/Refunds/Index', [
            'refunds' => $refunds,
            'statistics' => $statistics,
            'filters' => $request->only(['status', 'date_from', 'date_to']),
            'vendor' => $vendor,
        ]);
    }

    /**
     * Show specific refund details for vendor
     */
    public function show(Refund $refund): Response
    {
        $vendor = auth()->user()->vendor ?? Vendor::findOrFail(auth()->user()->vendor_id);
        
        // Ensure refund belongs to this vendor
        if ($refund->vendor_id !== $vendor->id) {
            abort(403, 'This refund does not belong to your store');
        }

        $refund->load([
            'sale.customer',
            'order.customer',
            'customer',
            'processedBy',
            'creditNote',
            'refundItems.product',
            'refundItems.productVariant',
            'refundTransaction'
        ]);

        $user = auth()->user();

        return Inertia::render('Vendor/Refunds/Show', [
            'refund' => $refund,
            'vendor' => $vendor,
            'can' => [
                'approve' => $user->can('approve', $refund),
                'reject' => $user->can('reject', $refund),
                'process' => $user->can('process', $refund),
            ],
        ]);
    }

    /**
     * Approve a refund (vendor action)
     */
    public function approve(Request $request, Refund $refund)
    {
        $vendor = auth()->user()->vendor ?? Vendor::findOrFail(auth()->user()->vendor_id);
        
        if ($refund->vendor_id !== $vendor->id) {
            abort(403, 'This refund does not belong to your store');
        }

        $this->authorize('approve', $refund);

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
     * Reject a refund (vendor action)
     */
    public function reject(Request $request, Refund $refund)
    {
        $vendor = auth()->user()->vendor ?? Vendor::findOrFail(auth()->user()->vendor_id);
        
        if ($refund->vendor_id !== $vendor->id) {
            abort(403, 'This refund does not belong to your store');
        }

        $this->authorize('reject', $refund);

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
     * Get vendor refund analytics
     */
    public function analytics(Request $request)
    {
        $vendor = auth()->user()->vendor ?? Vendor::findOrFail(auth()->user()->vendor_id);
        
        $period = $request->get('period', '30'); // days
        $startDate = now()->subDays($period);

        $analytics = [
            'summary' => $vendor->getRefundStatistics(),
            'trend_data' => $vendor->refunds()
                ->where('created_at', '>=', $startDate)
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count, SUM(amount) as amount')
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
            'method_breakdown' => $vendor->refunds()
                ->where('created_at', '>=', $startDate)
                ->selectRaw('method, COUNT(*) as count, SUM(amount) as amount')
                ->groupBy('method')
                ->get(),
            'status_breakdown' => $vendor->refunds()
                ->where('created_at', '>=', $startDate)
                ->selectRaw('refund_status, COUNT(*) as count')
                ->groupBy('refund_status')
                ->get(),
        ];

        return response()->json($analytics);
    }

    /**
     * Export vendor refunds
     */
    public function export(Request $request)
    {
        $vendor = auth()->user()->vendor ?? Vendor::findOrFail(auth()->user()->vendor_id);
        
        // Implementation for CSV export
        return response()->json(['message' => 'Export functionality to be implemented']);
    }
}