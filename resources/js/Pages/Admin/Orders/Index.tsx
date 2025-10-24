import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Eye, Truck, User, Package } from 'lucide-react';
import { format } from 'date-fns';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from 'sweetalert2';

interface Order {
    id: number;
    order_id: string;
    customer: {
        id: number;
        name: string;
        email: string;
        phone: string;
    };
    total_amount: number;
    status: string;
    payment_status: string;
    order_priority: string;
    created_at: string;
    awb_number?: string;
    assigned_to?: {
        id: number;
        name: string;
    };
}

interface Props {
    orders: {
        data: Order[];
        links: any[];
        meta: any;
    };
    filters: any;
    statusOptions: string[];
    paymentStatusOptions: string[];
    priorityOptions: string[];
    assignedUsers: Array<{ id: number; name: string }>;
}

const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case 'pending': return 'secondary';
        case 'processing': return 'default';
        case 'shipped': return 'default';
        case 'delivered': return 'default';
        case 'cancelled': return 'destructive';
        default: return 'secondary';
    }
};

const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
        case 'low': return 'secondary';
        case 'normal': return 'default';
        case 'high': return 'default';
        case 'urgent': return 'destructive';
        default: return 'default';
    }
};

export default function OrdersIndex({ orders, filters, statusOptions, paymentStatusOptions, priorityOptions, assignedUsers }: Props) {
    const [localFilters, setLocalFilters] = useState(filters);

    const handleFilterChange = (key: string, value: string) => {
        // Convert "all" to empty string for backend filtering
        const filterValue = value === 'all' ? '' : value;
        const newFilters = { ...localFilters, [key]: filterValue };
        setLocalFilters(newFilters);
        router.get(route('orders.index'), newFilters, { preserveState: true });
    };

    const handleStatusUpdate = (orderId: number, newStatus: string) => {
        router.put(route('admin.orders.update-status', orderId), {
            status: newStatus,
            notes: `Status updated to ${newStatus}`
        }, {
            preserveState: true,
            onSuccess: () => {
                Swal.fire({
                    title: 'Success!',
                    text: 'Order status updated successfully',
                    icon: 'success',
                    timer: 4000,
                    showConfirmButton: false
                });
            }
        });
    };

    const handleAssignAwb = (orderId: number) => {
        const awbNumber = prompt('Enter AWB Number (leave empty for auto-generation):');
        if (awbNumber !== null) {
            router.put(route('admin.orders.assign-awb', orderId), {
                awb_number: awbNumber || undefined,
                shipping_notes: 'AWB assigned via admin panel'
            }, {
                preserveState: true,
                onSuccess: () => {
                    Swal.fire({
                        title: 'Success!',
                        text: 'AWB number assigned successfully',
                        icon: 'success',
                        timer: 4000,
                        showConfirmButton: false
                    });
                }
            });
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Orders', href: route('orders.index') },
    ];

    return (
        <DashboardLayout title="Order Management">
            <Head title="Order Management" />
            <div className="space-y-4 pb-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Order Management</h1>
                        <p className="text-muted-foreground">Manage and track customer orders</p>
                    </div>
                </div>
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-md border mb-6 p-6">
                <h3 className="text-lg font-medium mb-4">Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="text-sm font-medium mb-2 block">Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Order ID, Customer..."
                                value={localFilters.customer_search || ''}
                                onChange={(e) => handleFilterChange('customer_search', e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-2 block">Status</label>
                        <Select value={localFilters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="all">All Statuses</SelectItem>
                                {statusOptions.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-2 block">Payment Status</label>
                        <Select value={localFilters.payment_status || 'all'} onValueChange={(value) => handleFilterChange('payment_status', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Payment Statuses" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="all">All Payment Statuses</SelectItem>
                                {paymentStatusOptions.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-2 block">Priority</label>
                        <Select value={localFilters.priority || 'all'} onValueChange={(value) => handleFilterChange('priority', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Priorities" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="all">All Priorities</SelectItem>
                                {priorityOptions.map((priority) => (
                                    <SelectItem key={priority} value={priority}>
                                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Assigned To</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-8">
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <Package className="h-12 w-12 text-muted-foreground mb-2" />
                                        <h3 className="text-lg font-medium">No orders found</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            No orders match your current filters.
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.data.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">
                                        <Link href={route('orders.show', order.id)} className="text-blue-600 hover:underline">
                                            {order.order_id}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{order.customer.name}</div>
                                            <div className="text-sm text-gray-500">{order.customer.email}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>₹{order.total_amount.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadgeVariant(order.status)}>
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                                            {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getPriorityBadgeVariant(order.order_priority)}>
                                            {order.order_priority.charAt(0).toUpperCase() + order.order_priority.slice(1)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {order.assigned_to ? (
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                {order.assigned_to.name}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">Unassigned</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{format(new Date(order.created_at), 'MMM dd, yyyy')}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                                onClick={() => router.visit(route('orders.show', order.id))}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            {!order.awb_number && order.status === 'processing' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                                    onClick={() => handleAssignAwb(order.id)}
                                                >
                                                    <Truck className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </DashboardLayout>
    );
}
