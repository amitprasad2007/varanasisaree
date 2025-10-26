import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Eye,
  FileText,
  CreditCard
} from 'lucide-react';
import { format } from 'date-fns';

interface Refund {
  id: number;
  reference: string;
  amount: number;
  method: string;
  status: string;
  reason: string;
  created_at: string;
  sale?: {
    id: number;
  };
  order?: {
    id: number;
  };
  credit_note?: {
    reference: string;
    amount: number;
    status: string;
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
  };
  statistics: {
    total_refunds: number;
    pending_refunds: number;
    completed_refunds: number;
    total_refunded_amount: number;
    active_credit_notes: number;
    total_credit_amount: number;
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

export default function CustomerRefundIndex({ refunds, filters, statistics }: RefundIndexProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (key: string, value: string) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    router.get(route('customer.refunds.index'), localFilters, {
      preserveState: true,
      replace: true,
    });
  };

  const getStatusIcon = (status: string) => {
    const IconComponent = statusIcons[status as keyof typeof statusIcons] || Clock;
    return <IconComponent className="h-4 w-4" />;
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
    <DashboardLayout title="My Refunds">
      <Head title="My Refunds" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Refunds</h1>
            <p className="text-muted-foreground">
              Track your refund requests and credit notes
            </p>
          </div>
          <Button onClick={() => router.get(route('customer.refunds.create'))}>
            <Plus className="h-4 w-4 mr-2" />
            Request Refund
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
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
              <CardTitle className="text-sm font-medium">Credit Balance</CardTitle>
              <CreditCard className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{statistics.total_credit_amount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {statistics.active_credit_notes} active credit notes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Select
                  value={localFilters.status || ''}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Select
                  value={localFilters.refund_type || ''}
                  onValueChange={(value) => handleFilterChange('refund_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="credit_note">Credit Note</SelectItem>
                    <SelectItem value="money">Money Refund</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={applyFilters}>
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Refunds Table */}
        <Card>
          <CardHeader>
            <CardTitle>Refund Requests</CardTitle>
            <CardDescription>
              A list of all your refund requests and their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {refunds.data.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No refunds found</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't requested any refunds yet.
                </p>
                <Button onClick={() => router.get(route('customer.refunds.create'))}>
                  <Plus className="h-4 w-4 mr-2" />
                  Request Your First Refund
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
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
                    const sourceTransaction = getSourceTransaction(refund);

                    return (
                      <TableRow key={refund.id}>
                        <TableCell className="font-medium">{refund.reference}</TableCell>
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
                              size="sm"
                              onClick={() => router.get(route('customer.refunds.show', refund.id))}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {refund.status === 'pending' && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Are you sure you want to cancel this refund request?')) {
                                    router.post(route('customer.refunds.cancel', refund.id));
                                  }
                                }}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}

            {/* Pagination */}
            {refunds.links && refunds.data.length > 0 && (
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {refunds.meta.from} to {refunds.meta.to} of {refunds.meta.total} results
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
