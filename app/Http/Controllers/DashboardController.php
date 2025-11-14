<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Sale;
use App\Models\Product;
use App\Models\Customer;
use App\Models\User;
use App\Models\Refund;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Vendor;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        // Date ranges for analytics
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();
        $thisWeek = Carbon::now()->startOfWeek();
        $lastWeek = Carbon::now()->subWeek()->startOfWeek();
        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();

        // Core metrics
        $metrics = $this->getMetrics($today, $yesterday, $thisMonth, $lastMonth);
        
        // Charts data
        $salesChart = $this->getSalesChartData();
        $revenueChart = $this->getRevenueChartData();
        $topProducts = $this->getTopProducts();
        $recentOrders = $this->getRecentOrders();
        $recentSales = $this->getRecentSales();
        $customerInsights = $this->getCustomerInsights();
        $inventoryAlerts = $this->getInventoryAlerts();
        
        return Inertia::render('dashboard', [
            'metrics' => $metrics,
            'salesChart' => $salesChart,
            'revenueChart' => $revenueChart,
            'topProducts' => $topProducts,
            'recentOrders' => $recentOrders,
            'recentSales' => $recentSales,
            'customerInsights' => $customerInsights,
            'inventoryAlerts' => $inventoryAlerts,
            'user' => $user,
        ]);
    }

    private function getMetrics($today, $yesterday, $thisMonth, $lastMonth)
    {
        // Sales metrics
        $todaySales = Sale::whereDate('created_at', $today)->sum('total');
        $yesterdaySales = Sale::whereDate('created_at', $yesterday)->sum('total');
        $thisMonthSales = Sale::whereDate('created_at', '>=', $thisMonth)->sum('total');
        $lastMonthSales = Sale::whereBetween('created_at', [$lastMonth, $thisMonth])->sum('total');

        // Order metrics
        $todayOrders = Order::whereDate('created_at', $today)->count();
        $yesterdayOrders = Order::whereDate('created_at', $yesterday)->count();
        $thisMonthOrders = Order::whereDate('created_at', '>=', $thisMonth)->count();
        $lastMonthOrders = Order::whereBetween('created_at', [$lastMonth, $thisMonth])->count();

        // Product metrics
        $totalProducts = Product::count();
        $lowStockProducts = Product::where('stock_quantity', '<=', 10)->count();
        $outOfStockProducts = Product::where('stock_quantity', 0)->count();

        // Customer metrics
        $totalCustomers = Customer::count();
        $newCustomersToday = Customer::whereDate('created_at', $today)->count();
        $newCustomersThisMonth = Customer::whereDate('created_at', '>=', $thisMonth)->count();

        // Revenue calculations
        $totalRevenue = Sale::sum('total') + Order::where('status', 'completed')->sum('total_amount');
        $pendingOrders = Order::whereIn('status', ['pending', 'processing'])->sum('total_amount');

        return [
            'sales' => [
                'today' => $todaySales,
                'yesterday' => $yesterdaySales,
                'this_month' => $thisMonthSales,
                'last_month' => $lastMonthSales,
                'growth_daily' => $yesterdaySales > 0 ? (($todaySales - $yesterdaySales) / $yesterdaySales) * 100 : 0,
                'growth_monthly' => $lastMonthSales > 0 ? (($thisMonthSales - $lastMonthSales) / $lastMonthSales) * 100 : 0,
            ],
            'orders' => [
                'today' => $todayOrders,
                'yesterday' => $yesterdayOrders,
                'this_month' => $thisMonthOrders,
                'last_month' => $lastMonthOrders,
                'growth_daily' => $yesterdayOrders > 0 ? (($todayOrders - $yesterdayOrders) / $yesterdayOrders) * 100 : 0,
                'growth_monthly' => $lastMonthOrders > 0 ? (($thisMonthOrders - $lastMonthOrders) / $lastMonthOrders) * 100 : 0,
            ],
            'products' => [
                'total' => $totalProducts,
                'low_stock' => $lowStockProducts,
                'out_of_stock' => $outOfStockProducts,
                'categories' => Category::count(),
                'brands' => Brand::count(),
            ],
            'customers' => [
                'total' => $totalCustomers,
                'new_today' => $newCustomersToday,
                'new_this_month' => $newCustomersThisMonth,
            ],
            'revenue' => [
                'total' => $totalRevenue,
                'pending' => $pendingOrders,
                'refunds' => Refund::where('refund_status', 'completed')->sum('amount'),
            ]
        ];
    }

    private function getSalesChartData()
    {
        $data = Sale::selectRaw('DATE(created_at) as date, SUM(total) as total, COUNT(*) as count')
            ->where('created_at', '>=', Carbon::now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return $data->map(function ($item) {
            return [
                'date' => $item->date,
                'sales' => $item->total,
                'orders' => $item->count,
            ];
        });
    }

    private function getRevenueChartData()
    {
        $salesData = Sale::selectRaw('DATE(created_at) as date, SUM(total) as total')
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $orderData = Order::selectRaw('DATE(created_at) as date, SUM(total_amount) as total')
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->where('status', 'completed')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'sales' => $salesData,
            'orders' => $orderData,
        ];
    }

    private function getTopProducts()
    {
        // Check if sku column exists, otherwise use id as fallback
        $columns = DB::getSchemaBuilder()->getColumnListing('products');
        $skuColumn = in_array('sku', $columns) ? 'products.sku' : 'CONCAT("PRD-", products.id)';
        
        return DB::table('sale_items')
            ->select('products.name', 
                     DB::raw($skuColumn . ' as sku'), 
                     'products.price', 
                     DB::raw('SUM(sale_items.quantity) as total_sold'),
                     DB::raw('SUM(sale_items.line_total) as total_revenue'))
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->groupBy('products.id', 'products.name', 'products.price')
            ->orderBy('total_sold', 'desc')
            ->limit(10)
            ->get();
    }

    private function getRecentOrders()
    {
        return Order::with(['customer'])
            ->select('id', 'customer_id', 'total_amount', 'status', 'created_at')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'customer_name' => $order->customer ? $order->customer->name : 'Guest',
                    'total' => $order->total_amount,
                    'status' => $order->status,
                    'created_at' => $order->created_at->format('M d, H:i'),
                ];
            });
    }

    private function getRecentSales()
    {
        return Sale::with(['customer'])
            ->select('id', 'customer_id', 'total', 'status', 'created_at', 'invoice_number')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($sale) {
                return [
                    'id' => $sale->id,
                    'invoice_number' => $sale->invoice_number,
                    'customer_name' => $sale->customer ? $sale->customer->name : 'Walk-in Customer',
                    'total' => $sale->total,
                    'status' => $sale->status,
                    'created_at' => $sale->created_at->format('M d, H:i'),
                ];
            });
    }

    private function getCustomerInsights()
    {
        $topCustomers = Customer::withSum('sales', 'total')
            ->orderBy('sales_sum_total', 'desc')
            ->limit(5)
            ->get();

        return [
            'top_customers' => $topCustomers->map(function ($customer) {
                return [
                    'name' => $customer->name,
                    'email' => $customer->email,
                    'total_spent' => $customer->sales_sum_total ?? 0,
                ];
            }),
            'total_customers' => Customer::count(),
            'active_customers' => Customer::whereHas('sales', function ($query) {
                $query->where('created_at', '>=', Carbon::now()->subDays(30));
            })->count(),
        ];
    }

    private function getInventoryAlerts()
    {
        // Check if sku column exists
        $columns = DB::getSchemaBuilder()->getColumnListing('products');
        $selectColumns = ['name', 'stock_quantity as stock'];
        if (in_array('sku', $columns)) {
            $selectColumns[] = 'sku';
        } else {
            $selectColumns[] = DB::raw('CONCAT("PRD-", id) as sku');
        }
        
        return [
            'low_stock' => Product::where('stock_quantity', '<=', 10)
                ->where('stock_quantity', '>', 0)
                ->select($selectColumns)
                ->orderBy('stock_quantity')
                ->limit(10)
                ->get(),
            'out_of_stock' => Product::where('stock_quantity', 0)
                ->select(array_filter($selectColumns, fn($col) => $col !== 'stock_quantity as stock'))
                ->limit(10)
                ->get(),
        ];
    }
}