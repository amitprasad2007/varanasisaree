import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
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
import { Input } from '@/components/ui/input';
import { Edit, Trash2, Images, ExternalLink, Search } from 'lucide-react';
import Swal from 'sweetalert2';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

interface PaginationLinkType {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationData<T> {
    data: T[];
    links: PaginationLinkType[];
    current_page: number;
    last_page: number;
    per_page: number;
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

interface Filters {
    search?: string;
    perPage?: number;
}

interface Props {
    variants: PaginationData<ProductVariant>;
    filters?: Filters;
}

export default function AllVariants({ variants, filters }: Props) {
    const [search, setSearch] = useState<string>(filters?.search ?? '');
    const [perPage, setPerPage] = useState<number>(Number(filters?.perPage ?? 10));

    const applyFilters = (newParams?: Partial<Filters> & { page?: number }) => {
        const query = {
            search,
            perPage,
            ...newParams,
        } as Record<string, string | number | undefined>;

        router.get(route('product-variants.all'), query, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setPerPage(10);
        router.get(route('product-variants.all'), {}, { replace: true });
    };

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

            <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between border-b border-gray-50">
                    <div className="flex items-center gap-2 w-full md:w-1/2">
                        <div className="relative w-full">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search SKU or Product Name..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') applyFilters({ page: 1 });
                                }}
                            />
                        </div>
                        <Button variant="outline" className="cursor-pointer hover:bg-gray-100" onClick={() => applyFilters({ page: 1 })}>
                            Search
                        </Button>
                        <Button variant="outline" className="cursor-pointer hover:bg-gray-100" onClick={clearFilters}>
                            Clear
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600 font-medium">Per page</label>
                        <select
                            className="border rounded-md px-2 py-1.5 text-sm bg-white focus:ring-2 focus:ring-primary/20 outline-none"
                            value={perPage}
                            onChange={(e) => {
                                const value = Number(e.target.value);
                                setPerPage(value);
                                applyFilters({ perPage: value, page: 1 });
                            }}
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead className="w-[80px]">Image</TableHead>
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
                                <TableRow key={variant.id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell>
                                        <div className="w-12 h-12 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden shadow-sm">
                                            {variant.image_path ? (
                                                <img
                                                    src={`/storage/${variant.image_path}`}
                                                    alt={variant.sku}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <ImageIcon className="w-6 h-6 text-gray-300" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-900 leading-tight">{variant.product.name}</span>
                                            <Link
                                                href={route('products.show', variant.product.id)}
                                                className="text-[11px] text-blue-500 hover:text-blue-700 hover:underline flex items-center gap-0.5 mt-0.5"
                                            >
                                                View Product <ExternalLink className="w-2.5 h-2.5" />
                                            </Link>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm text-gray-600">{variant.sku}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            {variant.color && (
                                                <div className="flex items-center gap-1.5">
                                                    {variant.color.hex_code && (
                                                        <div
                                                            className="w-3.5 h-3.5 rounded-full border border-gray-200 shadow-sm"
                                                            style={{ backgroundColor: variant.color.hex_code }}
                                                        />
                                                    )}
                                                    <span className="text-sm font-medium text-gray-700">{variant.color.name}</span>
                                                </div>
                                            )}
                                            {variant.size && (
                                                <span className="text-xs text-gray-500 font-medium bg-gray-100 px-1.5 py-0.5 rounded w-fit">Size: {variant.size.name}</span>
                                            )}
                                            {!variant.color && !variant.size && <span className="text-gray-400 text-xs italic">Default</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900">₹{variant.price}</span>
                                            {variant.discount > 0 && (
                                                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1 rounded w-fit">-{variant.discount}% OFF</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={variant.stock_quantity > 0 ? 'outline' : 'destructive'} className="font-bold">
                                            {variant.stock_quantity}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={variant.status === 'active' ? 'default' : 'secondary'} className="capitalize shadow-sm">
                                            {variant.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1.5">
                                            <Link href={route('product-variant-images.index', variant.id)}>
                                                <Button variant="outline" size="sm" title="Manage Images" className="h-8 w-8 p-0 cursor-pointer hover:bg-gray-100">
                                                    <Images className="w-4 h-4 text-gray-600" />
                                                </Button>
                                            </Link>
                                            <Link href={route('product-variants.edit', [variant.product.id, variant.id])}>
                                                <Button variant="outline" size="sm" title="Edit Variant" className="h-8 w-8 p-0 cursor-pointer hover:bg-gray-100">
                                                    <Edit className="w-4 h-4 text-gray-600" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(variant.product.id, variant.id)}
                                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer border-red-100"
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
                                <TableCell colSpan={8} className="h-32 text-center text-gray-500 italic">
                                    No variants matching your criteria.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                <div className="p-4 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
                    <div className="text-sm text-gray-500 font-medium">
                        Showing {variants.data.length} of {variants.total} variants
                    </div>
                    {variants.links && variants.links.length > 3 && (
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href={variants.links[0]?.url ?? '#'}
                                        onClick={(e) => {
                                            if (!variants.links[0]?.url) e.preventDefault();
                                        }}
                                    />
                                </PaginationItem>
                                {variants.links.slice(1, variants.links.length - 1).map((link, idx) => (
                                    <PaginationItem key={idx}>
                                        <PaginationLink
                                            href={link.url ?? '#'}
                                            isActive={link.active}
                                            onClick={(e) => {
                                                if (!link.url) e.preventDefault();
                                            }}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext
                                        href={variants.links[variants.links.length - 1]?.url ?? '#'}
                                        onClick={(e) => {
                                            if (!variants.links[variants.links.length - 1]?.url) e.preventDefault();
                                        }}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </div>
            </div>
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
