<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\Order;
use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UnifiedDashboardController extends Controller
{
    /**
     * Display unified dashboard with sales and orders
     */
    public function index(): Response
    {
        // Get recent sales
        $recentSales = Sale::with(['customer'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($sale) {
                return [
                    'id' => $sale->id,
                    'type' => 'sale',
                    'reference' => $sale->invoice_number,
                    'customer' => $sale->customer ? [
                        'name' => $sale->customer->name,
                        'email' => $sale->customer->email,
                    ] : null,
                    'amount' => (float) $sale->total,
                    'status' => $sale->status,
                    'created_at' => $sale->created_at->toISOString(),
                    'items_count' => $sale->items()->count(),
                ];
            });

        // Get recent orders
        $recentOrders = Order::with(['customer'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'type' => 'order',
                    'reference' => $order->order_id,
                    'customer' => $order->customer ? [
                        'name' => $order->customer->name,
                        'email' => $order->customer->email,
                    ] : null,
                    'amount' => (float) $order->total_amount,
                    'status' => $order->status,
                    'created_at' => $order->created_at->toISOString(),
                    'items_count' => $order->productItems()->count(),
                ];
            });

        // Get statistics
        $statistics = [
            'totalSales' => Sale::count(),
            'totalOrders' => Order::count(),
            'totalRevenue' => Sale::where('status', 'completed')->sum('total') + Order::where('status', '!=', 'cancelled')->sum('total_amount'),
            'totalCustomers' => Customer::count(),
            'todaySales' => Sale::whereDate('created_at', today())->count(),
            'todayOrders' => Order::whereDate('created_at', today())->count(),
        ];

        return Inertia::render('Admin/Dashboard/UnifiedTransactions', [
            'recentSales' => $recentSales,
            'recentOrders' => $recentOrders,
            'statistics' => $statistics,
        ]);
    }

    /**
     * Get unified statistics for API
     */
    public function getStatistics()
    {
        $salesStats = [
            'total_sales' => Sale::count(),
            'completed_sales' => Sale::where('status', 'completed')->count(),
            'draft_sales' => Sale::where('status', 'draft')->count(),
            'returned_sales' => Sale::where('status', 'returned')->count(),
            'today_sales' => Sale::whereDate('created_at', today())->count(),
            'this_month_sales' => Sale::whereMonth('created_at', now()->month)->count(),
            'total_sales_revenue' => Sale::where('status', 'completed')->sum('total'),
            'total_sales_paid' => Sale::where('status', 'completed')->sum('paid_total'),
        ];

        $ordersStats = [
            'total_orders' => Order::count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'processing_orders' => Order::where('status', 'processing')->count(),
            'shipped_orders' => Order::where('status', 'shipped')->count(),
            'delivered_orders' => Order::where('status', 'delivered')->count(),
            'cancelled_orders' => Order::where('status', 'cancelled')->count(),
            'unpaid_orders' => Order::where('payment_status', 'unpaid')->count(),
            'today_orders' => Order::whereDate('created_at', today())->count(),
            'this_month_orders' => Order::whereMonth('created_at', now()->month)->count(),
            'total_orders_revenue' => Order::where('status', '!=', 'cancelled')->sum('total_amount'),
        ];

        $unifiedStats = [
            'total_transactions' => $salesStats['total_sales'] + $ordersStats['total_orders'],
            'total_revenue' => $salesStats['total_sales_revenue'] + $ordersStats['total_orders_revenue'],
            'total_customers' => Customer::count(),
            'today_transactions' => $salesStats['today_sales'] + $ordersStats['today_orders'],
            'this_month_transactions' => $salesStats['this_month_sales'] + $ordersStats['this_month_orders'],
        ];

        return response()->json([
            'sales' => $salesStats,
            'orders' => $ordersStats,
            'unified' => $unifiedStats,
        ]);
    }
}
