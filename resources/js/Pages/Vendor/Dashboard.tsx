import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    TrendingUp,
    TrendingDown,
    Package,
    ShoppingCart,
    DollarSign,
    Users,
    BarChart3,
    Calendar,
    Eye
} from 'lucide-react';

interface DashboardProps {
    stats: {
        total_products: number;
        active_products: number;
        total_orders: number;
        pending_orders: number;
        completed_orders: number;
        total_sales: number;
        total_revenue: number;
        commission_payable: number;
    };
    recent_orders: any[];
    top_products: any[];
    sales_chart: Array<{ date: string; sales: number }>;
    monthly_revenue: Array<{ month: string; revenue: number }>;
    date_range: {
        start: string;
        end: string;
    };
}

export default function VendorDashboard({
    stats,
    recent_orders,
    top_products,
    sales_chart,
    monthly_revenue,
    date_range
}: DashboardProps) {
    const [startDate, setStartDate] = useState(date_range.start);
    const [endDate, setEndDate] = useState(date_range.end);

    const handleDateFilter = () => {
        // Redirect with new date range
        window.location.href = `/vendor/dashboard?start_date=${startDate}&end_date=${endDate}`;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
            processing: { color: 'bg-blue-100 text-blue-800', label: 'Processing' },
            shipped: { color: 'bg-purple-100 text-purple-800', label: 'Shipped' },
            delivered: { color: 'bg-green-100 text-green-800', label: 'Delivered' },
            cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        return <Badge className={config.color}>{config.label}</Badge>;
    };

    return (
        <>
            <Head title="Vendor Dashboard" />

            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-600">Welcome back! Here's what's happening with your business.</p>
                    </div>

                    {/* Date Filter */}
                    <Card className="mb-8">
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <Label htmlFor="start_date">From:</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Label htmlFor="end_date">To:</Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                                <Button onClick={handleDateFilter}>
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Apply Filter
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Package className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Total Products</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.total_products}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <ShoppingCart className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Total Orders</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.total_orders}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <DollarSign className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_revenue)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-orange-100 rounded-lg">
                                        <Users className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Commission Payable</p>
                                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.commission_payable)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts and Analytics */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Sales Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Sales Overview</CardTitle>
                                <CardDescription>Daily sales for the selected period</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64 flex items-end justify-between space-x-2">
                                    {sales_chart.map((day, index) => (
                                        <div key={index} className="flex flex-col items-center">
                                            <div
                                                className="w-8 bg-blue-500 rounded-t"
                                                style={{ height: `${(day.sales / Math.max(...sales_chart.map(d => d.sales))) * 200 }px` }}
                                            ></div>
                                            <span className="text-xs text-gray-500 mt-2">{day.date}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Monthly Revenue */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Monthly Revenue</CardTitle>
                                <CardDescription>Revenue trends over the last 12 months</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {monthly_revenue.slice(-6).map((month, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">{month.month}</span>
                                            <span className="font-medium">{formatCurrency(month.revenue)}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Orders and Top Products */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Recent Orders */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Orders</CardTitle>
                                <CardDescription>Latest customer orders</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recent_orders.map((order) => (
                                        <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium">Order #{order.order_id}</p>
                                                <p className="text-sm text-gray-600">
                                                    {order.customer?.name || 'Customer'} • {formatCurrency(order.total_amount)}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {getStatusBadge(order.status)}
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 text-center">
                                    <Button variant="outline" className="w-full">
                                        View All Orders
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top Products */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Top Selling Products</CardTitle>
                                <CardDescription>Your best performing products</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {top_products.map((product) => (
                                        <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium">{product.name}</p>
                                                <p className="text-sm text-gray-600">
                                                    {product.total_sold} units sold
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">{formatCurrency(product.total_revenue || 0)}</p>
                                                <p className="text-sm text-gray-600">Revenue</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 text-center">
                                    <Button variant="outline" className="w-full">
                                        View All Products
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
