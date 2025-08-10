import React, { useState } from 'react';
import { Link, useForm, router } from '@inertiajs/react';
import { Trash2, Edit, Plus, View, Eye } from "lucide-react";
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/product';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from 'sweetalert2';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface PaginationLinkType { url: string | null; label: string; active: boolean }
interface Paginated<T> {
  data: T[];
  links: PaginationLinkType[];
  current_page: number;
  per_page: number;
  total: number;
}

interface Filters {
  search?: string;
  sort?: string;
  direction?: 'asc' | 'desc';
  perPage?: number;
}

type ProductsProp = Paginated<Product> | Product[];

interface Props {
  products: ProductsProp;
  filters?: Filters;
}

export default function Index({ products, filters }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Product', href: route('products.index') },
  ];
  const { delete: destroy } = useForm();
  const isPaginated = !Array.isArray(products) && (products as Paginated<Product>)?.data !== undefined;
  const paginated = (isPaginated ? (products as Paginated<Product>) : null);
  const rows: Product[] = Array.isArray(products) ? products : (paginated?.data ?? []);

  // Initialize from URLSearchParams to avoid undefined/null issues from server props
  const params = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState<string>(params.get('search') ?? '');
  const [sortBy, setSortBy] = useState<string>(params.get('sort') ?? 'created_at');
  const [direction, setDirection] = useState<'asc' | 'desc'>(
    (params.get('direction') === 'asc' ? 'asc' : 'desc')
  );
  const [perPage, setPerPage] = useState<number>(
    Number(params.get('perPage') ?? (paginated?.per_page ?? 10))
  );

  const applyFilters = (params?: Partial<Filters> & { page?: number }) => {
    const safeParams = params ?? {};
    const query = {
      search,
      sort: sortBy,
      direction,
      perPage,
      ...safeParams,
    } as Record<string, string | number | undefined>;

    const url = new URL(route('products.index'), window.location.origin);
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });

    router.get(url.toString(), {}, {
      preserveState: true,
      replace: true,
    });
  };

  const clearFilters = () => {
    setSearch('');
    setSortBy('created_at');
    setDirection('desc');
    setPerPage(10);
    router.get(route('products.index'), {}, { replace: true });
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
      applyFilters({ direction: direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSortBy(column);
      setDirection('asc');
      applyFilters({ sort: column, direction: 'asc' });
    }
  };

  const handleDelete = (id: number) => {
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
        destroy(route('products.destroy', id), {
          onSuccess: () => {
            Swal.fire({
              title: 'Deleted!',
              text: 'Your product has been deleted.',
              icon: 'success',
              timer: 3000,
              showConfirmButton: false
            });
          }
        });
      }
    });
  };

  return (
    <DashboardLayout title="Products">
      <div className="space-y-4 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Products</h1>
          <Link href={route('products.create')}>
            <Button className="flex items-center gap-2 bg-primary cursor-pointer hover:bg-gray-100 text-black shadow-sm">
              <Plus className="h-4 w-4" />
              Add Products
            </Button>
          </Link>
        </div>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>

      <div className="bg-white rounded-md shadow-lg border border-gray-100" >
        <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 w-full md:w-1/2">
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyFilters({ page: 1 });
              }}
            />
            <Button variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => applyFilters({ page: 1 })}>
              Search
            </Button>
            <Button variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={clearFilters}>
              Clear
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Per page</label>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={perPage}
              onChange={(e) => {
                const value = Number(e.target.value);
                setPerPage(value);
                applyFilters({ perPage: value, page: 1 });
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button className="flex cursor-pointer items-center gap-1" onClick={() => handleSort('name')}>
                  Name {sortBy === 'name' ? (direction === 'asc' ? '▲' : '▼') : ''}
                </button>
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Subcategory</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>
                <button className="flex cursor-pointer items-center gap-1" onClick={() => handleSort('price')}>
                  Price {sortBy === 'price' ? (direction === 'asc' ? '▲' : '▼') : ''}
                </button>
              </TableHead>
              <TableHead>
                <button className="flex cursor-pointer items-center gap-1" onClick={() => handleSort('stock_quantity')}>
                  Stock {sortBy === 'stock_quantity' ? (direction === 'asc' ? '▲' : '▼') : ''}
                </button>
              </TableHead>
              <TableHead>
                <button className="flex cursor-pointer items-center gap-1" onClick={() => handleSort('status')}>
                  Status {sortBy === 'status' ? (direction === 'asc' ? '▲' : '▼') : ''}
                </button>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows && rows.length > 0 ? (
              rows.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category?.title || 'N/A'}</TableCell>
                  <TableCell>{product.subcategory?.title || 'N/A'}</TableCell>
                  <TableCell>{product.brand?.name || 'N/A'}</TableCell>
                  <TableCell>₹{product.price}</TableCell>
                  <TableCell>{product.stock_quantity}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-left">
                    <div className="flex  space-x-2">
                        <Link href={route('products.show', product.id)}>
                        <Button variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" size="sm">
                            <View className="h-4 w-4" />
                        </Button>
                        </Link>
                        <Link href={route('product-variants.index', product.id)}>
                        <Button variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" size="sm">
                            <Eye className="h-4 w-4" />
                        </Button>
                        </Link>
                        <Link href={route('products.edit', product.id)}>
                        <Button variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" size="sm">
                            <Edit className="h-4 w-4" />
                        </Button>
                        </Link>
                        <Button
                        variant="outline"
                        className="cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-800"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        >
                         <Trash2 className="h-4 w-4 cursor-pointer" />
                        </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  No products found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="p-4">
          {isPaginated && paginated?.links && paginated.links.length > 0 && (
            <Pagination>
              <PaginationContent>
                {/* Previous */}
                <PaginationItem>
                  <PaginationPrevious
                    href={paginated.links[0]?.url ?? '#'}
                    onClick={(e) => {
                      if (!paginated.links[0]?.url) e.preventDefault();
                    }}
                  />
                </PaginationItem>
                {/* Numbered Links */}
                {paginated.links.slice(1, paginated.links.length - 1).map((link, idx) => (
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
                {/* Next */}
                <PaginationItem>
                  <PaginationNext
                    href={paginated.links[paginated.links.length - 1]?.url ?? '#'}
                    onClick={(e) => {
                      if (!paginated.links[paginated.links.length - 1]?.url) e.preventDefault();
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
