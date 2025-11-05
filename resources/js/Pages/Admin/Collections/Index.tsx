import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
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
import { Trash2, Edit, Plus, Package } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from 'sweetalert2';

interface CollectionType {
  id: number;
  name: string;
  icon?: string;
}

interface Collection {
  id: number;
  name: string;
  slug: string;
  collection_type?: CollectionType;
  is_active: boolean;
  sort_order?: number;
  products_count: number;
  banner_image?: string;
  thumbnail_image?: string;
}

interface Paginated<T> {
  data: T[];
  links?: unknown;
  meta?: unknown;
}

interface Props {
  collections: Paginated<Collection>;
}

export default function Index({ collections }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Collections', href: route('collections.index') },
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
        destroy(route('collections.destroy', id), {
          onSuccess: () => {
            Swal.fire({
              title: 'Deleted!',
              text: 'Your collection has been deleted.',
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
    <DashboardLayout title="Collections">
      <Head title="Collections" />
      
      <div className="space-y-4 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Collections</h1>
          <Link href={route('collections.create')}>
            <Button className="flex items-center gap-2 bg-primary cursor-pointer hover:bg-gray-100 text-black shadow-sm">
              <Plus className="h-4 w-4" />
              Add Collection
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
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collections?.data?.map((collection) => (
              <TableRow key={collection.id}>
                <TableCell>
                  {collection.thumbnail_image || collection.banner_image ? (
                    <div className="relative group">
                      <img
                        src={`/storage/${collection.thumbnail_image || collection.banner_image}`}
                        alt={collection.name}
                        className="w-12 h-12 object-cover rounded-md transition-all duration-300 group-hover:w-20 group-hover:h-20 group-hover:shadow-lg group-hover:z-20 group-hover:relative"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No image</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{collection.name}</TableCell>
                <TableCell>
                  {collection.collection_type ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {collection.collection_type.name}
                    </span>
                  ) : (
                    <span className="text-gray-400">No type</span>
                  )}
                </TableCell>
                <TableCell>{collection.products_count}</TableCell>
                <TableCell>{collection.sort_order ?? 0}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    collection.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {collection.is_active ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Link href={route('collections.products', collection.id)}>
                      <Button variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" size="sm">
                        <Package className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={route('collections.edit', collection.id)}>
                      <Button variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="cursor-pointer text-red-600 hover:bg-red-50"
                      size="sm"
                      onClick={() => handleDelete(collection.id)}
                    >
                      <Trash2 className="h-4 w-4 cursor-pointer" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {collections?.data?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                  No collections found. Create your first collection.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}