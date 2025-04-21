import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Plus } from "lucide-react";
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from 'sweetalert2';

interface Brand {
  id: number;
  name: string;
  slug: string;
  status: string;
  description: string;
  images: string | null;
  logo:string | null;
}

interface Props {
    brands: Brand[];
  }

export default function Index({ brands }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
      { title: 'Dashboard', href: route('dashboard') },
      { title: 'Brands', href: route('brands.index') },
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
        destroy(route('brands.destroy', id), {
            onSuccess: () => {
            Swal.fire({
                title: 'Deleted!',
                text: 'Your Brands has been deleted.',
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
    <DashboardLayout title="Brands">
      <div className="space-y-4 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Brands</h1>
          <Link href={route('brands.create')}>
            <Button className="flex items-center gap-2 bg-primary cursor-pointer hover:bg-gray-100 text-black shadow-sm">
              <Plus className="h-4 w-4" />
              Add Brand
            </Button>
          </Link>
        </div>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>
      <div className="bg-white rounded-md shadow-lg border border-gray-100">
        <Table>
          <TableHeader>
            <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Logo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.length > 0 ? (
              brands.map((brand) => (
                <TableRow key={brand.id}>
                    <TableCell>
                        {brand.images ? (
                            <div className="relative group">
                            <img
                                src={`/storage/${brand.images}`}
                                alt={brand.name}
                                className="w-12 h-12 object-cover rounded-md transition-all duration-300 group-hover:w-20 group-hover:h-20 group-hover:shadow-lg group-hover:z-20 group-hover:relative"
                            />
                            </div>
                        ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No image</span>
                            </div>
                        )}
                    </TableCell>
                    <TableCell>
                        {brand.logo ? (
                            <div className="relative group">
                            <img
                                src={`/storage/${brand.logo}`}
                                alt={brand.name}
                                className="w-12 h-12 object-cover rounded-md transition-all duration-300 group-hover:w-20 group-hover:h-20 group-hover:shadow-lg group-hover:z-20 group-hover:relative"
                            />
                            </div>
                        ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No image</span>
                            </div>
                        )}
                    </TableCell>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell>{brand.slug}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        brand.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                        {brand.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                </TableCell>
                  <TableCell>
                  <div className="flex justify-end space-x-2">
                    <Link href={route('brands.edit', brand.id)}>
                      <Button variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="cursor-pointer text-red-600 hover:bg-red-50"
                      size="sm"
                      onClick={() => handleDelete(brand.id)}
                    >
                      <Trash2 className="h-4 w-4 cursor-pointer" />
                    </Button>
                  </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No brands found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}