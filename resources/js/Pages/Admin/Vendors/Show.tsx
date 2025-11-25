import React, { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Building2, Mail, Phone, MapPin, Globe, Calendar, Shield,
    CheckCircle, XCircle, AlertTriangle, DollarSign, FileText,
    CreditCard, User, Activity, Trash2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Swal from 'sweetalert2';
import { Breadcrumbs } from '@/components/breadcrumbs';

interface Vendor {
    id: number;
    username: string;
    business_name: string;
    email: string;
    phone: string;
    status: 'pending' | 'active' | 'suspended' | 'inactive';
    is_verified: boolean;
    subdomain: string;
    logo: string | null;
    description: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postal_code: string | null;
    gstin: string | null;
    pan: string | null;
    bank_name: string | null;
    account_number: string | null;
    ifsc_code: string | null;
    commission_rate: number;
    payment_terms: string | null;
    contact_person: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    created_at: string;
    subdomain_url: string;
}

interface Props {
    vendor: Vendor;
}

export default function Show({ vendor }: Props) {
    const breadcrumbs = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Vendors', href: route('admin.vendors.index') },
        { title: vendor.business_name, href: '#' },
    ];
    const appUrl = import.meta.env.VITE_APP_URL;
    const { data: commissionData, setData: setCommissionData, put: putCommission, processing: commissionProcessing, errors: commissionErrors } = useForm({
        commission_rate: vendor.commission_rate || 0,
    });

    const { data: paymentData, setData: setPaymentData, put: putPayment, processing: paymentProcessing, errors: paymentErrors } = useForm({
        payment_terms: vendor.payment_terms || '',
    });

    const handleAction = (action: 'approve' | 'reject' | 'suspend' | 'activate' | 'delete') => {
        const config = {
            approve: {
                title: 'Approve Vendor?',
                text: 'This will activate the vendor account and mark it as verified.',
                confirmBtn: 'Yes, Approve',
                color: '#10B981',
                route: 'admin.vendors.approve',
                method: 'post' as const
            },
            reject: {
                title: 'Reject Vendor?',
                text: 'This will mark the vendor as inactive.',
                confirmBtn: 'Yes, Reject',
                color: '#EF4444',
                route: 'admin.vendors.reject',
                method: 'post' as const
            },
            suspend: {
                title: 'Suspend Vendor?',
                text: 'The vendor will not be able to access their account.',
                confirmBtn: 'Yes, Suspend',
                color: '#F59E0B',
                route: 'admin.vendors.suspend',
                method: 'post' as const
            },
            activate: {
                title: 'Activate Vendor?',
                text: 'Restore access to the vendor account.',
                confirmBtn: 'Yes, Activate',
                color: '#10B981',
                route: 'admin.vendors.activate',
                method: 'post' as const
            },
            delete: {
                title: 'Delete Vendor?',
                text: 'This action is irreversible. Ensure the vendor has no active orders.',
                confirmBtn: 'Yes, Delete',
                color: '#EF4444',
                route: 'admin.vendors.destroy',
                method: 'delete' as const
            }
        };

        const actionConfig = config[action];

        Swal.fire({
            title: actionConfig.title,
            text: actionConfig.text,
            icon: action === 'delete' ? 'warning' : 'question',
            showCancelButton: true,
            confirmButtonColor: actionConfig.color,
            cancelButtonColor: '#6B7280',
            confirmButtonText: actionConfig.confirmBtn
        }).then((result) => {
            if (result.isConfirmed) {
                // @ts-ignore
                router[actionConfig.method](route(actionConfig.route, vendor.id), {
                    onSuccess: () => {
                        Swal.fire('Success', 'Action completed successfully', 'success');
                    },
                    onError: () => {
                        Swal.fire('Error', 'Something went wrong', 'error');
                    }
                });
            }
        });
    };

    const updateCommission = (e: React.FormEvent) => {
        e.preventDefault();
        putCommission(route('admin.vendors.commission', vendor.id), {
            onSuccess: () => Swal.fire('Updated', 'Commission rate updated', 'success'),
        });
    };

    const updatePaymentTerms = (e: React.FormEvent) => {
        e.preventDefault();
        putPayment(route('admin.vendors.payment-terms', vendor.id), {
            onSuccess: () => Swal.fire('Updated', 'Payment terms updated', 'success'),
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'suspended': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <DashboardLayout title={`Vendor: ${vendor.business_name}`}>
            <Head title={`Vendor - ${vendor.business_name}`} />

            <div className="space-y-6 p-6">
                <Breadcrumbs breadcrumbs={breadcrumbs} />

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-gradient-to-br from-primary/10 to-primary/30 rounded-lg flex items-center justify-center border border-primary/20">
                            {vendor.logo ? (
                                <img src={vendor.logo} alt={vendor.business_name} className="h-full w-full object-cover rounded-lg" />
                            ) : (
                                <Building2 className="h-8 w-8 text-primary" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{vendor.business_name}</h1>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                <User className="h-4 w-4" />
                                <span>{vendor.username}</span>
                                <span className="text-gray-300">|</span>
                                <Globe className="h-4 w-4" />
                                <a href={`http://${vendor.subdomain}.${appUrl}`}
                                        target="_blank" rel="noreferrer" className="text-primary hover:underline">
                                    {vendor.subdomain}.varanasisaree.com
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-2">
                            <Badge className={getStatusColor(vendor.status)}>
                                {vendor.status.toUpperCase()}
                            </Badge>
                            {vendor.is_verified ? (
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
                                    <Shield className="h-3 w-3" /> VERIFIED
                                </Badge>
                            ) : (
                                <Badge className="bg-gray-100 text-gray-800 border-gray-200">UNVERIFIED</Badge>
                            )}
                        </div>
                        <div className="text-xs text-gray-500">
                            Joined: {new Date(vendor.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    {vendor.status === 'pending' && (
                        <>
                            <Button onClick={() => handleAction('approve')} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <CheckCircle className="h-4 w-4 mr-2" /> Approve Vendor
                            </Button>
                            <Button onClick={() => handleAction('reject')} variant="destructive">
                                <XCircle className="h-4 w-4 mr-2" /> Reject Application
                            </Button>
                        </>
                    )}

                    {vendor.status === 'active' && (
                        <Button onClick={() => handleAction('suspend')} className="bg-orange-500 hover:bg-orange-600 text-white">
                            <AlertTriangle className="h-4 w-4 mr-2" /> Suspend Account
                        </Button>
                    )}

                    {(vendor.status === 'suspended' || vendor.status === 'inactive') && (
                        <Button onClick={() => handleAction('activate')} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            <Activity className="h-4 w-4 mr-2" /> Activate Account
                        </Button>
                    )}

                    <div className="flex-grow"></div>

                    <Button onClick={() => handleAction('delete')} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete Vendor
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Business Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-gray-500" />
                                    Business Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-xs text-gray-500 uppercase">Description</Label>
                                    <p className="text-gray-700 mt-1">{vendor.description || 'No description provided.'}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs text-gray-500 uppercase">GSTIN</Label>
                                        <p className="font-medium">{vendor.gstin || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-gray-500 uppercase">PAN</Label>
                                        <p className="font-medium">{vendor.pan || 'N/A'}</p>
                                    </div>
                                </div>
                                <Separator />
                                <div>
                                    <Label className="text-xs text-gray-500 uppercase">Address</Label>
                                    <div className="flex items-start gap-2 mt-1">
                                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                                        <p className="text-gray-700">
                                            {vendor.address}<br />
                                            {vendor.city}, {vendor.state}<br />
                                            {vendor.country} - {vendor.postal_code}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-gray-500" />
                                    Contact Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="font-medium text-sm text-gray-900 border-b pb-2">Primary Contact</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            <a href={`mailto:${vendor.email}`} className="text-primary hover:underline">{vendor.email}</a>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <a href={`tel:${vendor.phone}`} className="text-gray-700 hover:text-primary">{vendor.phone}</a>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-medium text-sm text-gray-900 border-b pb-2">Contact Person</h4>
                                    {vendor.contact_person ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <User className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-700">{vendor.contact_person}</span>
                                            </div>
                                            {vendor.contact_email && (
                                                <div className="flex items-center gap-3">
                                                    <Mail className="h-4 w-4 text-gray-400" />
                                                    <a href={`mailto:${vendor.contact_email}`} className="text-primary hover:underline">{vendor.contact_email}</a>
                                                </div>
                                            )}
                                            {vendor.contact_phone && (
                                                <div className="flex items-center gap-3">
                                                    <Phone className="h-4 w-4 text-gray-400" />
                                                    <a href={`tel:${vendor.contact_phone}`} className="text-gray-700 hover:text-primary">{vendor.contact_phone}</a>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm italic">No contact person details provided.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Settings & Stats */}
                    <div className="space-y-6">
                        {/* Financial Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-gray-500" />
                                    Financial Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <form onSubmit={updateCommission} className="space-y-3">
                                    <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="commission_rate"
                                            type="number"
                                            step="0.01"
                                            value={commissionData.commission_rate}
                                            onChange={e => setCommissionData('commission_rate', parseFloat(e.target.value))}
                                            className={commissionErrors.commission_rate ? 'border-red-500' : ''}
                                        />
                                        <Button type="submit" disabled={commissionProcessing} size="sm">
                                            Update
                                        </Button>
                                    </div>
                                    {commissionErrors.commission_rate && <p className="text-xs text-red-500">{commissionErrors.commission_rate}</p>}
                                </form>

                                <Separator />

                                <form onSubmit={updatePaymentTerms} className="space-y-3">
                                    <Label htmlFor="payment_terms">Payment Terms</Label>
                                    <Textarea
                                        id="payment_terms"
                                        value={paymentData.payment_terms}
                                        onChange={e => setPaymentData('payment_terms', e.target.value)}
                                        placeholder="e.g. Net 30, Weekly payout"
                                        className={paymentErrors.payment_terms ? 'border-red-500' : ''}
                                    />
                                    {paymentErrors.payment_terms && <p className="text-xs text-red-500">{paymentErrors.payment_terms}</p>}
                                    <Button type="submit" disabled={paymentProcessing} size="sm" className="w-full">
                                        Update Terms
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Bank Details (Read Only) */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-gray-500" />
                                    Bank Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-xs text-gray-500 uppercase">Bank Name</Label>
                                    <p className="font-medium">{vendor.bank_name || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500 uppercase">Account Number</Label>
                                    <p className="font-medium font-mono">{vendor.account_number || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500 uppercase">IFSC Code</Label>
                                    <p className="font-medium font-mono">{vendor.ifsc_code || 'N/A'}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
