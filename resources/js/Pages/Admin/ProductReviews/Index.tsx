import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Check, X } from "lucide-react";
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from 'sweetalert2';

interface Product {
    id: number;
    name: string;
    slug: string;
}

interface Customer {
    id: number;
    name: string;
    email: string;
}

interface Review {
    id: number;
    product_id: number;
    customer_id: number;
    rating: number;
    review: string;
    status: string;
    created_at: string;
    product: Product;
    customer: Customer;
}

interface Props {
    reviews: {
        data: Review[];
        links: any[];
    };
}

export default function Index({ reviews }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Product Reviews', href: route('product-reviews.index') },
    ];

    const { post, delete: destroy } = useForm();

    const handleApprove = (id: number) => {
        Swal.fire({
            title: 'Approve Review?',
            text: "This review will be visible to the public.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, approve it!'
        }).then((result) => {
            if (result.isConfirmed) {
                post(route('product-reviews.approve', id), {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Approved!',
                            text: 'Review has been approved.',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    }
                });
            }
        });
    };

    const handleReject = (id: number) => {
        Swal.fire({
            title: 'Reject Review?',
            text: "This review will be marked as rejected.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, reject it!'
        }).then((result) => {
            if (result.isConfirmed) {
                post(route('product-reviews.reject', id), {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Rejected!',
                            text: 'Review has been rejected.',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    }
                });
            }
        });
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Delete Review?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('product-reviews.destroy', id), {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Review has been deleted.',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    }
                });
            }
        });
    };

    return (
        <DashboardLayout title="Product Reviews">
            <div className="space-y-4 pb-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Product Reviews</h1>
                </div>
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="bg-white rounded-md shadow-lg border border-gray-100">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Review</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reviews.data.length > 0 ? (
                            reviews.data.map((review) => (
                                <TableRow key={review.id}>
                                    <TableCell className="font-medium">
                                        {review.product?.name || 'Unknown Product'}
                                    </TableCell>
                                    <TableCell>
                                        {review.customer?.name || 'Anonymous'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <span className="text-yellow-500 mr-1">★</span>
                                            {review.rating}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate" title={review.review}>
                                        {review.review}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${review.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                review.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-end space-x-2">
                                            {review.status === 'pending' && (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        className="cursor-pointer text-green-600 hover:bg-green-50"
                                                        size="sm"
                                                        onClick={() => handleApprove(review.id)}
                                                        title="Approve"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="cursor-pointer text-red-600 hover:bg-red-50"
                                                        size="sm"
                                                        onClick={() => handleReject(review.id)}
                                                        title="Reject"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                            <Button
                                                variant="outline"
                                                className="cursor-pointer text-gray-600 hover:bg-gray-100"
                                                size="sm"
                                                onClick={() => handleDelete(review.id)}
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-4">
                                    No reviews found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </DashboardLayout>
    );
}
