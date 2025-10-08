import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
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

interface CollectionType {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
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
  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this collection type?')) {
      router.delete(route('collection-types.destroy', id));
    }
  };

  return (
    <DashboardLayout title="Collections Types">
      <Head title="Collection Types" />
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Collection Types</h1>
          <Link href={route('collection-types.create')} >
            <Button>Create Collection Type</Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Icon</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Collections</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No collection types found. Create your first collection type to get started.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell>
                      {type.icon ? (
                        <span className="text-2xl">{type.icon}</span>
                      ) : (
                        <span className="text-gray-400 text-sm">No icon</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {type.description || '-'}
                    </TableCell>
                    <TableCell>{type.collections_count ?? 0}</TableCell>
                    <TableCell>{type.sort_order ?? 0}</TableCell>
                    <TableCell>
                      <Badge variant={type.is_active ? 'default' : 'secondary'}>
                        {type.is_active ? 'active' : 'inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={route('collection-types.edit', type.id)} >
                          <Button variant="outline" size="sm">Edit</Button>
                        </Link>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(type.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}