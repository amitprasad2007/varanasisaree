<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\SalePayment;
use App\Models\SaleReturn;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Barryvdh\DomPDF\Facade\Pdf;

class SalesManagementController extends Controller
{
    /**
     * Display a listing of sales with filters
     */
    public function index(Request $request): Response
    {
        $query = Sale::with([
            'customer:id,name,email,phone',
            'items.product:id,name,slug',
            'items.variant:id,color,size',
            'payments',
            'returns'
        ]);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
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
                  ->orWhere('phone', 'like', '%' . $request->customer_search . '%')
                  ->orWhere('invoice_number', 'like', '%' . $request->customer_search . '%');
            });
        }

        if ($request->filled('invoice_number')) {
            $query->where('invoice_number', 'like', '%' . $request->invoice_number . '%');
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $sales = $query->paginate(20)->withQueryString();

        // Get filter options
        $statusOptions = ['draft', 'completed', 'returned'];
        $customers = Customer::select('id', 'name')->get();

        return Inertia::render('Admin/Sales/Index', [
            'sales' => $sales,
            'filters' => $request->only([
                'status', 'date_from', 'date_to', 'customer_search', 'invoice_number',
                'sort_by', 'sort_direction'
            ]),
            'statusOptions' => $statusOptions,
            'customers' => $customers,
        ]);
    }

    /**
     * Display the specified sale with full details
     */
    public function show(Sale $sale): Response
    {
        $sale->load([
            'customer',
            'items.product',
            'items.variant.color',
            'items.variant.size',
            'payments',
            'returns.items'
        ]);

        return Inertia::render('Admin/Sales/Show', [
            'sale' => $sale,
        ]);
    }

    /**
     * Update sale status
     */
    public function updateStatus(Request $request, Sale $sale)
    {
        $request->validate([
            'status' => 'required|in:draft,completed,returned',
            'notes' => 'nullable|string|max:500',
        ]);

        $oldStatus = $sale->status;
        $newStatus = $request->status;

        $sale->update(['status' => $newStatus]);

        // Log the status change (you might want to create a SaleStatusLog model)
        // $sale->statusLogs()->create([
        //     'status_from' => $oldStatus,
        //     'status_to' => $newStatus,
        //     'notes' => $request->notes,
        //     'changed_by' => auth()->id(),
        //     'changed_at' => now(),
        // ]);

        return redirect()->back()->with('success', 'Sale status updated successfully');
    }

    /**
     * Process return for a sale
     */
    public function processReturn(Request $request, Sale $sale)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.sale_item_id' => 'required|exists:sale_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'reason' => 'nullable|string|max:500',
        ]);

        return \DB::transaction(function () use ($sale, $request) {
            $return = new SaleReturn();
            $return->sale_id = $sale->id;
            $return->reason = $request->reason;
            $return->refund_total = 0;
            $return->save();

            $refundTotal = 0;
            foreach ($request->items as $ri) {
                $saleItem = $sale->items->firstWhere('id', $ri['sale_item_id']);
                if (!$saleItem) { continue; }
                $qty = min((int) $ri['quantity'], (int) $saleItem->quantity);
                $amount = $qty * (float) $saleItem->price;

                \App\Models\SaleReturnItem::create([
                    'sale_return_id' => $return->id,
                    'sale_item_id' => $saleItem->id,
                    'product_id' => $saleItem->product_id,
                    'product_variant_id' => $saleItem->product_variant_id,
                    'quantity' => $qty,
                    'amount' => $amount,
                ]);

                // increment stock back
                if ($saleItem->product_variant_id) {
                    $variant = \App\Models\ProductVariant::lockForUpdate()->find($saleItem->product_variant_id);
                    if ($variant) { $variant->increment('stock_quantity', $qty); }
                } else {
                    $product = \App\Models\Product::lockForUpdate()->find($saleItem->product_id);
                    if ($product) { $product->increment('stock_quantity', $qty); }
                }

                $refundTotal += $amount;
            }

            $return->refund_total = $refundTotal;
            $return->save();

            // Mark sale as returned if full return
            $soldAmount = $sale->items->sum(fn($i) => (float) $i->price * (int) $i->quantity);
            if ($refundTotal >= $soldAmount) {
                $sale->status = 'returned';
                $sale->save();
            }

            return redirect()->back()->with('success', 'Return processed successfully');
        });
    }

    /**
     * Generate invoice PDF
     */
    public function generateInvoice(Sale $sale)
    {
        $sale->load(['customer', 'items.product', 'items.variant', 'payments']);
        
        $pdf = Pdf::loadView('sales.invoice', compact('sale'));
        return $pdf->download('invoice-'.$sale->invoice_number.'.pdf');
    }

    /**
     * Get sales statistics for dashboard
     */
    public function getStatistics(): JsonResponse
    {
        $stats = [
            'total_sales' => Sale::count(),
            'completed_sales' => Sale::where('status', 'completed')->count(),
            'draft_sales' => Sale::where('status', 'draft')->count(),
            'returned_sales' => Sale::where('status', 'returned')->count(),
            'today_sales' => Sale::whereDate('created_at', today())->count(),
            'this_month_sales' => Sale::whereMonth('created_at', now()->month)->count(),
            'total_revenue' => Sale::where('status', 'completed')->sum('total'),
            'total_paid' => Sale::where('status', 'completed')->sum('paid_total'),
        ];

        return response()->json($stats);
    }

    /**
     * Export sales to CSV
     */
    public function export(Request $request)
    {
        // Implementation for CSV export
        return response()->json(['message' => 'Export functionality to be implemented']);
    }
}
