import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';

interface Permission { id: number; name: string; guard_name: string }

export default function Edit({ permission }: { permission: Permission }) {
  const { data, setData, put, processing, errors } = useForm<{ name: string; guard_name: string }>({
    name: permission.name,
    guard_name: permission.guard_name,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('permissions.update', permission.id), {
      onSuccess: () => Swal.fire({ title: 'Success', text: 'Permission updated successfully.', icon: 'success' }),
      onError: () => Swal.fire({ title: 'Error', text: 'Please fix the validation errors.', icon: 'error' }),
    });
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Permissions', href: route('permissions.index') },
    { title: 'Edit Permission', href: route('permissions.edit', permission.id) },
  ];

  return (
    <DashboardLayout title="Edit Permission">
      <Head title="Edit Permission" />
      <div className="space-y-4 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Edit Permission</h1>
          <Link href={route('permissions.index')}>
            <Button className="flex items-center gap-2 bg-primary cursor-pointer hover:bg-gray-100 text-black shadow-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Permissions
            </Button>
          </Link>
        </div>
        <Breadcrumbs breadcrumbs={breadcrumbs} />

        <form onSubmit={handleSubmit} className="max-w-2xl bg-white p-6 rounded-lg shadow space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="guard_name">Guard</Label>
            <Input id="guard_name" value={data.guard_name} onChange={(e) => setData('guard_name', e.target.value)} />
            {errors.guard_name && <p className="text-red-500 text-sm mt-1">{errors.guard_name}</p>}
          </div>
          <Button type="submit" className="flex items-center gap-2 bg-primary cursor-pointer hover:bg-gray-100 text-black shadow-sm" disabled={processing}>
            Update Permission
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}


