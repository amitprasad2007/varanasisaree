import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft, Package, User, FileText, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface SaleItem {
    id: number;
    product: { id: number; name: string; slug: string };
    variant: {
        color?: { id: number; name: string } | null;
        size?: { id: number; name: string } | null;
    };
    quantity: number;
    price: number;
}

interface Payment {
    id: number;
    amount: number;
    method: string;
    created_at: string;
}

interface ReturnItem {
    id: number;
    sale_item_id: number;
    product_id: number;
    product_variant_id: number;
    quantity: number;
    amount: number;
}

interface SaleReturn {
    id: number;
    reason: string;
    refund_total: number;
    created_at: string;
    items?: ReturnItem[];
}

interface StatusLog {
    id: number;
    status_from: string;
    status_to: string;
    notes: string;
    changed_by?: { id: number; name: string };
    changed_at: string;
}

interface Sale {
    id: number;
    invoice_number: string;
    customer: { id: number; name: string; email: string; phone: string } | null;
    status: string;
    total: number;
    subtotal: number;
    paid_total: number;
    created_at: string;
    items: SaleItem[];
    payments: Payment[];
    returns: SaleReturn[];
    status_logs?: StatusLog[];
}

interface Props {
    sale: Sale;
}

const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case 'draft': return 'secondary';
        case 'completed': return 'default';
        case 'returned': return 'destructive';
        default: return 'secondary';
    }
};

export default function SaleShow({ sale }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Sales', href: route('sales.index') },
        { title: `Invoice #${sale.invoice_number}`, href: route('sales.show', sale.id) },
    ];

    return (
        <DashboardLayout title={`Invoice #${sale.invoice_number}`}>
            <Head title={`Invoice #${sale.invoice_number}`} />
            <div className="space-y-4 pb-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => router.visit(route('sales.index'))}>
                            <ArrowLeft className="h-4 w-4 mr-2" />Back to Sales
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Invoice #{sale.invoice_number}</h1>
                            <p className="text-muted-foreground">Created on {format(new Date(sale.created_at), 'MMM dd, yyyy HH:mm')}</p>
                        </div>
                    </div>
                    <Badge variant={getStatusBadgeVariant(sale.status)}>
                        {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                    </Badge>
                </div>
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Sale Items */}
                    <div className="bg-white rounded-md border">
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-medium flex items-center gap-2"><Package className="h-5 w-5" />Items Purchased</h3>
                        </div>
                        <div className="p-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Color</TableHead>
                                        <TableHead>Size</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Subtotal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sale.items && sale.items.length > 0 ? (
                                        sale.items.map(item => (
                                            <TableRow key={item.id}>
                                                <TableCell>{item.product.name}</TableCell>
                                                <TableCell>{item.variant?.color?.name || '-'}</TableCell>
                                                <TableCell>{item.variant?.size?.name || '-'}</TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell>₹{item.price.toLocaleString()}</TableCell>
                                                <TableCell>₹{(item.price * item.quantity).toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-gray-500">No items</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Payments */}
                    <div className="bg-white rounded-md border">
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-medium flex items-center gap-2"><FileText className="h-5 w-5" />Payments</h3>
                        </div>
                        <div className="p-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Paid At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sale.payments && sale.payments.length > 0 ? (
                                        sale.payments.map(payment => (
                                            <TableRow key={payment.id}>
                                                <TableCell className="capitalize">{payment.method}</TableCell>
                                                <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                                                <TableCell>{format(new Date(payment.created_at), 'MMM dd, yyyy HH:mm')}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center">No payments recorded</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Returns */}
                    {sale.returns && sale.returns.length > 0 && (
                        <div className="bg-white rounded-md border">
                            <div className="p-6 border-b">
                                <h3 className="text-lg font-medium flex items-center gap-2"><RefreshCw className="h-5 w-5" />Returns</h3>
                            </div>
                            <div className="p-6">
                                {sale.returns.map(ret => (
                                    <div key={ret.id} className="mb-6">
                                        <div className="mb-2 font-medium">Reason: {ret.reason || '-'}</div>
                                        <div className="mb-2">Refund Total: <strong>₹{ret.refund_total.toLocaleString()}</strong></div>
                                        <div>Return Items:</div>
                                        <Table className="mt-2 mb-4">
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Sale Item ID</TableHead>
                                                    <TableHead>Quantity</TableHead>
                                                    <TableHead>Amount</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {ret.items && ret.items.length > 0 ? (
                                                    ret.items.map(ritem => (
                                                        <TableRow key={ritem.id}>
                                                            <TableCell>{ritem.sale_item_id}</TableCell>
                                                            <TableCell>{ritem.quantity}</TableCell>
                                                            <TableCell>₹{ritem.amount.toLocaleString()}</TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={3} className="text-center">No return items</TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                        <div className="text-xs text-gray-500">Returned on {format(new Date(ret.created_at), 'MMM dd, yyyy HH:mm')}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Status Logs */}
                    {sale.status_logs && sale.status_logs.length > 0 && (
                        <div className="bg-white rounded-md border">
                            <div className="p-6 border-b">
                                <h3 className="text-lg font-medium flex items-center gap-2"><FileText className="h-5 w-5" />Status History</h3>
                            </div>
                            <div className="p-6">
                                {sale.status_logs.map(log => (
                                    <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="outline">
                                                    {log.status_from || '---'} → {log.status_to}
                                                </Badge>
                                                <span className="text-sm text-gray-500">
                                                    {format(new Date(log.changed_at), 'MMM dd, yyyy HH:mm')}
                                                </span>
                                            </div>
                                            {log.notes && (
                                                <p className="text-sm text-gray-600">{log.notes}</p>
                                            )}
                                            {log.changed_by && (
                                                <p className="text-xs text-gray-400 mt-1">Changed by: {log.changed_by.name}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Customer Information */}
                    <div className="bg-white rounded-md border">
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-medium flex items-center gap-2"><User className="h-5 w-5" />Customer Information</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            {sale.customer ? (
                                <>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Name</label>
                                        <p className="font-medium">{sale.customer.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Email</label>
                                        <p>{sale.customer.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Phone</label>
                                        <p>{sale.customer.phone}</p>
                                    </div>
                                </>
                            ) : (
                                <div className="text-gray-400">Walk-in Customer</div>
                            )}
                        </div>
                    </div>

                    {/* Sale Summary */}
                    <div className="bg-white rounded-md border">
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-medium flex items-center gap-2">Sale Summary</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>₹{sale.subtotal.toLocaleString()}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total:</span>
                                <span>₹{sale.total.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Paid:</span>
                                <span>₹{sale.paid_total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
