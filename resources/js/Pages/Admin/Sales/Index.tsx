import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Eye, FileText, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from 'sweetalert2';

interface Sale {
    id: number;
    invoice_number: string;
    customer: {
        id: number;
        name: string;
        email: string;
        phone: string;
    } | null;
    status: string;
    subtotal: number;
    total: number;
    paid_total: number;
    created_at: string;
    items_count: number;
}

interface Props {
    sales: {
        data: Sale[];
        links: any[];
        meta: any;
    };
    filters: any;
    statusOptions: string[];
    customers: Array<{ id: number; name: string }>;
}

const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case 'draft': return 'secondary';
        case 'completed': return 'default';
        case 'returned': return 'destructive';
        default: return 'secondary';
    }
};

export default function SalesIndex({ sales, filters, statusOptions, customers }: Props) {
    const [localFilters, setLocalFilters] = useState(filters);

    const handleFilterChange = (key: string, value: string) => {
        const filterValue = value === 'all' ? '' : value;
        const newFilters = { ...localFilters, [key]: filterValue };
        setLocalFilters(newFilters);
        router.get(route('admin.sales.index'), newFilters, { preserveState: true });
    };

    const handleStatusUpdate = (saleId: number, newStatus: string) => {
        router.put(route('admin.sales.update-status', saleId), {
            status: newStatus,
            notes: `Status updated to ${newStatus}`
        }, {
            preserveState: true,
            onSuccess: () => {
                Swal.fire({
                    title: 'Success!',
                    text: 'Sale status updated successfully',
                    icon: 'success',
                    timer: 4000,
                    showConfirmButton: false
                });
            }
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Sales', href: route('admin.sales.index') },
    ];

    return (
        <DashboardLayout title="Sales Management">
            <Head title="Sales Management" />
            <div className="space-y-4 pb-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Sales Management</h1>
                        <p className="text-muted-foreground">Manage and track POS sales</p>
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
                                placeholder="Invoice, Customer..."
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
                        <label className="text-sm font-medium mb-2 block">Date From</label>
                        <Input
                            type="date"
                            value={localFilters.date_from || ''}
                            onChange={(e) => handleFilterChange('date_from', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-2 block">Date To</label>
                        <Input
                            type="date"
                            value={localFilters.date_to || ''}
                            onChange={(e) => handleFilterChange('date_to', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Sales Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice #</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Subtotal</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Paid</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sales.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-8">
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                                        <h3 className="text-lg font-medium">No sales found</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            No sales match your current filters.
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            sales.data.map((sale) => (
                                <TableRow key={sale.id}>
                                    <TableCell className="font-medium">
                                        <Link href={route('admin.sales.show', sale.id)} className="text-blue-600 hover:underline">
                                            {sale.invoice_number}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        {sale.customer ? (
                                            <div>
                                                <div className="font-medium">{sale.customer.name}</div>
                                                <div className="text-sm text-gray-500">{sale.customer.email}</div>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">Walk-in Customer</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{sale.items_count}</TableCell>
                                    <TableCell>₹{sale.subtotal.toLocaleString()}</TableCell>
                                    <TableCell>₹{sale.total.toLocaleString()}</TableCell>
                                    <TableCell>₹{sale.paid_total.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadgeVariant(sale.status)}>
                                            {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{format(new Date(sale.created_at), 'MMM dd, yyyy')}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                                onClick={() => router.visit(route('admin.sales.show', sale.id))}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                                onClick={() => window.open(`/pos/sales/${sale.id}/invoice`, '_blank')}
                                            >
                                                <FileText className="h-4 w-4" />
                                            </Button>
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
