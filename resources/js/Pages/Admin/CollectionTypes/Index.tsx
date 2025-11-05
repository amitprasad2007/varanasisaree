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
import { Trash2, Edit, Plus } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from 'sweetalert2';

interface CollectionType {
  id: number;
  name: string;
  slug: string;
  description?: string;
  banner_image?: string;
  thumbnail_image?: string;
  sort_order?: number;
  is_active?: boolean;
  collections_count?: number;
}

type Paginated<T> = {
  data: T[];
  // other pagination fields are ignored for this component
  [key: string]: unknown;
};

interface Props {
  collectionTypes: CollectionType[] | Paginated<CollectionType>;
}

export default function Index({ collectionTypes = [] as unknown as Props['collectionTypes'] }: Props) {
  const items: CollectionType[] = Array.isArray(collectionTypes)
    ? collectionTypes
    : (collectionTypes?.data ?? []);

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Collection Types', href: route('collection-types.index') },
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
        destroy(route('collection-types.destroy', id), {
          onSuccess: () => {
            Swal.fire({
              title: 'Deleted!',
              text: 'Your collection type has been deleted.',
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
    <DashboardLayout title="Collection Types">
      <Head title="Collection Types" />
      
      <div className="space-y-4 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Collection Types</h1>
          <Link href={route('collection-types.create')}>
            <Button className="flex items-center gap-2 bg-primary cursor-pointer hover:bg-gray-100 text-black shadow-sm">
              <Plus className="h-4 w-4" />
              Add Collection Type
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
              <TableHead>Description</TableHead>
              <TableHead>Collections</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                  No collection types found. Create your first collection type to get started.
                </TableCell>
              </TableRow>
            ) : (
              items.map((type) => (
                <TableRow key={type.id}>
                  <TableCell>
                    {type.banner_image || type.thumbnail_image ? (
                      <div className="relative group">
                        <img
                          src={`/storage/${type.thumbnail_image || type.banner_image}`}
                          alt={type.name}
                          className="w-12 h-12 object-cover rounded-md transition-all duration-300 group-hover:w-20 group-hover:h-20 group-hover:shadow-lg group-hover:z-20 group-hover:relative"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {type.description || '-'}
                  </TableCell>
                  <TableCell>{type.collections_count ?? 0}</TableCell>
                  <TableCell>{type.sort_order ?? 0}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      type.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {type.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Link href={route('collection-types.edit', type.id)}>
                        <Button variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="cursor-pointer text-red-600 hover:bg-red-50"
                        size="sm"
                        onClick={() => handleDelete(type.id)}
                      >
                        <Trash2 className="h-4 w-4 cursor-pointer" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}