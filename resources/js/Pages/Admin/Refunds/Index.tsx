import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Download, Eye, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Refund {
  id: number;
  reference: string;
  amount: number;
  method: string;
  status: string;
  reason: string;
  created_at: string;
  customer?: {
    name: string;
    email: string;
  };
  sale?: {
    id: number;
    customer: {
      name: string;
      email: string;
    };
  };
  order?: {
    id: number;
    customer: {
      name: string;
      email: string;
    };
  };
  processed_by?: {
    name: string;
  };
  credit_note?: {
    reference: string;
  };
  refund_transaction?: {
    status: string;
    gateway: string;
  };
}

interface RefundIndexProps {
  refunds: {
    data: Refund[];
    links: any[];
    meta: any;
  };
  filters: {
    status?: string;
    refund_type?: string;
    date_from?: string;
    date_to?: string;
    customer_search?: string;
    reference?: string;
    sort_by?: string;
    sort_direction?: string;
  };
  statusOptions: string[];
  refundTypeOptions: string[];
  statistics: {
    total_refunds: number;
    pending_refunds: number;
    approved_refunds: number;
    completed_refunds: number;
    total_refunded_amount: number;
    credit_note_refunds: number;
    money_refunds: number;
  };
}

const statusBadgeVariants = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  processing: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

const statusIcons = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  processing: AlertCircle,
  completed: CheckCircle,
  failed: XCircle,
  cancelled: XCircle,
};

export default function RefundIndex({ refunds, filters, statusOptions, refundTypeOptions, statistics }: RefundIndexProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (key: string, value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value === "all" ? "" : value
    }));
  };

  const applyFilters = () => {
    router.get(route('refunds.index'), localFilters, {
      preserveState: true,
      replace: true,
    });
  };

  const clearFilters = () => {
    setLocalFilters({});
    router.get(route('refunds.index'), {}, {
      preserveState: true,
      replace: true,
    });
  };

  const getStatusIcon = (status: string) => {
    const IconComponent = statusIcons[status as keyof typeof statusIcons] || Clock;
    return <IconComponent className="h-4 w-4" />;
  };

  const getCustomerInfo = (refund: Refund) => {
    if (refund.customer) {
      return refund.customer;
    }
    if (refund.sale?.customer) {
      return refund.sale.customer;
    }
    if (refund.order?.customer) {
      return refund.order.customer;
    }
    return { name: 'N/A', email: 'N/A' };
  };

  const getSourceTransaction = (refund: Refund) => {
    if (refund.sale) {
      return `Sale #${refund.sale.id}`;
    }
    if (refund.order) {
      return `Order #${refund.order.id}`;
    }
    return 'N/A';
  };

  return (
    <DashboardLayout title="Refund Management">
      <Head title="Refund Management" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Refund Management</h1>
            <p className="text-muted-foreground">
              Manage customer refund requests and process refunds
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.get(route('refunds.export'))}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => router.get(route('refunds.create'))}>
              Create Refund
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total_refunds}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{statistics.pending_refunds}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statistics.completed_refunds}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <span className="text-sm text-muted-foreground">₹</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{statistics.total_refunded_amount.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={localFilters.status || ''}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent className='bg-white'>
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
                <Label htmlFor="refund_type">Refund Type</Label>
                <Select
                  value={localFilters.refund_type || ''}
                  onValueChange={(value) => handleFilterChange('refund_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent className='bg-white'>
                    <SelectItem value="all">All Types</SelectItem>
                    {refundTypeOptions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="customer_search">Customer</Label>
                <Input
                  id="customer_search"
                  placeholder="Search by name, email, or phone"
                  value={localFilters.customer_search || ''}
                  onChange={(e) => handleFilterChange('customer_search', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="reference">Reference</Label>
                <Input
                  id="reference"
                  placeholder="Refund reference"
                  value={localFilters.reference || ''}
                  onChange={(e) => handleFilterChange('reference', e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button  className="cursor-pointer" onClick={applyFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
              <Button className="cursor-pointer"  variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Refunds Table */}
        <Card>
          <CardHeader>
            <CardTitle>Refunds</CardTitle>
            <CardDescription>
              A list of all refund requests and their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refunds.data.map((refund) => {
                  const customer = getCustomerInfo(refund);
                  const sourceTransaction = getSourceTransaction(refund);

                  return (
                    <TableRow key={refund.id}>
                      <TableCell className="font-medium">{refund.reference}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">{customer.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{sourceTransaction}</TableCell>
                      <TableCell>₹{refund.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {refund.method?.replace('_', ' ').toUpperCase() || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusBadgeVariants[refund.status as keyof typeof statusBadgeVariants]}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(refund.status)}
                            {refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(refund.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" 
                            size="sm"
                            onClick={() => router.get(route('refunds.show', refund.id))}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination */}
            {refunds.links && refunds.meta && (
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                  {refunds.meta.total > 0
                    ? `Showing ${refunds.meta.from} to ${refunds.meta.to} of ${refunds.meta.total} results`
                    : "No refund records found."}
                </div>
                <div className="flex space-x-2">
                  {refunds.links.map((link, index) => (
                    <Button
                      key={index}
                      variant={link.active ? "default" : "outline"}
                      size="sm"
                      onClick={() => link.url && router.get(link.url)}
                      disabled={!link.url}
                    >
                      <span dangerouslySetInnerHTML={{ __html: link.label }} />
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {/* fallback if no meta/data at all */}
            {(!refunds.meta || refunds.meta.total === 0) && (
              <div className="text-center text-muted-foreground py-8">No refund records found.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
