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
import { Trash2, Edit, Plus } from "lucide-react";
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
interface Color {
    id: number;
    name: string;
    hex_code: string | null;
    status: 'active' | 'inactive';
    created_at: string;
  }

  interface Props {
    colors?: Color[];
  }

export default function Index({ colors = [] }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Colors', href: route('colors.index') },
      ];
      const { delete: destroy } = useForm();
      const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "Are you sure you want to delete this color?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
            destroy(route('colors.destroy', id), {
                onSuccess: () => {
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Your Color has been deleted.',
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
      <DashboardLayout title="Colors">
        <div className="space-y-4 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Colors</h1>
          <Link href={route('colors.create')}>
            <Button className="flex items-center gap-2 bg-primary cursor-pointer hover:bg-gray-100 text-black shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Color
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
              <TableHead>Color</TableHead>
              <TableHead>Hex Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {colors.length > 0 ? colors.map((color) => (
              <TableRow key={color.id}>
                <TableCell className="font-medium">{color.name}</TableCell>
                <TableCell>
                  {color.hex_code && (
                    <div
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: color.hex_code }}
                    />
                  )}
                </TableCell>
                <TableCell>{color.hex_code || 'N/A'}</TableCell>
                <TableCell>
                  <Badge variant={color.status === 'active' ? 'default' : 'secondary'}>
                    {color.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(color.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={route('colors.edit', color.id)}>
                      <Button variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="cursor-pointer text-red-600 hover:bg-red-50"
                      size="sm"
                      onClick={() => handleDelete(color.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">No colors found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        </div>
      </DashboardLayout>
    );
  }
