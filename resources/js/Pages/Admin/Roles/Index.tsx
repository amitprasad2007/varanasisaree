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
import { Edit, Plus, Trash2 } from 'lucide-react';

interface Permission { id: number; name: string }
interface Role { id: number; name: string; guard_name: string; permissions: Permission[] }

export default function Index({ roles }: { roles: Role[] }) {
  const { delete: destroy } = useForm();

  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to delete this role?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        destroy(route('roles.destroy', id), {
          onSuccess: () => {
            Swal.fire({ title: 'Deleted!', text: 'Role deleted.', icon: 'success', timer: 3000, showConfirmButton: false });
          }
        });
      }
    });
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Roles', href: route('roles.index') },
  ];

  return (
    <DashboardLayout title="Roles">
      <div className="space-y-4 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Roles</h1>
          <Link href={route('roles.create')}>
            <Button className="flex items-center gap-2 bg-primary cursor-pointer hover:bg-gray-100 text-black shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Role
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
              <TableHead>Guard</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell>{role.guard_name}</TableCell>
                <TableCell>{role.permissions.map(p => p.name).join(', ') || '—'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={route('roles.edit', role.id)}>
                      <Button variant="outline" className="flex items-center gap-2 bg-primary cursor-pointer hover:bg-gray-100 text-black shadow-sm" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button variant="outline" className="flex items-center gap-2 bg-primary cursor-pointer text-red-600 hover:bg-red-50 shadow-sm" size="sm" onClick={() => handleDelete(role.id)}>
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


