import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package, ShoppingCart, Users, TrendingUp, ArrowUpRight, ArrowDownRight,
  DollarSign, AlertTriangle, Eye, Calendar, BarChart3, PieChart,
  RefreshCw, Download, Filter, Bell
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";
import DashboardLayout from "@/Layouts/DashboardLayout";

import { Head } from "@inertiajs/react";

interface DashboardData {
  metrics: {
    sales: {
      today: number;
      yesterday: number;
      this_month: number;
      last_month: number;
      growth_daily: number;
      growth_monthly: number;
    };
    orders: {
      today: number;
      yesterday: number;
      this_month: number;
      last_month: number;
      growth_daily: number;
      growth_monthly: number;
    };
    products: {
      total: number;
      low_stock: number;
      out_of_stock: number;
      categories: number;
      brands: number;
    };
    customers: {
      total: number;
      new_today: number;
      new_this_month: number;
    };
    revenue: {
      total: number;
      pending: number;
      refunds: number;
    };
  };
  salesChart: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
  revenueChart: {
    sales: Array<{ date: string; total: number }>;
    orders: Array<{ date: string; total: number }>;
  };
  topProducts: Array<{
    name: string;
    sku: string;
    price: number;
    total_sold: number;
    total_revenue: number;
  }>;
  recentOrders: Array<{
    id: number;
    customer_name: string;
    total: number;
    status: string;
    created_at: string;
  }>;
  recentSales: Array<{
    id: number;
    invoice_number: string;
    customer_name: string;
    total: number;
    status: string;
    created_at: string;
  }>;
  customerInsights: {
    top_customers: Array<{
      name: string;
      email: string;
      total_spent: number;
    }>;
    total_customers: number;
    active_customers: number;
  };
  inventoryAlerts: {
    low_stock: Array<{ name: string; sku: string; stock: number }>;
    out_of_stock: Array<{ name: string; sku: string }>;
  };
}

const Dashboard = ({
  metrics,
  salesChart,
  revenueChart,
  topProducts,
  recentOrders,
  recentSales,
  customerInsights,
  inventoryAlerts
}: DashboardData) => {

  // Determine the current time in Asia/Kolkata timezone
  const currentTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const hour = new Date(currentTime).getHours();
  let greeting;

  // Set greeting based on the hour of the day
  if (hour < 12) {
    greeting = "Good Morning!";
  } else if (hour < 18) {
    greeting = "Good Afternoon!";
  } else {
    greeting = "Good Evening!";
  }

  return (
    <DashboardLayout title="Business Dashboard">
      <Head title="Dashboard" />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 ">
        {/* Enhanced Header */}
        <div className="bg-white shadow-lg border-b-4 border-blue-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="w-full sm:w-auto">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Business Dashboard</h1>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">{greeting}</h1>
                <p className="text-sm sm:text-base lg:text-lg text-blue-600">Real-time insights and analytics</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <Button variant="outline" className="flex items-center space-x-1 sm:space-x-2 flex-1 sm:flex-none text-xs sm:text-sm">
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Refresh</span>
                </Button>
                <Button className="flex items-center space-x-1 sm:space-x-2 bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none text-xs sm:text-sm">
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Export</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Enhanced Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {/* Today's Sales */}
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
              <CardContent className="p-4 sm:p-5 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs sm:text-sm font-medium uppercase tracking-wide">Today's Sales</p>
                    <p className="text-2xl sm:text-3xl font-bold">₹{metrics?.sales?.today?.toLocaleString() || '0'}</p>
                    <div className="flex items-center mt-2">
                      {(metrics?.sales?.growth_daily || 0) >= 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-green-300" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-300" />
                      )}
                      <span className="text-xs sm:text-sm text-blue-100 ml-1">
                        {Math.abs(metrics?.sales?.growth_daily || 0).toFixed(1)}% vs yesterday
                      </span>
                    </div>
                  </div>
                  <DollarSign className="w-10 h-10 sm:w-12 sm:h-12 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            {/* Today's Orders */}
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
              <CardContent className="p-4 sm:p-5 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-xs sm:text-sm font-medium uppercase tracking-wide">Today's Orders</p>
                    <p className="text-2xl sm:text-3xl font-bold">{metrics?.orders?.today || 0}</p>
                    <div className="flex items-center mt-2">
                      {(metrics?.orders?.growth_daily || 0) >= 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-green-300" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-300" />
                      )}
                      <span className="text-xs sm:text-sm text-green-100 ml-1">
                        {Math.abs(metrics?.orders?.growth_daily || 0).toFixed(1)}% vs yesterday
                      </span>
                    </div>
                  </div>
                  <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 text-green-200" />
                </div>
              </CardContent>
            </Card>

            {/* Total Customers */}
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
              <CardContent className="p-4 sm:p-5 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs sm:text-sm font-medium uppercase tracking-wide">Total Customers</p>
                    <p className="text-2xl sm:text-3xl font-bold">{metrics?.customers?.total?.toLocaleString() || '0'}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-xs sm:text-sm text-purple-100">
                        +{metrics?.customers?.new_today || 0} today
                      </span>
                    </div>
                  </div>
                  <Users className="w-10 h-10 sm:w-12 sm:h-12 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            {/* Inventory Alerts */}
            <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 shadow-lg">
              <CardContent className="p-4 sm:p-5 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-xs sm:text-sm font-medium uppercase tracking-wide">Inventory Alerts</p>
                    <p className="text-2xl sm:text-3xl font-bold">{(metrics?.products?.low_stock || 0) + (metrics?.products?.out_of_stock || 0)}</p>
                    <div className="flex items-center mt-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-300 mr-1" />
                      <span className="text-xs sm:text-sm text-orange-100">
                        {metrics?.products?.out_of_stock || 0} out of stock
                      </span>
                    </div>
                  </div>
                  <Package className="w-10 h-10 sm:w-12 sm:h-12 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Sales Trend Chart */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <span>Sales Trend (Last 30 Days)</span>
                  </div>
                  <Badge variant="secondary">Live</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="h-64 sm:h-72 lg:h-80">
                  {salesChart && salesChart.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesChart}>
                        <XAxis dataKey="date" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1f2937',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white'
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="sales"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p>No sales data available</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Distribution */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="w-5 h-5 text-green-600" />
                  <span>Revenue Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-auto sm:h-80">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 text-sm sm:text-base">Total Revenue</h4>
                      <p className="text-xl sm:text-2xl font-bold text-blue-600">
                        ₹{metrics?.revenue?.total?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 text-sm sm:text-base">Pending Orders</h4>
                      <p className="text-xl sm:text-2xl font-bold text-yellow-600">
                        ₹{metrics?.revenue?.pending?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <div className="bg-red-50 p-3 sm:p-4 rounded-lg">
                      <h4 className="font-semibold text-red-800 text-sm sm:text-base">Refunds</h4>
                      <p className="text-xl sm:text-2xl font-bold text-red-600">
                        ₹{metrics?.revenue?.refunds?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center py-6 sm:py-0">
                    <div className="text-center">
                      <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-700">
                        {metrics?.sales?.this_month && metrics?.sales?.last_month
                          ? ((metrics.sales.this_month - metrics.sales.last_month) / metrics.sales.last_month * 100).toFixed(1)
                          : '0'
                        }%
                      </div>
                      <p className="text-sm text-gray-600 mt-2">Monthly Growth</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Tables Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Top Products */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Top Selling Products</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-2 sm:space-y-3 max-h-64 overflow-y-auto">
                  {topProducts && topProducts.length > 0 ? (
                    topProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.sku}</p>
                          <p className="text-sm text-blue-600">{product.total_sold} sold</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">₹{product.total_revenue?.toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No product data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Recent Orders</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-2 sm:space-y-3 max-h-64 overflow-y-auto">
                  {recentOrders && recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">#{order.id}</p>
                          <p className="text-xs text-gray-500">{order.customer_name}</p>
                          <p className="text-xs text-gray-400">{order.created_at}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">₹{order.total?.toLocaleString()}</p>
                          <Badge variant={order.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No recent orders</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent POS Sales */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Recent POS Sales</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-2 sm:space-y-3 max-h-64 overflow-y-auto">
                  {recentSales && recentSales.length > 0 ? (
                    recentSales.map((sale) => (
                      <div key={sale.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{sale.invoice_number}</p>
                          <p className="text-xs text-gray-500">{sale.customer_name}</p>
                          <p className="text-xs text-gray-400">{sale.created_at}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">₹{sale.total?.toLocaleString()}</p>
                          <Badge variant="default" className="text-xs">
                            {sale.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No recent sales</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Inventory Alerts */}
          {inventoryAlerts && (inventoryAlerts.low_stock?.length > 0 || inventoryAlerts.out_of_stock?.length > 0) && (
            <Card className="shadow-lg border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Inventory Alerts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {inventoryAlerts.out_of_stock?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-red-800 mb-3">Out of Stock ({inventoryAlerts.out_of_stock.length})</h4>
                      <div className="space-y-2">
                        {inventoryAlerts.out_of_stock.slice(0, 5).map((product, index) => (
                          <div key={index} className="bg-red-50 p-3 rounded-lg">
                            <p className="font-medium text-red-900">{product.name}</p>
                            <p className="text-sm text-red-600">{product.sku}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {inventoryAlerts.low_stock?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-orange-800 mb-3">Low Stock ({inventoryAlerts.low_stock.length})</h4>
                      <div className="space-y-2">
                        {inventoryAlerts.low_stock.slice(0, 5).map((product, index) => (
                          <div key={index} className="bg-orange-50 p-3 rounded-lg flex justify-between">
                            <div>
                              <p className="font-medium text-orange-900">{product.name}</p>
                              <p className="text-sm text-orange-600">{product.sku}</p>
                            </div>
                            <Badge variant="outline" className="text-orange-700">
                              {product.stock} left
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;