import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { BreadcrumbItem } from '@/types';
import Swal from 'sweetalert2';

interface MenuItem {
    id: number;
    label: string;
    children?: MenuItem[];
}

interface Section {
    id: number;
    name: string;
    vendormenuitems: MenuItem[];
}

interface Props {
    vendor: {
        id: number;
        business_name: string;
        username: string;
    };
    sections: Section[];
    permissions: number[];
}

export default function Permissions({ vendor, sections, permissions }: Props) {
    const { data, setData, post, processing } = useForm({
        permissions: permissions || [],
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Vendors', href: '/admin/vendors' },
        { title: 'Permissions', href: '#' },
    ];

    const handleCheckboxChange = (checked: boolean, id: number) => {
        if (checked) {
            setData('permissions', [...data.permissions, id]);
        } else {
            setData('permissions', data.permissions.filter(p => p !== id));
        }
    };

    const handleSelectAll = (sectionItems: MenuItem[], checked: boolean) => {
        let newPermissions = [...data.permissions];

        const toggleItem = (item: MenuItem) => {
            if (checked) {
                if (!newPermissions.includes(item.id)) newPermissions.push(item.id);
            } else {
                newPermissions = newPermissions.filter(p => p !== item.id);
            }
            if (item.children) {
                item.children.forEach(toggleItem);
            }
        };

        sectionItems.forEach(toggleItem);
        setData('permissions', newPermissions);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.vendors.permissions.update', vendor.id), {
            onSuccess: () => {
                Swal.fire('Success', 'Permissions updated successfully', 'success');
            },
        });
    };

    return (
        <DashboardLayout title={`Permissions - ${vendor.business_name}`}>
            <div className="space-y-4 pb-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Manage Permissions</h1>
                        <p className="text-gray-500">For {vendor.business_name} (@{vendor.username})</p>
                    </div>
                </div>
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="p-2">
                    <div className="space-y-6">
                        {sections.map(section => (
                            <Card key={section.id}>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>{section.name}</CardTitle>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSelectAll(section.vendormenuitems, true)}
                                    >
                                        Select All
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {section.vendormenuitems.map(item => (
                                            <div key={item.id} className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`item-${item.id}`}
                                                        checked={data.permissions.includes(item.id)}
                                                        onCheckedChange={(checked) => handleCheckboxChange(checked as boolean, item.id)}
                                                    />
                                                    <Label htmlFor={`item-${item.id}`} className="font-medium">{item.label}</Label>
                                                </div>

                                                {item.children && item.children.length > 0 && (
                                                    <div className="ml-6 space-y-2 border-l-2 border-gray-100 pl-2">
                                                        {item.children.map(child => (
                                                            <div key={child.id} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`item-${child.id}`}
                                                                    checked={data.permissions.includes(child.id)}
                                                                    onCheckedChange={(checked) => handleCheckboxChange(checked as boolean, child.id)}
                                                                />
                                                                <Label htmlFor={`item-${child.id}`}>{child.label}</Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </Card>
                <div className="sticky bottom-0 bg-white p-4 border-t mt-6 flex justify-end shadow-lg">
                    <Button type="submit" variant="outline" disabled={processing} className="min-w-[150px] cursor-pointer hover:bg-gray-600 hover:text-white ">
                        {processing ? 'Saving...' : 'Save Permissions'}
                    </Button>
                </div>
            </form>
        </DashboardLayout>
    );
}
