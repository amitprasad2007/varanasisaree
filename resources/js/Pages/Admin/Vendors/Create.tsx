import React from 'react';
import { useForm, Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Vendors',
        href: '/admin/vendors',
    },
    {
        title: 'Create Vendor',
        href: '/admin/vendors/create',
    },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        username: '',
        business_name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        description: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        gstin: '',
        pan: '',
        contact_person: '',
        contact_email: '',
        contact_phone: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.vendors.store'));
    };

    return (
        <DashboardLayout title="Create Vendor">
            <Head title="Create Vendor" />
            <div className="flex flex-col gap-4 p-4">
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Create New Vendor</h1>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>
                            Set up the vendor's login credentials and basic details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                placeholder="johndoe"
                                required
                            />
                            {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="vendor@example.com"
                                required
                            />
                            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder="+91 9876543210"
                                required
                            />
                            {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">Confirm Password</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Business Information</CardTitle>
                        <CardDescription>
                            Details about the vendor's business entity.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="business_name">Business Name</Label>
                            <Input
                                id="business_name"
                                value={data.business_name}
                                onChange={(e) => setData('business_name', e.target.value)}
                                placeholder="Varanasi Silk House"
                                required
                            />
                            {errors.business_name && <p className="text-sm text-red-500">{errors.business_name}</p>}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Tell us about the business..."
                                className="min-h-[100px]"
                            />
                            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="gstin">GSTIN</Label>
                            <Input
                                id="gstin"
                                value={data.gstin}
                                onChange={(e) => setData('gstin', e.target.value)}
                                placeholder="22AAAAA0000A1Z5"
                            />
                            {errors.gstin && <p className="text-sm text-red-500">{errors.gstin}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pan">PAN</Label>
                            <Input
                                id="pan"
                                value={data.pan}
                                onChange={(e) => setData('pan', e.target.value)}
                                placeholder="ABCDE1234F"
                            />
                            {errors.pan && <p className="text-sm text-red-500">{errors.pan}</p>}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Address Information</CardTitle>
                        <CardDescription>
                            Location details of the vendor.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                placeholder="123, Silk Road"
                            />
                            {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                value={data.city}
                                onChange={(e) => setData('city', e.target.value)}
                                placeholder="Varanasi"
                            />
                            {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input
                                id="state"
                                value={data.state}
                                onChange={(e) => setData('state', e.target.value)}
                                placeholder="Uttar Pradesh"
                            />
                            {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Input
                                id="country"
                                value={data.country}
                                onChange={(e) => setData('country', e.target.value)}
                                placeholder="India"
                            />
                            {errors.country && <p className="text-sm text-red-500">{errors.country}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="postal_code">Postal Code</Label>
                            <Input
                                id="postal_code"
                                value={data.postal_code}
                                onChange={(e) => setData('postal_code', e.target.value)}
                                placeholder="221001"
                            />
                            {errors.postal_code && <p className="text-sm text-red-500">{errors.postal_code}</p>}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Contact Person</CardTitle>
                        <CardDescription>
                            Primary contact details for the vendor.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="contact_person">Contact Person Name</Label>
                            <Input
                                id="contact_person"
                                value={data.contact_person}
                                onChange={(e) => setData('contact_person', e.target.value)}
                                placeholder="Jane Doe"
                            />
                            {errors.contact_person && <p className="text-sm text-red-500">{errors.contact_person}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contact_email">Contact Email</Label>
                            <Input
                                id="contact_email"
                                type="email"
                                value={data.contact_email}
                                onChange={(e) => setData('contact_email', e.target.value)}
                                placeholder="jane@example.com"
                            />
                            {errors.contact_email && <p className="text-sm text-red-500">{errors.contact_email}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contact_phone">Contact Phone</Label>
                            <Input
                                id="contact_phone"
                                value={data.contact_phone}
                                onChange={(e) => setData('contact_phone', e.target.value)}
                                placeholder="+91 9876543210"
                            />
                            {errors.contact_phone && <p className="text-sm text-red-500">{errors.contact_phone}</p>}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => window.history.back()}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={processing}  variant="outline" className='bg-green-500 hover:bg-green-600 cursor-pointer'>
                        {processing ? 'Creating...' : 'Create Vendor'}
                    </Button>
                </div>
            </form>
        </DashboardLayout>
    );
}