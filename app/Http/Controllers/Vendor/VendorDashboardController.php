<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Vendor;
use App\Models\Product;
use App\Models\Order;
use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class VendorDashboardController extends Controller
{
    public function dashboard(Request $request): Response
    {
        $vendor = Auth::guard('vendor')->user();
        // Get date range for filtering
        $startDate = $request->get('start_date', Carbon::now()->startOfMonth());
        $endDate = $request->get('end_date', Carbon::now()->endOfMonth());

        // Convert to Carbon instances if they're strings
        if (is_string($startDate)) {
            $startDate = Carbon::parse($startDate);
        }
        if (is_string($endDate)) {
            $endDate = Carbon::parse($endDate);
        }

        // Dashboard statistics
        $stats = [
            'total_products' => $vendor->products()->count(),
            'active_products' => $vendor->products()->where('status', 'active')->count(),
            'total_orders' => $vendor->orders()->whereBetween('created_at', [$startDate, $endDate])->count(),
            'pending_orders' => $vendor->orders()->where('status', 'pending')->whereBetween('created_at', [$startDate, $endDate])->count(),
            'completed_orders' => $vendor->orders()->where('status', 'delivered')->whereBetween('created_at', [$startDate, $endDate])->count(),
            'total_sales' => $vendor->sales()->whereBetween('created_at', [$startDate, $endDate])->sum('total'),
            'total_revenue' => $vendor->orders()->where('payment_status', 'paid')->whereBetween('created_at', [$startDate, $endDate])->sum('total_amount'),
            'commission_payable' => $this->calculateCommission($vendor, $startDate, $endDate),
        ];

        // Recent orders
        $recentOrders = $vendor->orders()
            ->with(['customer', 'address'])
            ->latest()
            ->take(5)
            ->get();

        // Top selling products
        $topProducts = $vendor->products()
            ->withCount(['orderItems as total_sold' => function ($query) use ($startDate, $endDate) {
                $query->whereHas('order', function ($q) use ($startDate, $endDate) {
                    $q->whereBetween('created_at', [$startDate, $endDate]);
                });
            }])
            ->orderBy('total_sold', 'desc')
            ->take(5)
            ->get();

        // Sales chart data (last 30 days)
        $salesChartData = $this->getSalesChartData($vendor, 30);

        // Monthly revenue comparison
        $monthlyRevenue = $this->getMonthlyRevenue($vendor);

        return Inertia::render('Vendor/Dashboard', [
            'vendor'=> $vendor,
            'stats' => $stats,
            'recent_orders' => $recentOrders,
            'top_products' => $topProducts,
            'sales_chart' => $salesChartData,
            'monthly_revenue' => $monthlyRevenue,
            'date_range' => [
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d'),
            ]
        ]);
    }

    public function products(Request $request): Response
    {
        $vendor = Auth::guard('vendor')->user();

        $query = $vendor->products()->with(['category', 'brand']);

        // Filter by status
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        // Filter by category
        if ($request->has('category_id') && $request->category_id !== '') {
            $query->where('category_id', $request->category_id);
        }

        // Search by name
        if ($request->has('search') && $request->search !== '') {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $products = $query->withCount('orderItems')
                         ->orderBy('created_at', 'desc')
                         ->paginate(15);

        return Inertia::render('Vendor/Products', [
            'products' => $products,
            'filters' => $request->only(['status', 'category_id', 'search'])
        ]);
    }

    public function orders(Request $request): Response
    {
        $vendor = Auth::guard('vendor')->user();

        $query = $vendor->orders()->with(['customer', 'address']);

        // Filter by status
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        // Filter by payment status
        if ($request->has('payment_status') && $request->payment_status !== '') {
            $query->where('payment_status', $request->payment_status);
        }

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('created_at', [$request->start_date, $request->end_date]);
        }

        $orders = $query->orderBy('created_at', 'desc')
                       ->paginate(15);

        return Inertia::render('Vendor/Orders', [
            'orders' => $orders,
            'filters' => $request->only(['status', 'payment_status', 'start_date', 'end_date'])
        ]);
    }

    public function sales(Request $request): Response
    {
        $vendor = Auth::guard('vendor')->user();

        $query = $vendor->sales()->with(['customer']);

        // Filter by status
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('created_at', [$request->start_date, $request->end_date]);
        }

        $sales = $query->orderBy('created_at', 'desc')
                      ->paginate(15);

        return Inertia::render('Vendor/Sales', [
            'sales' => $sales,
            'filters' => $request->only(['status', 'start_date', 'end_date'])
        ]);
    }

    public function analytics(Request $request): Response
    {
        $vendor = Auth::guard('vendor')->user();

        // Get date range
        $period = $request->get('period', 'month');
        $startDate = $this->getStartDate($period);
        $endDate = Carbon::now();

        // Revenue analytics
        $revenueData = $this->getRevenueAnalytics($vendor, $startDate, $endDate);

        // Product performance
        $productPerformance = $this->getProductPerformance($vendor, $startDate, $endDate);

        // Customer analytics
        $customerAnalytics = $this->getCustomerAnalytics($vendor, $startDate, $endDate);

        return Inertia::render('Vendor/Analytics', [
            'revenue' => $revenueData,
            'product_performance' => $productPerformance,
            'customer_analytics' => $customerAnalytics,
            'period' => $period,
            'date_range' => [
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d'),
            ]
        ]);
    }

    private function calculateCommission($vendor, $startDate, $endDate)
    {
        $totalRevenue = $vendor->orders()
            ->where('payment_status', 'paid')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('total_amount');

        return ($totalRevenue * $vendor->commission_rate) / 100;
    }

    private function getSalesChartData($vendor, $days)
    {
        $data = [];
        $startDate = Carbon::now()->subDays($days - 1)->startOfDay();

        for ($i = 0; $i < $days; $i++) {
            $date = $startDate->copy()->addDays($i);
            $sales = $vendor->orders()
                ->where('payment_status', 'paid')
                ->whereDate('created_at', $date)
                ->sum('total_amount');

            $data[] = [
                'date' => $date->format('Y-m-d'),
                'sales' => $sales,
            ];
        }

        return $data;
    }

    private function getMonthlyRevenue($vendor)
    {
        $months = [];
        for ($i = 11; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $revenue = $vendor->orders()
                ->where('payment_status', 'paid')
                ->whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->sum('total_amount');

            $months[] = [
                'month' => $month->format('M Y'),
                'revenue' => $revenue,
            ];
        }

        return $months;
    }

    private function getStartDate($period)
    {
        return match($period) {
            'week' => Carbon::now()->subWeek(),
            'month' => Carbon::now()->subMonth(),
            'quarter' => Carbon::now()->subQuarter(),
            'year' => Carbon::now()->subYear(),
            default => Carbon::now()->subMonth(),
        };
    }

    private function getRevenueAnalytics($vendor, $startDate, $endDate)
    {
        $totalRevenue = $vendor->orders()
            ->where('payment_status', 'paid')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('total_amount');

        $previousPeriodRevenue = $vendor->orders()
            ->where('payment_status', 'paid')
            ->whereBetween('created_at', [
                $startDate->copy()->subPeriod(),
                $endDate->copy()->subPeriod()
            ])
            ->sum('total_amount');

        $growth = $previousPeriodRevenue > 0
            ? (($totalRevenue - $previousPeriodRevenue) / $previousPeriodRevenue) * 100
            : 0;

        return [
            'total' => $totalRevenue,
            'growth' => round($growth, 2),
            'period' => $startDate->diffForHumans($endDate),
        ];
    }

    private function getProductPerformance($vendor, $startDate, $endDate)
    {
        return $vendor->products()
            ->withCount(['orderItems as total_sold' => function ($query) use ($startDate, $endDate) {
                $query->whereHas('order', function ($q) use ($startDate, $endDate) {
                    $q->whereBetween('created_at', [$startDate, $endDate]);
                });
            }])
            ->withSum(['orderItems as total_revenue' => function ($query) use ($startDate, $endDate) {
                $query->whereHas('order', function ($q) use ($startDate, $endDate) {
                    $q->whereBetween('created_at', [$startDate, $endDate]);
                });
            }], 'price')
            ->orderBy('total_sold', 'desc')
            ->take(10)
            ->get();
    }

    private function getCustomerAnalytics($vendor, $startDate, $endDate)
    {
        $totalCustomers = $vendor->orders()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->distinct('customer_id')
            ->count('customer_id');

        $repeatCustomers = $vendor->orders()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('customer_id')
            ->havingRaw('COUNT(*) > 1')
            ->count();

        $newCustomers = $totalCustomers - $repeatCustomers;

        return [
            'total' => $totalCustomers,
            'new' => $newCustomers,
            'repeat' => $repeatCustomers,
            'retention_rate' => $totalCustomers > 0 ? round(($repeatCustomers / $totalCustomers) * 100, 2) : 0,
        ];
    }
}
