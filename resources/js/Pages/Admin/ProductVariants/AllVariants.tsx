import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Images, ExternalLink } from 'lucide-react';
import { router } from '@inertiajs/react';
import Swal from 'sweetalert2';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationData<T> {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Product {
    id: number;
    name: string;
}

interface Color {
    id: number;
    name: string;
    hex_code: string | null;
}

interface Size {
    id: number;
    name: string;
}

interface ProductVariant {
    id: number;
    sku: string;
    price: number;
    discount: number;
    stock_quantity: number;
    image_path: string | null;
    status: 'active' | 'inactive';
    product: Product;
    color: Color | null;
    size: Size | null;
    created_at: string;
}

interface Props {
    variants: PaginationData<ProductVariant>;
}

export default function AllVariants({ variants }: Props) {
    const handleDelete = (productId: number, variantId: number) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "Are you sure you want to delete this variant?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('product-variants.destroy', [productId, variantId]), {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Success!',
                            text: 'Variant deleted successfully',
                            icon: 'success',
                            timer: 4000,
                            showConfirmButton: false
                        });
                    }
                });
            }
        });
    };

    return (
        <DashboardLayout title="All Product Variants">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">All Product Variants</h1>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            <TableHead className="w-[100px]">Image</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Color/Size</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {variants.data.length > 0 ? (
                            variants.data.map((variant) => (
                                <TableRow key={variant.id} className="hover:bg-gray-50 transition-colors">
                                    <TableCell>
                                        <div className="w-12 h-12 rounded border bg-gray-100 flex items-center justify-center overflow-hidden">
                                            {variant.image_path ? (
                                                <img
                                                    src={`/storage/${variant.image_path}`}
                                                    alt={variant.sku}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <ImageIcon className="w-6 h-6 text-gray-400" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{variant.product.name}</span>
                                            <Link
                                                href={route('products.show', variant.product.id)}
                                                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                            >
                                                View Product <ExternalLink className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">{variant.sku}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            {variant.color && (
                                                <div className="flex items-center gap-1.5">
                                                    {variant.color.hex_code && (
                                                        <div
                                                            className="w-3 h-3 rounded-full border border-gray-300"
                                                            style={{ backgroundColor: variant.color.hex_code }}
                                                        />
                                                    )}
                                                    <span className="text-sm">{variant.color.name}</span>
                                                </div>
                                            )}
                                            {variant.size && (
                                                <span className="text-xs text-gray-500">Size: {variant.size.name}</span>
                                            )}
                                            {!variant.color && !variant.size && <span className="text-gray-400 text-xs">N/A</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">₹{variant.price}</span>
                                            {variant.discount > 0 && (
                                                <span className="text-xs text-green-600">-{variant.discount}%</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={variant.stock_quantity > 0 ? 'outline' : 'destructive'}>
                                            {variant.stock_quantity}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={variant.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                                            {variant.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={route('product-variant-images.index', variant.id)}>
                                                <Button variant="outline" size="sm" title="Manage Images">
                                                    <Images className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <Link href={route('product-variants.edit', [variant.product.id, variant.id])}>
                                                <Button variant="outline" size="sm" title="Edit Variant">
                                                    <Edit className="w-4 h-4 text-gray-600" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(variant.product.id, variant.id)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center text-gray-500">
                                    No variants found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {variants.links.length > 3 && (
                <div className="mt-6 flex justify-center gap-1">
                    {variants.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url || '#'}
                            className={cn(
                                "px-4 py-2 text-sm rounded-md transition-colors",
                                link.active
                                    ? "bg-primary text-primary-foreground font-medium"
                                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200",
                                !link.url && "opacity-50 cursor-not-allowed"
                            )}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}

// Helper to use lucide icons in code
const ImageIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
);

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');
