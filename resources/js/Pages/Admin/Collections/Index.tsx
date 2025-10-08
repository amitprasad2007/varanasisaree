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
  icon?: string;
}

interface Collection {
  id: number;
  name: string;
  slug: string;
  collection_type?: CollectionType;
  // Backend provides is_active (boolean) and sort_order (number)
  is_active?: boolean | string;
  sort_order?: number;
  products_count: number;
  image?: string;
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
  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this collection?')) {
      router.delete(route('collections.destroy', id));
    }
  };



  return (
    <DashboardLayout title="Collections">
      <Head title="Collections" />
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Collections</h1>
          <Link href={route('collections.create')}>
            <Button>Create Collection</Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collections?.data?.map((collection) => (
                <TableRow key={collection.id}>
                  <TableCell>
                    {collection.image ? (
                      <img
                        src={collection.image}
                        alt={collection.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{collection.name}</TableCell>
                  <TableCell>
                  {collection.collection_type ? (
                      <Badge>
                        {collection.collection_type.icon && (
                          <span className="mr-1">{collection.collection_type.icon}</span>
                        )}
                        {collection.collection_type.name}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">No type</span>
                    )}
                  </TableCell>
                  <TableCell>{collection.products_count}</TableCell>
                  <TableCell>{collection.sort_order ?? '-'}</TableCell>
                  <TableCell>
                    <Badge variant={collection.is_active ? 'default' : 'secondary'}>
                      {collection.is_active ? 'active' : 'inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/collections/${collection.id}/products`}>
                        <Button variant="outline" size="sm">Products</Button>
                      </Link>
                      <Link href={`/collections/${collection.id}/edit`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(collection.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}