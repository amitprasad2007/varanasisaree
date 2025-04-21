import React, { useState } from 'react';
import { Link,useForm } from '@inertiajs/react';
import { Trash, Edit, Plus, View } from "lucide-react";
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/product';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from 'sweetalert2';

interface Props {
  products: Product[];
}

export default function Index({ products }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Product', href: route('products.index') },
  ];
  const { delete: destroy } = useForm();
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Subcategory</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category?.title || 'N/A'}</TableCell>
                  <TableCell>{product.subcategory?.title || 'N/A'}</TableCell>
                  <TableCell>{product.brand?.name || 'N/A'}</TableCell>
                  <TableCell>${product.price}</TableCell>
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
                        <Link href={route('products.edit', product.id)}>
                        <Button variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" size="sm">
                            <Edit className="h-4 w-4" />
                        </Button>
                        </Link>
                        <Button
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        >
                        <Trash className=" h-4 w-4" />
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
      </div>
    </DashboardLayout>
  );
}
