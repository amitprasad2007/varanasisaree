import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    Truck,
    User,
    Package,
    CreditCard,
    MapPin,
    MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from 'sweetalert2';

interface OrderItem {
    id: number;
    product: {
        id: number;
        name: string;
        slug: string;
        imageproducts?: Array<{ image_path: string }>;
    };
    product_variant?: {
        id: number;
        color: {
            name: string;
        };
        size: {
            name: string;
        };
        sku: string;
    };
    quantity: number;
    price: number;
}

interface StatusLog {
    id: number;
    status_from: string;
    status_to: string;
    notes: string;
    changed_at: string;
    changed_by?: {
        id: number;
        name: string;
    };
}

interface Order {
    id: number;
    order_id: string;
    customer: {
        id: number;
        name: string;
        email: string;
        phone: string;
    };
    address: {
        address_line_1: string;
        address_line_2?: string;
        city: string;
        state: string;
        pincode: string;
        country: string;
    };
    cart_items?: OrderItem[];
    total_amount: number;
    sub_total: number;
    status: string;
    payment_status: string;
    payment_method: string;
    order_priority: string;
    created_at: string;
    awb_number?: string;
    tracking_number?: string;
    shipped_at?: string;
    delivered_at?: string;
    shipping_notes?: string;
    assigned_to?: {
        id: number;
        name: string;
    };
    status_logs?: StatusLog[];
}

interface Props {
    order: Order;
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

export default function OrderShow({ order }: Props) {
    //console.log(order.status_logs);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isAssigningAwb, setIsAssigningAwb] = useState(false);
    const [newStatus, setNewStatus] = useState(order.status);
    const [statusNotes, setStatusNotes] = useState('');
    const [awbNumber, setAwbNumber] = useState(order.awb_number || '');
    const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '');
    const [shippingNotes, setShippingNotes] = useState(order.shipping_notes || '');

    const handleStatusUpdate = () => {
        setIsUpdatingStatus(true);
        router.put(route('orders.update-status', order.id), {
            status: newStatus,
            notes: statusNotes
        }, {
            onSuccess: () => {
                setIsUpdatingStatus(false);
                setStatusNotes('');
                Swal.fire({
                    title: 'Success!',
                    text: 'Order status updated successfully',
                    icon: 'success',
                    timer: 4000,
                    showConfirmButton: false
                });
            },
            onError: () => {
                setIsUpdatingStatus(false);
            }
        });
    };

    const handleAssignAwb = () => {
        setIsAssigningAwb(true);
        router.put(route('orders.assign-awb', order.id), {
            awb_number: awbNumber || undefined,
            tracking_number: trackingNumber,
            shipping_notes: shippingNotes
        }, {
            onSuccess: () => {
                setIsAssigningAwb(false);
                Swal.fire({
                    title: 'Success!',
                    text: 'AWB number assigned successfully',
                    icon: 'success',
                    timer: 4000,
                    showConfirmButton: false
                });
            },
            onError: () => {
                setIsAssigningAwb(false);
            }
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Orders', href: route('orders.index') },
        { title: `Order ${order.order_id}`, href: route('orders.show', order.id) },
    ];

    return (
        <DashboardLayout title={`Order ${order.order_id}`}>
            <Head title={`Order ${order.order_id}`} />
            <div className="space-y-4 pb-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                            onClick={() => router.visit(route('orders.index'))}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Orders
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Order {order.order_id}</h1>
                            <p className="text-muted-foreground">Placed on {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant={getStatusBadgeVariant(order.status)} className="text-lg px-4 py-2">
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                        <Badge variant={getPriorityBadgeVariant(order.order_priority)}>
                            {order.order_priority.charAt(0).toUpperCase() + order.order_priority.slice(1)}
                        </Badge>
                    </div>
                </div>
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="bg-white rounded-md border">
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-medium flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Order Items
                            </h3>
                        </div>
                        <div className="p-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Variant</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {order.cart_items && order.cart_items.length > 0 ? (
                                            order.cart_items.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{item.product.name}</div>
                                                            <div className="text-sm text-gray-500">SKU: {item.product.slug}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {item.product_variant ? (
                                                            <div>
                                                                <div>Color: {item.product_variant.color.name}</div>
                                                                <div>Size: {item.product_variant.size.name}</div>
                                                                <div>SKU: {item.product_variant.sku}</div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400">No variant</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{item.quantity}</TableCell>
                                                    <TableCell>₹{item.price.toLocaleString()}</TableCell>
                                                    <TableCell>₹{(item.price * item.quantity).toLocaleString()}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                                    No items in this order
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Status History */}
                    <div className="bg-white rounded-md border">
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-medium flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                Status History
                            </h3>
                        </div>
                        <div className="p-6">
                                {order.status_logs && order.status_logs.length > 0 ? (
                                    <div className="space-y-4">
                                        {order.status_logs.map((log) => (
                                            <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="outline">
                                                            {log.status_from || 'New'} → {log.status_to}
                                                        </Badge>
                                                        <span className="text-sm text-gray-500">
                                                            {format(new Date(log.changed_at), 'MMM dd, yyyy HH:mm')}
                                                        </span>
                                                    </div>
                                                    {log.notes && (
                                                        <p className="text-sm text-gray-600">{log.notes}</p>
                                                    )}
                                                    {log.changed_by && (
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            Changed by: {log.changed_by.name}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No status history available
                                    </div>
                                )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Customer Information */}
                    <div className="bg-white rounded-md border">
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-medium flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Customer Information
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Name</label>
                                    <p className="font-medium">{order.customer.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Email</label>
                                    <p>{order.customer.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Phone</label>
                                    <p>{order.customer.phone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-md border">
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-medium flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Shipping Address
                            </h3>
                        </div>
                        <div className="p-6">
                                <div className="space-y-2">
                                    <p>{order.address.address_line_1}</p>
                                    {order.address.address_line_2 && <p>{order.address.address_line_2}</p>}
                                    <p>{order.address.city}, {order.address.state} {order.address.pincode}</p>
                                    <p>{order.address.country}</p>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white rounded-md border">
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-medium flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Order Summary
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>₹{order.sub_total.toLocaleString()}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total:</span>
                                    <span>₹{order.total_amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Payment Method:</span>
                                    <span className="capitalize">{order.payment_method}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Payment Status:</span>
                                    <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                                        {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                                    </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Information */}
                    {order.awb_number && (
                        <div className="bg-white rounded-md border">
                            <div className="p-6 border-b">
                                <h3 className="text-lg font-medium flex items-center gap-2">
                                    <Truck className="h-5 w-5" />
                                    Shipping Information
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">AWB Number</label>
                                        <p className="font-mono font-bold">{order.awb_number}</p>
                                    </div>
                                    {order.tracking_number && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Tracking Number</label>
                                            <p className="font-mono">{order.tracking_number}</p>
                                        </div>
                                    )}
                                    {order.shipped_at && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Shipped At</label>
                                            <p>{format(new Date(order.shipped_at), 'MMM dd, yyyy HH:mm')}</p>
                                        </div>
                                    )}
                                    {order.delivered_at && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Delivered At</label>
                                            <p>{format(new Date(order.delivered_at), 'MMM dd, yyyy HH:mm')}</p>
                                        </div>
                                    )}
                                    {order.shipping_notes && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Shipping Notes</label>
                                            <p className="text-sm">{order.shipping_notes}</p>
                                        </div>
                                    )}
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="bg-white rounded-md border">
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-medium">Quick Actions</h3>
                        </div>
                        <div className="p-6 space-y-4">
                                {/* Update Status */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Update Status</label>
                                    <Select value={newStatus} onValueChange={setNewStatus}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="processing">Processing</SelectItem>
                                            <SelectItem value="shipped">Shipped</SelectItem>
                                            <SelectItem value="delivered">Delivered</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Textarea
                                        placeholder="Add notes (optional)"
                                        value={statusNotes}
                                        onChange={(e) => setStatusNotes(e.target.value)}
                                        rows={2}
                                    />
                                    <Button
                                        onClick={handleStatusUpdate}
                                        variant="outline"
                                        disabled={isUpdatingStatus || newStatus === order.status}
                                        className="w-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        {isUpdatingStatus ? 'Updating...' : 'Update Status'}
                                    </Button>
                                </div>

                                <Separator />

                                {/* Assign AWB */}
                                {!order.awb_number && order.status === 'processing' && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Assign AWB</label>
                                        <Input
                                            placeholder="AWB Number (auto-generated if empty)"
                                            value={awbNumber}
                                            onChange={(e) => setAwbNumber(e.target.value)}
                                        />
                                        <Input
                                            placeholder="Tracking Number (optional)"
                                            value={trackingNumber}
                                            onChange={(e) => setTrackingNumber(e.target.value)}
                                        />
                                        <Textarea
                                            placeholder="Shipping Notes (optional)"
                                            value={shippingNotes}
                                            onChange={(e) => setShippingNotes(e.target.value)}
                                            rows={2}
                                        />
                                        <Button
                                            variant="outline"
                                            onClick={handleAssignAwb}
                                            disabled={isAssigningAwb}
                                            className="w-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                        >
                                            {isAssigningAwb ? 'Assigning...' : 'Assign AWB'}
                                        </Button>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
