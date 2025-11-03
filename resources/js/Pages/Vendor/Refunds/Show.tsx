import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, CheckCircle, XCircle, Package, User, CreditCard, Calendar } from 'lucide-react';

interface RefundItem {
    id: number;
    product: {
        name: string;
        sku: string;
    };
    quantity: number;
    unit_price: number;
    total_amount: number;
    reason?: string;
}

interface Refund {
    id: number;
    reference: string;
    amount: number;
    refund_status: string;
    method: string;
    reason: string;
    admin_notes?: string;
    rejection_reason?: string;
    created_at: string;
    approved_at?: string;
    processed_at?: string;
    completed_at?: string;
    customer: {
        name: string;
        email: string;
        phone?: string;
    };
    vendor: {
        business_name: string;
    };
    sale?: {
        invoice_number: string;
        total: number;
    };
    order?: {
        order_number: string;
        total_amount: number;
    };
    credit_note?: {
        credit_note_number: string;
        remaining_amount: number;
    };
    refund_items: RefundItem[];
}

interface PageProps {
    refund: Refund;
    vendor: {
        id: number;
        business_name: string;
    };
    can: {
        approve: boolean;
        reject: boolean;
        process: boolean;
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

export default function VendorRefundShow({ refund, vendor, can }: PageProps) {
    const [approvalNotes, setApprovalNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleApprove = () => {
        setProcessing(true);
        router.post(route('vendor.refunds.approve', refund.id), {
            admin_notes: approvalNotes,
        }, {
            onFinish: () => setProcessing(false),
            onSuccess: () => {
                setApprovalNotes('');
            }
        });
    };

    const handleReject = () => {
        if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }
        
        setProcessing(true);
        router.post(route('vendor.refunds.reject', refund.id), {
            rejection_reason: rejectionReason,
            admin_notes: approvalNotes,
        }, {
            onFinish: () => setProcessing(false),
            onSuccess: () => {
                setRejectionReason('');
                setApprovalNotes('');
            }
        });
    };

    return (
        <DashboardLayout>
            <Head title={`Refund ${refund.reference} - ${vendor.business_name}`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('vendor.refunds.index')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Refunds
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Refund Details</h1>
                        <p className="text-gray-600">Reference: {refund.reference}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Refund Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    Refund Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Amount</label>
                                        <p className="text-2xl font-bold">₹{refund.amount.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Status</label>
                                        <div className="mt-1">
                                            <Badge className={getStatusColor(refund.refund_status)}>
                                                {refund.refund_status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Method</label>
                                        <p className="font-medium">
                                            {refund.method === 'credit_note' ? 'Store Credit' : refund.method}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Source</label>
                                        <p className="font-medium">
                                            {refund.sale ? `Sale: ${refund.sale.invoice_number}` : 
                                             refund.order ? `Order: ${refund.order.order_number}` : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-600">Reason</label>
                                    <p className="mt-1">{refund.reason}</p>
                                </div>

                                {refund.admin_notes && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Admin Notes</label>
                                        <p className="mt-1 text-sm bg-gray-50 p-3 rounded">{refund.admin_notes}</p>
                                    </div>
                                )}

                                {refund.rejection_reason && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Rejection Reason</label>
                                        <p className="mt-1 text-sm bg-red-50 p-3 rounded text-red-800">{refund.rejection_reason}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Refund Items */}
                        {refund.refund_items.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Refunded Items</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {refund.refund_items.map((item) => (
                                            <div key={item.id} className="flex justify-between items-center p-4 border rounded">
                                                <div>
                                                    <h4 className="font-medium">{item.product.name}</h4>
                                                    <p className="text-sm text-gray-600">SKU: {item.product.sku}</p>
                                                    {item.reason && (
                                                        <p className="text-sm text-gray-600">Reason: {item.reason}</p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">Qty: {item.quantity}</p>
                                                    <p className="text-sm text-gray-600">₹{item.unit_price} each</p>
                                                    <p className="font-bold">₹{item.total_amount.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Credit Note Information */}
                        {refund.credit_note && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="w-5 h-5" />
                                        Credit Note
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Credit Note Number</label>
                                            <p className="font-medium">{refund.credit_note.credit_note_number}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Remaining Balance</label>
                                            <p className="font-bold text-green-600">₹{refund.credit_note.remaining_amount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* Customer Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Customer
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Name</label>
                                    <p className="font-medium">{refund.customer.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Email</label>
                                    <p>{refund.customer.email}</p>
                                </div>
                                {refund.customer.phone && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Phone</label>
                                        <p>{refund.customer.phone}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Package className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Refund Requested</p>
                                        <p className="text-sm text-gray-600">
                                            {new Date(refund.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {refund.approved_at && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Approved</p>
                                            <p className="text-sm text-gray-600">
                                                {new Date(refund.approved_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {refund.processed_at && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                            <Package className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Processing</p>
                                            <p className="text-sm text-gray-600">
                                                {new Date(refund.processed_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {refund.completed_at && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Completed</p>
                                            <p className="text-sm text-gray-600">
                                                {new Date(refund.completed_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        {(can.approve || can.reject) && refund.refund_status === 'pending' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Notes (Optional)</label>
                                        <Textarea
                                            value={approvalNotes}
                                            onChange={(e) => setApprovalNotes(e.target.value)}
                                            placeholder="Add notes for this action..."
                                            className="mt-1"
                                        />
                                    </div>

                                    {can.reject && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Rejection Reason</label>
                                            <Textarea
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                placeholder="Required if rejecting..."
                                                className="mt-1"
                                            />
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        {can.approve && (
                                            <Button 
                                                onClick={handleApprove}
                                                disabled={processing}
                                                className="flex-1"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Approve
                                            </Button>
                                        )}

                                        {can.reject && (
                                            <Button 
                                                variant="destructive"
                                                onClick={handleReject}
                                                disabled={processing}
                                                className="flex-1"
                                            >
                                                <XCircle className="w-4 h-4 mr-2" />
                                                Reject
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}