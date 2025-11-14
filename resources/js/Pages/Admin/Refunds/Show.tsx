import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  User,
  Package,
  CreditCard,
  FileText,
  Download
} from 'lucide-react';
import { format } from 'date-fns';

interface RefundItem {
  id: number;
  product: {
    name: string;
    sku?: string;
  };
  product_variant?: {
    color?: string;
    size?: string;
  };
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: string;
  reason?: string;
  qc_status: string;
  qc_notes?: string;
}

interface Refund {
  id: number;
  reference: string;
  amount: number;
  method: string;
  status: string;
  reason: string;
  admin_notes?: string;
  rejection_reason?: string;
  created_at: string;
  approved_at?: string;
  processed_at?: string;
  completed_at?: string;
  customer?: {
    name: string;
    email: string;
    phone?: string;
  };
  sale?: {
    id: number;
    customer: {
      name: string;
      email: string;
      phone?: string;
    };
  };
  order?: {
    id: number;
    customer: {
      name: string;
      email: string;
      phone?: string;
    };
  };
  processed_by?: {
    name: string;
  };
  credit_note?: {
    reference: string;
    amount: number;
    status: string;
  };
  refund_transaction?: {
    status: string;
    gateway: string;
    amount: number;
    gateway_transaction_id?: string;
  };
  refund_items: RefundItem[];
}

interface RefundShowProps {
  refund: Refund;
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

const qcStatusBadgeVariants = {
  pending: 'bg-yellow-100 text-yellow-800',
  passed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

export default function RefundShow({ refund }: RefundShowProps) {

  const [showApproveForm, setShowApproveForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [adminNotes, setAdminNotes] = useState(refund.admin_notes || '');
  const [rejectionReason, setRejectionReason] = useState('');

  const getStatusIcon = (status: string) => {
    const IconComponent = statusIcons[status as keyof typeof statusIcons] || Clock;
    return <IconComponent className="h-4 w-4" />;
  };

  const getCustomerInfo = () => {
    if (refund.customer) {
      return refund.customer;
    }
    if (refund.sale?.customer) {
      return refund.sale.customer;
    }
    if (refund.order?.customer) {
      return refund.order.customer;
    }
    return { name: 'N/A', email: 'N/A', phone: 'N/A' };
  };

  const getSourceTransaction = () => {
    if (refund.sale) {
      return { type: 'Sale', id: refund.sale.id };
    }
    if (refund.order) {
      return { type: 'Order', id: refund.order.id };
    }
    return { type: 'N/A', id: 'N/A' };
  };

  const handleApprove = () => {
    console.log('Approve button clicked', { refund_id: refund.id, admin_notes: adminNotes });
    
    // Validate admin notes if provided
    if (adminNotes.length > 1000) {
      alert('Admin notes cannot exceed 1000 characters');
      return;
    }

    router.post(route('refunds.approve', refund.id), {
      admin_notes: adminNotes,
    }, {
      onSuccess: (response) => {
        console.log('Approval successful', response);
        setShowApproveForm(false);
        setAdminNotes(''); // Reset form
      },
      onError: (errors) => {
        console.error('Approval failed', errors);
        // Display specific error message
        const errorMessage = errors.error || 'Failed to approve refund. Please try again.';
        alert(errorMessage);
      },
      onFinish: () => {
        console.log('Approval request finished');
      }
    });
  };

  const handleReject = () => {
    // Validate rejection reason
    if (!rejectionReason.trim()) {
      alert('Rejection reason is required');
      return;
    }
    
    if (rejectionReason.trim().length < 10) {
      alert('Rejection reason must be at least 10 characters long');
      return;
    }
    
    if (rejectionReason.length > 1000) {
      alert('Rejection reason cannot exceed 1000 characters');
      return;
    }
    
    if (adminNotes.length > 1000) {
      alert('Admin notes cannot exceed 1000 characters');
      return;
    }

    router.post(route('refunds.reject', refund.id), {
      rejection_reason: rejectionReason.trim(),
      admin_notes: adminNotes,
    }, {
      onSuccess: () => {
        setShowRejectForm(false);
        setRejectionReason('');
        setAdminNotes('');
      },
      onError: (errors) => {
        console.error('Rejection failed', errors);
        // Display specific error message
        const errorMessage = errors.error || 'Failed to reject refund. Please try again.';
        alert(errorMessage);
      },
    });
  };

  const handleProcess = () => {
    router.post(route('refunds.process', refund.id));
  };

  const handleQcStatusUpdate = (itemId: number, qcStatus: string, qcNotes: string) => {
    router.put(route('refund-items.update-qc-status', itemId), {
      qc_status: qcStatus,
      qc_notes: qcNotes,
    });
  };

  const customer = getCustomerInfo();
  const sourceTransaction = getSourceTransaction();

  return (
    <DashboardLayout title={`Refund ${refund.reference}`}>
      <Head title={`Refund ${refund.reference}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className='cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800'
              size="sm"
              onClick={() => router.get(route('refunds.index'))}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Refunds
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Refund {refund.reference}</h1>
              <p className="text-muted-foreground">
                Created on {format(new Date(refund.created_at), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className={statusBadgeVariants[refund.status as keyof typeof statusBadgeVariants]}>
              <span className="flex items-center gap-1">
                {getStatusIcon(refund.status)}
                {refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}
              </span>
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Refund Details */}
            <Card>
              <CardHeader>
                <CardTitle>Refund Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                    <p className="text-2xl font-bold">₹{refund.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Method</Label>
                    <p className="text-lg">{refund.method?.replace('_', ' ').toUpperCase() || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Reason</Label>
                    <p className="text-sm">{refund.reason}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Source Transaction</Label>
                    <p className="text-sm">{sourceTransaction.type} #{sourceTransaction.id}</p>
                  </div>
                </div>

                {refund.admin_notes && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Admin Notes</Label>
                    <p className="text-sm bg-muted p-3 rounded-md">{refund.admin_notes}</p>
                  </div>
                )}

                {refund.rejection_reason && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Rejection Reason</Label>
                    <p className="text-sm bg-red-50 text-red-800 p-3 rounded-md">{refund.rejection_reason}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Refund Items */}
            <Card>
              <CardHeader>
                <CardTitle>Refund Items</CardTitle>
                <CardDescription>
                  Items included in this refund request
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Variant</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>QC Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {refund.refund_items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.product.name}</div>
                            {item.product.sku && (
                              <div className="text-sm text-muted-foreground">SKU: {item.product.sku}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.product_variant && (
                            <div className="text-sm">
                              {item.product_variant.color && (
                                <div>Color: {item.product_variant.color}</div>
                              )}
                              {item.product_variant.size && (
                                <div>Size: {item.product_variant.size}</div>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>₹{item.unit_price.toLocaleString()}</TableCell>
                        <TableCell>₹{item.total_amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={qcStatusBadgeVariants[item.qc_status as keyof typeof qcStatusBadgeVariants]}>
                            {item.qc_status.charAt(0).toUpperCase() + item.qc_status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newStatus = item.qc_status === 'passed' ? 'failed' : 'passed';
                              handleQcStatusUpdate(item.id, newStatus, item.qc_notes || '');
                            }}
                          >
                            {item.qc_status === 'passed' ? 'Mark Failed' : 'Mark Passed'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                  <p className="text-sm">{customer.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-sm">{customer.email}</p>
                </div>
                {customer.phone && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                    <p className="text-sm">{customer.phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {refund.status === 'pending' && (
                  <>
                    <Button
                      variant="outline"
                      className="w-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setShowApproveForm(true)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Refund
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setShowRejectForm(true)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Refund
                    </Button>
                  </>
                )}

                {refund.status === 'approved' && (
                  <Button
                    className="w-full"
                    onClick={handleProcess}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Process Refund
                  </Button>
                )}

                {refund.credit_note && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {/* Navigate to credit note */}}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Credit Note
                  </Button>
                )}

                {refund.refund_transaction && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {/* Navigate to transaction */}}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    View Transaction
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Requested</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(refund.created_at), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>

                {refund.approved_at && (
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Approved</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(refund.approved_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                )}

                {refund.processed_at && (
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Processed</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(refund.processed_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                )}

                {refund.completed_at && (
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Completed</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(refund.completed_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Approve Form Modal */}
        {showApproveForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Approve Refund</CardTitle>
                <CardDescription>
                  Are you sure you want to approve this refund request?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="admin_notes">Admin Notes (Optional)</Label>
                  <Textarea
                    id="admin_notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add any notes about this approval..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleApprove} className="flex-1">
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowApproveForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reject Form Modal */}
        {showRejectForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Reject Refund</CardTitle>
                <CardDescription>
                  Please provide a reason for rejecting this refund request.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="rejection_reason">Rejection Reason *</Label>
                  <Textarea
                    id="rejection_reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why this refund is being rejected..."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="admin_notes_reject">Admin Notes (Optional)</Label>
                  <Textarea
                    id="admin_notes_reject"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add any additional notes..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    className="flex-1"
                    disabled={!rejectionReason.trim()}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowRejectForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
