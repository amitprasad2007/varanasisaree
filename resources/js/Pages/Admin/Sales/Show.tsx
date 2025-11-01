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
import { useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';

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
    creditNotes?: any[]; // Added for credit notes
    refunds?: any[]; // Added for refunds
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
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnSelections, setReturnSelections] = useState<{[saleItemId:number]: number}>({});
    const [reason, setReason] = useState('');
    const [attachName, setAttachName] = useState('');
    const [attachPhone, setAttachPhone] = useState('');
    const [attachEmail, setAttachEmail] = useState('');
    const [attaching, setAttaching] = useState(false);
    const handleOpenReturnModal = () => setShowReturnModal(true);
    const handleCloseReturnModal = () => { setShowReturnModal(false); setReturnSelections({}); setReason(''); };
    const handleReturnQtyChange = (saleItemId: number, qty: number, max: number) => {
        if (qty < 0) qty = 0;
        if (qty > max) qty = max;
        setReturnSelections(prev => ({ ...prev, [saleItemId]: qty }));
    };
    const handleReturnSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!sale.customer) {
            return;
        }
        // TODO: Integrate with real API endpoint
        router.post(route('sales.processReturn', sale.id), {
            items: Object.entries(returnSelections).filter(([_, q]) => q > 0).map(([sale_item_id, quantity]) => ({ sale_item_id, quantity })),
            reason,
        }, { onSuccess: () => handleCloseReturnModal() });
    };

    const handleAttachCustomer = () => {
        if (!attachPhone && !attachEmail) return;
        setAttaching(true);
        router.post(route('sales.attachCustomer', sale.id), {
            name: attachName || undefined,
            phone: attachPhone || undefined,
            email: attachEmail || undefined,
        }, {
            onFinish: () => setAttaching(false),
            onSuccess: () => {
                // refresh sale data to reflect attached customer
                router.reload({ only: ['sale'] });
            }
        });
    };

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

                    {/* Credit Notes */}
                    {sale.creditNotes && sale.creditNotes.length > 0 && (
                        <div className="bg-white rounded-md border mt-6">
                            <div className="p-6 border-b">
                                <h3 className="text-lg font-medium flex items-center gap-2">Credit Notes</h3>
                            </div>
                            <div className="p-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Reference</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Related Return</TableHead>
                                            <TableHead>Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sale.creditNotes.map((cn:any) => (
                                            <TableRow key={cn.id}>
                                                <TableCell>{cn.reference || '-'}</TableCell>
                                                <TableCell>₹{Number(cn.amount).toLocaleString()}</TableCell>
                                                <TableCell>{cn.status}</TableCell>
                                                <TableCell>{cn.sale_return_id ? `#${cn.sale_return_id}` : '-'}</TableCell>
                                                <TableCell>{cn.created_at ? format(new Date(cn.created_at), 'MMM dd, yyyy HH:mm') : '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                    {/* Refunds */}
                    {sale.refunds && sale.refunds.length > 0 && (
                        <div className="bg-white rounded-md border mt-6">
                            <div className="p-6 border-b">
                                <h3 className="text-lg font-medium flex items-center gap-2">Refunds</h3>
                            </div>
                            <div className="p-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Reference</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Method</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Related Credit Note</TableHead>
                                            <TableHead>Paid At</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sale.refunds.map((rf:any) => (
                                            <TableRow key={rf.id}>
                                                <TableCell>{rf.reference || '-'}</TableCell>
                                                <TableCell>₹{Number(rf.amount).toLocaleString()}</TableCell>
                                                <TableCell>{rf.method || '-'}</TableCell>
                                                <TableCell>{rf.status}</TableCell>
                                                <TableCell>{rf.credit_note_id ? `#${rf.credit_note_id}` : '-'}</TableCell>
                                                <TableCell>{rf.paid_at ? format(new Date(rf.paid_at), 'MMM dd, yyyy HH:mm') : '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
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

            <Dialog open={showReturnModal} onOpenChange={setShowReturnModal}>
                <DialogTrigger asChild>
                    <Button onClick={handleOpenReturnModal} variant="outline" className="mb-2" disabled={sale.status === 'returned'}>
                        Process Return
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-white">
                    <DialogTitle>Return Items</DialogTitle>
                    <DialogDescription>Select products and quantities to return.</DialogDescription>
                    {!sale.customer && (
                        <div className="mb-3 p-3 border rounded">
                            <div className="text-sm font-medium mb-2">Attach customer to proceed with return</div>
                            <div className="flex flex-col gap-2">
                                <div className="flex gap-2">
                                    <input className="border rounded p-2 w-full" placeholder="Name (optional)" value={attachName} onChange={e=>setAttachName(e.target.value)} />
                                    <input className="border rounded p-2 w-full" placeholder="Phone" value={attachPhone} onChange={e=>setAttachPhone(e.target.value)} />
                                    <input className="border rounded p-2 w-full" placeholder="Email" value={attachEmail} onChange={e=>setAttachEmail(e.target.value)} />
                                </div>
                                <div>
                                    <Button type="button" onClick={handleAttachCustomer} disabled={attaching}>{attaching ? 'Attaching...' : 'Attach Customer'}</Button>
                                </div>
                                <div className="text-xs text-gray-500">Provide phone or email to create a new customer and link to this invoice.</div>
                            </div>
                        </div>
                    )}
                    <form onSubmit={handleReturnSubmit} className="space-y-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Quantity (max)</TableHead>
                                    <TableHead>Return Qty</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sale.items && sale.items.length > 0 ? (
                                    sale.items.map(item => {
                                        // Calculate max returnable qty
                                        const alreadyReturned = sale.returns?.reduce((sum, ret) =>
                                            (ret.items || []).reduce((s, ri) =>
                                                ri.sale_item_id === item.id ? s + ri.quantity : s, sum), 0) || 0;
                                        const maxQty = item.quantity - alreadyReturned;
                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell>{item.product.name}</TableCell>
                                                <TableCell>{maxQty}</TableCell>
                                                <TableCell>
                                                    <input type="number" className="w-20 border rounded p-1" value={returnSelections[item.id] || ''} min="0" max={maxQty} onChange={e => handleReturnQtyChange(item.id, Number(e.target.value), maxQty)} disabled={maxQty === 0} />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : null}
                            </TableBody>
                        </Table>
                        <div>
                            <label className="block font-medium mb-1">Reason (optional)</label>
                            <textarea className="w-full border rounded p-2" value={reason} onChange={e => setReason(e.target.value)} />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={handleCloseReturnModal}>Cancel</Button>
                            <Button type="submit" variant="default" disabled={!sale.customer || Object.values(returnSelections).every(q => !q)}>Submit Return</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
