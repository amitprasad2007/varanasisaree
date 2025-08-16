import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';

interface Permission { id: number; name: string }

export default function Create({ permissions }: { permissions: Permission[] }) {
  const { data, setData, post, processing, errors } = useForm<{ name: string; guard_name: string; permission_ids: number[] }>({
    name: '',
    guard_name: 'web',
    permission_ids: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('roles.store'), {
      onSuccess: () => Swal.fire({ title: 'Success', text: 'Role created successfully.', icon: 'success' }),
      onError: () => Swal.fire({ title: 'Error', text: 'Please fix the validation errors.', icon: 'error' }),
    });
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Roles', href: route('roles.index') },
    { title: 'Create Role', href: route('roles.create') },
  ];

  return (
    <DashboardLayout title="Create Role">
      <Head title="Create Role" />
      <div className="space-y-4 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Create Role</h1>
          <Link href={route('roles.index')}>
            <Button className="flex items-center gap-2 bg-primary cursor-pointer hover:bg-gray-100 text-black shadow-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Roles
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
          <div>
            <Label>Permissions</Label>
            <div className="mt-2 space-y-2">
              {permissions.map((p) => (
                <div key={p.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`permission-${p.id}`}
                    checked={data.permission_ids.includes(p.id)}
                    onCheckedChange={(checked) => {
                      setData('permission_ids', checked ? [...data.permission_ids, p.id] : data.permission_ids.filter((id) => id !== p.id));
                    }}
                  />
                  <Label htmlFor={`permission-${p.id}`}>{p.name}</Label>
                </div>
              ))}
            </div>
            {errors.permission_ids && <p className="text-red-500 text-sm mt-1">{errors.permission_ids}</p>}
          </div>
          <Button type="submit" className="flex items-center gap-2 bg-primary cursor-pointer hover:bg-gray-100 text-black shadow-sm" disabled={processing}>
            Create Role
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}


