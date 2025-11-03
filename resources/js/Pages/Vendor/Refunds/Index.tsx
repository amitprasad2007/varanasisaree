import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Download, TrendingUp, TrendingDown, Clock, CheckCircle } from 'lucide-react';

interface Refund {
    id: number;
    reference: string;
    amount: number;
    refund_status: string;
    method: string;
    reason: string;
    created_at: string;
    customer: {
        name: string;
        email: string;
    };
    sale?: {
        invoice_number: string;
    };
    order?: {
        order_number: string;
    };
}

interface Statistics {
    total_refunds: number;
    pending_refunds: number;
    completed_refunds: number;
    total_refunded_amount: number;
    credit_note_refunds: number;
    money_refunds: number;
}

interface PageProps {
    refunds: {
        data: Refund[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    statistics: Statistics;
    filters: {
        status?: string;
        date_from?: string;
        date_to?: string;
    };
    vendor: {
        id: number;
        business_name: string;
    };
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'approved': return 'bg-blue-100 text-blue-800';
        case 'completed': return 'bg-green-100 text-green-800';
        case 'rejected': return 'bg-red-100 text-red-800';
        case 'processing': return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getMethodBadge = (method: string) => {
    switch (method) {
        case 'credit_note': return <Badge variant="outline">Store Credit</Badge>;
        case 'bank_transfer': return <Badge variant="outline">Bank Transfer</Badge>;
        case 'razorpay': return <Badge variant="outline">Razorpay</Badge>;
        default: return <Badge variant="outline">{method}</Badge>;
    }
};

export default function VendorRefundsIndex({ refunds, statistics, filters, vendor }: PageProps) {
    const [searchFilters, setSearchFilters] = useState({
        status: filters.status || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
    });

    const handleFilter = () => {
        router.get(route('vendor.refunds.index'), searchFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearchFilters({ status: '', date_from: '', date_to: '' });
        router.get(route('vendor.refunds.index'));
    };

    return (
        <DashboardLayout>
            <Head title={`Refunds - ${vendor.business_name}`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Refund Management</h1>
                        <p className="text-gray-600">Manage refunds for {vendor.business_name}</p>
                    </div>
                    <Button asChild>
                        <Link href={route('vendor.refunds.analytics')}>
                            <TrendingUp className="w-4 h-4 mr-2" />
                            View Analytics
                        </Link>
                    </Button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Refunds</p>
                                    <p className="text-3xl font-bold">{statistics.total_refunds}</p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pending</p>
                                    <p className="text-3xl font-bold text-yellow-600">{statistics.pending_refunds}</p>
                                </div>
                                <Clock className="w-8 h-8 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Completed</p>
                                    <p className="text-3xl font-bold text-green-600">{statistics.completed_refunds}</p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Amount</p>
                                    <p className="text-3xl font-bold">₹{statistics.total_refunded_amount.toLocaleString()}</p>
                                </div>
                                <TrendingDown className="w-8 h-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter Refunds</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Select
                                value={searchFilters.status}
                                onValueChange={(value) => setSearchFilters(prev => ({ ...prev, status: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>

                            <Input
                                type="date"
                                placeholder="From Date"
                                value={searchFilters.date_from}
                                onChange={(e) => setSearchFilters(prev => ({ ...prev, date_from: e.target.value }))}
                            />

                            <Input
                                type="date"
                                placeholder="To Date"
                                value={searchFilters.date_to}
                                onChange={(e) => setSearchFilters(prev => ({ ...prev, date_to: e.target.value }))}
                            />

                            <div className="flex gap-2">
                                <Button onClick={handleFilter} className="flex-1">
                                    Filter
                                </Button>
                                <Button variant="outline" onClick={clearFilters}>
                                    Clear
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Refunds Table */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Refunds ({refunds.total})</CardTitle>
                        <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium">Reference</th>
                                        <th className="text-left p-4 font-medium">Customer</th>
                                        <th className="text-left p-4 font-medium">Amount</th>
                                        <th className="text-left p-4 font-medium">Method</th>
                                        <th className="text-left p-4 font-medium">Status</th>
                                        <th className="text-left p-4 font-medium">Date</th>
                                        <th className="text-left p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {refunds.data.map((refund) => (
                                        <tr key={refund.id} className="border-b hover:bg-gray-50">
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-medium">{refund.reference}</p>
                                                    {refund.sale && (
                                                        <p className="text-sm text-gray-600">Sale: {refund.sale.invoice_number}</p>
                                                    )}
                                                    {refund.order && (
                                                        <p className="text-sm text-gray-600">Order: {refund.order.order_number}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-medium">{refund.customer.name}</p>
                                                    <p className="text-sm text-gray-600">{refund.customer.email}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <p className="font-medium">₹{refund.amount.toLocaleString()}</p>
                                            </td>
                                            <td className="p-4">
                                                {getMethodBadge(refund.method)}
                                            </td>
                                            <td className="p-4">
                                                <Badge className={getStatusColor(refund.refund_status)}>
                                                    {refund.refund_status}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm">
                                                    {new Date(refund.created_at).toLocaleDateString()}
                                                </p>
                                            </td>
                                            <td className="p-4">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={route('vendor.refunds.show', refund.id)}>
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {refunds.last_page > 1 && (
                            <div className="flex justify-center mt-6">
                                <div className="flex gap-2">
                                    {refunds.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}