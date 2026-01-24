import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from 'sweetalert2';
import DashboardLayout from '@/Layouts/DashboardLayout';

import {
    Search,
    Filter,
    Plus,
    Eye,
    CheckCircle,
    XCircle,
    Pause,
    Play,
    Trash2,
    MoreHorizontal
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


interface Vendor {
    id: number;
    username: string;
    business_name: string;
    email: string;
    phone: string;
    status: string;
    is_verified: boolean;
    subdomain: string;
    created_at: string;
    products_count: number;
    orders_count: number;
    sales_count: number;
}

interface VendorsIndexProps {
    vendors: {
        data: Vendor[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: {
        total: number;
        pending: number;
        active: number;
        suspended: number;
        verified: number;
    };
    filters: {
        status?: string;
        verified?: string;
        search?: string;
    };
}

export default function VendorsIndex({ vendors, stats, filters }: VendorsIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [verifiedFilter, setVerifiedFilter] = useState(filters.verified || '');

    const { delete: destroy, post } = useForm();

    // Get appUrl from Inertia props
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const appUrl = import.meta.env.VITE_APP_URL;


    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Vendors', href: '/admin/vendors' },
    ];

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (statusFilter) params.append('status', statusFilter);
        if (verifiedFilter) params.append('verified', verifiedFilter);

        window.location.href = `/admin/vendors?${params.toString()}`;
    };

    const handleStatusChange = (vendorId: number, newStatus: string) => {
        const actionMap = {
            'approve': 'approve',
            'activate': 'activate',
            'suspend': 'suspend',
            'reject': 'reject',
        };

        const action = actionMap[newStatus as keyof typeof actionMap];
        if (action) {
            post(`/admin/vendors/${vendorId}/${action}`, {
                onSuccess: () => {
                    Swal.fire({
                        title: 'Success!',
                        text: 'SubCategory updated successfully',
                        icon: 'success',
                        timer: 4000,
                        showConfirmButton: false
                    });
                }
            });
        }
    };

    const handleDelete = (vendorId: number) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(`/admin/vendors/${vendorId}`, {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Vendor has been deleted.',
                            icon: 'success',
                            timer: 3000,
                            showConfirmButton: false
                        });
                    }
                });
            }
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
            active: { color: 'bg-green-100 text-green-800', label: 'Active' },
            suspended: { color: 'bg-red-100 text-red-800', label: 'Suspended' },
            rejected: { color: 'bg-gray-100 text-gray-800', label: 'Rejected' },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        return <Badge className={config.color}>{config.label}</Badge>;
    };

    const getVerificationBadge = (verified: boolean) => {
        return verified ? (
            <Badge className="bg-green-100 text-green-800">Verified</Badge>
        ) : (
            <Badge className="bg-gray-100 text-gray-800">Unverified</Badge>
        );
    };

    return (
        <DashboardLayout title="Vendor Management">
            <div className="space-y-4 pb-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Vendor Management</h1>
                    <Link href="/admin/vendors/create">
                        <Button className="flex items-center gap-2 bg-primary cursor-pointer hover:bg-gray-100 text-black shadow-sm">
                            <Plus className="h-4 w-4" />
                            Add Vendor
                        </Button>
                    </Link>
                </div>
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            <p className="text-sm text-gray-600">Total Vendors</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                            <p className="text-sm text-gray-600">Pending</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                            <p className="text-sm text-gray-600">Active</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
                            <p className="text-sm text-gray-600">Suspended</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{stats.verified}</p>
                            <p className="text-sm text-gray-600">Verified</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-8">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <Label htmlFor="search">Search</Label>
                            <Input
                                id="search"
                                placeholder="Search vendors..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="status">Status</Label>
                            <select
                                id="status"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md  focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="active">Active</option>
                                <option value="suspended">Suspended</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="verified">Verification</Label>
                            <select
                                id="verified"
                                value={verifiedFilter}
                                onChange={(e) => setVerifiedFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All</option>
                                <option value="1">Verified</option>
                                <option value="0">Unverified</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <Button onClick={handleSearch} className="w-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                                <Search className="h-4 w-4 mr-2" />
                                Filter
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Vendors Table */}
            <div className="bg-white rounded-md shadow-lg border border-gray-100">
                <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Vendors</h3>
                        <p className="text-sm text-gray-600">
                            Showing {vendors.data.length} of {vendors.total} vendors
                        </p>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Vendor</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Stats</TableHead>
                            <TableHead>Subdomain</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {vendors.data.map((vendor) => (
                            <TableRow key={vendor.id}>
                                <TableCell>
                                    <div>
                                        <p className="font-medium">{vendor.business_name}</p>
                                        <p className="text-sm text-gray-600">@{vendor.username}</p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <p className="text-sm">{vendor.email}</p>
                                        <p className="text-sm text-gray-600">{vendor.phone}</p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-2">
                                        {getStatusBadge(vendor.status)}
                                        {getVerificationBadge(vendor.is_verified)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm">
                                        <p>Products: {vendor.products_count}</p>
                                        <p>Orders: {vendor.orders_count}</p>
                                        <p>Sales: {vendor.sales_count}</p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <a
                                        href={`http://${vendor.subdomain}.${appUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-500 text-sm"
                                    >
                                        {vendor.subdomain}.{appUrl}
                                    </a>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center space-x-2">
                                        <Link href={`/admin/vendors/${vendor.id}`}>
                                            <Button variant="outline" size="sm" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="bg-white  " >
                                                {vendor.status === 'pending' && (
                                                    <DropdownMenuItem className='cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800' onClick={() => handleStatusChange(vendor.id, 'approve')}>
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Approve
                                                    </DropdownMenuItem>
                                                )}
                                                {vendor.status === 'suspended' && (
                                                    <DropdownMenuItem className='cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800' onClick={() => handleStatusChange(vendor.id, 'activate')}>
                                                        <Play className="h-4 w-4 mr-2" />
                                                        Activate
                                                    </DropdownMenuItem>
                                                )}
                                                {vendor.status === 'active' && (
                                                    <DropdownMenuItem className='cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800' onClick={() => handleStatusChange(vendor.id, 'suspend')}>
                                                        <Pause className="h-4 w-4 mr-2" />
                                                        Suspend
                                                    </DropdownMenuItem>
                                                )}
                                                {vendor.status === 'pending' && (
                                                    <DropdownMenuItem className='cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800' onClick={() => handleStatusChange(vendor.id, 'reject')}>
                                                        <XCircle className="h-4 w-4 mr-2" />
                                                        Reject
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem className='cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800' onClick={() => window.location.href = `/admin/vendors/${vendor.id}/permissions`}>
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Permissions
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className='cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600' onClick={() => handleDelete(vendor.id)}>
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Pagination */}
                {vendors.last_page > 1 && (
                    <div className="p-4 border-t">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Showing {((vendors.current_page - 1) * vendors.per_page) + 1} to{' '}
                                {Math.min(vendors.current_page * vendors.per_page, vendors.total)} of{' '}
                                {vendors.total} results
                            </p>
                            <div className="flex space-x-2">
                                {vendors.current_page > 1 && (
                                    <Link href={`/admin/vendors?page=${vendors.current_page - 1}`}>
                                        <Button variant="outline" size="sm" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">Previous</Button>
                                    </Link>
                                )}
                                {vendors.current_page < vendors.last_page && (
                                    <Link href={`/admin/vendors?page=${vendors.current_page + 1}`}>
                                        <Button variant="outline" size="sm" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">Next</Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
