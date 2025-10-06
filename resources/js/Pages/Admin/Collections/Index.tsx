import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Index = ({ collections }: any) => {
  const { delete: destroy } = useForm();

  return (
    <DashboardLayout title="Collections">
      <Head title="Collections" />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Collections</h1>
        <Link href={route('collections.create')}>
          <Button className="flex items-center gap-2 bg-primary cursor-pointer hover:bg-gray-100 text-black shadow-sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Collection
          </Button>
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collections.data?.map((c: any) => (
              <TableRow key={c.id}>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.slug}</TableCell>
                <TableCell>{c.type?.name}</TableCell>
                <TableCell>{c.is_active ? 'Active' : 'Inactive'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Link href={route('collections.edit', c.id)}>
                      <Button variant="outline" size="sm" className="cursor-pointer"> <Edit className="h-4 w-4" /> </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="text-red-600" onClick={() => destroy(route('collections.destroy', c.id))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
};

export default Index;


