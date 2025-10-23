import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    ShoppingCart,
    CreditCard,
    TrendingUp,
    Users,
    Package,
    Eye,
    FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { router } from '@inertiajs/react';

interface Transaction {
    id: number;
    type: 'sale' | 'order';
    reference: string; // invoice_number or order_id
    customer: {
        name: string;
        email?: string;
    } | null;
    amount: number;
    status: string;
    created_at: string;
    items_count: number;
}

interface Props {
    recentSales: Transaction[];
    recentOrders: Transaction[];
    statistics: {
        totalSales: number;
        totalOrders: number;
        totalRevenue: number;
        totalCustomers: number;
        todaySales: number;
        todayOrders: number;
    };
}

export default function UnifiedTransactions({ recentSales, recentOrders, statistics }: Props) {
    const [activeTab, setActiveTab] = useState('overview');

    const getStatusBadgeVariant = (status: string, type: string) => {
        if (type === 'sale') {
            switch (status) {
                case 'draft': return 'secondary';
                case 'completed': return 'default';
                case 'returned': return 'destructive';
                default: return 'secondary';
            }
        } else {
            switch (status) {
                case 'pending': return 'secondary';
                case 'processing': return 'default';
                case 'shipped': return 'default';
                case 'delivered': return 'default';
                case 'cancelled': return 'destructive';
                default: return 'secondary';
            }
        }
    };

    const getStatusLabel = (status: string, type: string) => {
        if (type === 'sale') {
            return status.charAt(0).toUpperCase() + status.slice(1);
        } else {
            return status.charAt(0).toUpperCase() + status.slice(1);
        }
    };

    return (
        <DashboardLayout title="Unified Transactions">
            <Head title="Unified Transactions" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Unified Transactions</h1>
                    <p className="text-muted-foreground">
                        Overview of all sales and orders in one place
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.totalSales}</div>
                            <p className="text-xs text-muted-foreground">
                                +{statistics.todaySales} today
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.totalOrders}</div>
                            <p className="text-xs text-muted-foreground">
                                +{statistics.todayOrders} today
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{statistics.totalRevenue.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                All transactions
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.totalCustomers}</div>
                            <p className="text-xs text-muted-foreground">
                                Registered customers
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Transactions Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="sales">Recent Sales</TabsTrigger>
                        <TabsTrigger value="orders">Recent Orders</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Sales */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ShoppingCart className="h-5 w-5" />
                                        Recent Sales
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {recentSales.slice(0, 5).map((sale) => (
                                            <div key={`sale-${sale.id}`} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{sale.reference}</span>
                                                        <Badge variant={getStatusBadgeVariant(sale.status, 'sale')}>
                                                            {getStatusLabel(sale.status, 'sale')}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {sale.customer?.name || 'Walk-in Customer'} • {sale.items_count} items
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {format(new Date(sale.created_at), 'MMM dd, yyyy HH:mm')}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium">₹{sale.amount.toLocaleString()}</div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.visit(route('admin.sales.show', sale.id))}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => router.visit(route('admin.sales.index'))}
                                        >
                                            View All Sales
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Orders */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Recent Orders
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {recentOrders.slice(0, 5).map((order) => (
                                            <div key={`order-${order.id}`} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{order.reference}</span>
                                                        <Badge variant={getStatusBadgeVariant(order.status, 'order')}>
                                                            {getStatusLabel(order.status, 'order')}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {order.customer?.name} • {order.items_count} items
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium">₹{order.amount.toLocaleString()}</div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.visit(route('admin.orders.show', order.id))}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => router.visit(route('admin.orders.index'))}
                                        >
                                            View All Orders
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="sales">
                        <Card>
                            <CardHeader>
                                <CardTitle>All Recent Sales</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Invoice #</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentSales.map((sale) => (
                                            <TableRow key={`sale-${sale.id}`}>
                                                <TableCell className="font-medium">{sale.reference}</TableCell>
                                                <TableCell>{sale.customer?.name || 'Walk-in Customer'}</TableCell>
                                                <TableCell>₹{sale.amount.toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusBadgeVariant(sale.status, 'sale')}>
                                                        {getStatusLabel(sale.status, 'sale')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{format(new Date(sale.created_at), 'MMM dd, yyyy')}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => router.visit(route('admin.sales.show', sale.id))}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => window.open(`/pos/sales/${sale.id}/invoice`, '_blank')}
                                                        >
                                                            <FileText className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="orders">
                        <Card>
                            <CardHeader>
                                <CardTitle>All Recent Orders</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Order #</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentOrders.map((order) => (
                                            <TableRow key={`order-${order.id}`}>
                                                <TableCell className="font-medium">{order.reference}</TableCell>
                                                <TableCell>{order.customer?.name}</TableCell>
                                                <TableCell>₹{order.amount.toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusBadgeVariant(order.status, 'order')}>
                                                        {getStatusLabel(order.status, 'order')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{format(new Date(order.created_at), 'MMM dd, yyyy')}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.visit(route('admin.orders.show', order.id))}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
