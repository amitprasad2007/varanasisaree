import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from 'sweetalert2';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { router } from '@inertiajs/react';

interface Size {
  id: number;
  name: string;
  code: string | null;
  status: 'active' | 'inactive';
  created_at: string;
}

interface Props {
  sizes: Size[];
}

export default function Index({ sizes }: Props) {
  const { delete: destroy } = useForm();
  const handleDelete = (id: number) => {
    Swal.fire({
        title: 'Are you sure?',
        text: "Are you sure you want to delete this size?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
        destroy(route('sizes.destroy', id), {
            onSuccess: () => {
            Swal.fire({
                title: 'Deleted!',
                text: 'Your Size has been deleted.',
                icon: 'success',
                timer: 3000,
                showConfirmButton: false
            });
            }
        });
        }
    });
  };

      const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Sizes', href: route('sizes.index') },
  ];

  return (
    <DashboardLayout title="Sizes">
      <div className="space-y-4 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Sizes</h1>
          <Link href={route('sizes.create')}>
            <Button className="flex items-center gap-2 bg-primary cursor-pointer hover:bg-gray-100 text-black shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Size
            </Button>
          </Link>
        </div>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>

      <div className="bg-white rounded-md shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sizes.map((size) => (
              <TableRow key={size.id}>
                <TableCell className="font-medium">{size.name}</TableCell>
                <TableCell>{size.code || 'N/A'}</TableCell>
                <TableCell>
                  <Badge variant={size.status === 'active' ? 'default' : 'secondary'}>
                    {size.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(size.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={route('sizes.edit', size.id)}>
                      <Button variant="outline" className="flex items-center gap-2 bg-primary cursor-pointer hover:bg-gray-100 text-black shadow-sm" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 bg-primary cursor-pointer text-red-600 hover:bg-red-50 shadow-sm"
                      size="sm"
                      onClick={() => handleDelete(size.id)}
                    >
                      <Trash2 className="w-4 h-4" />
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
}
