import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useState } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';

interface Role {
  id: number;
  name: string;
  permissions?: Array<{
    id: number;
    name: string;
  }>;
}

interface Permission { id: number; name: string }

// Define a type for the form data
interface FormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  avatar: File | null;
  role_ids: number[];
  permission_ids: number[];
  [key: string]: any; // Add index signature
}

export default function Create({ roles, permissions }: { roles: Role[]; permissions: Permission[] }) {
  const [preview, setPreview] = useState<string | null>(null);
  const { data, setData, post, processing, errors } = useForm<FormData>({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    avatar: null,
    role_ids: [],
    permission_ids: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('users.store'), {
      forceFormData: true,
      onSuccess: () => {
        Swal.fire({
          title: 'Success',
          text: 'User created successfully.',
          icon: 'success',
        });
      },
      onError: () => {
        Swal.fire({
          title: 'Error',
          text: 'Please correct the highlighted errors.',
          icon: 'error',
        });
      },
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('avatar', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'User Management', href: route('users.index') },
    { title: 'Create User', href: route('users.create') },
  ];

  return (
    <DashboardLayout title="Create New User">
      <Head title="Create User" />

      <div className="space-y-4 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Create New User</h1>
          <Link href={route('users.index')}>
            <Button className="flex items-center gap-2 bg-primary cursor-pointer hover:bg-gray-100 text-black shadow-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to User Management
            </Button>
          </Link>
        </div>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
        <form onSubmit={handleSubmit} className="max-w-2xl bg-white p-6 rounded-lg shadow">
          <div className="space-y-4">
          <div className="flex justify-center mb-6">
              <div className="relative">
                <Avatar className="h-24 w-24 cursor-pointer">
                  {preview ? (
                    <AvatarImage src={preview} alt="Preview" />
                  ) : (
                    <AvatarFallback className="text-gray-500 text-sm font-bold border border-gray-300" >Upload</AvatarFallback>
                  )}
                </Avatar>
                <Input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer hover:bg-gray-100 text-black shadow-sm"
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={data.name}
                onChange={e => setData('name', e.target.value)}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={e => setData('email', e.target.value)}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={data.password}
                onChange={e => setData('password', e.target.value)}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div>
            <Label htmlFor="phone">Mobile</Label>
              <Input
                id="phone"
                type="tel"
                value={data.phone}
                onChange={e => setData('phone', e.target.value)}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                type="text"
                value={data.address}
                onChange={e => setData('address', e.target.value)}
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>
            <div>
              <Label>Roles</Label>
              <div className="mt-2 space-y-2">
                {roles.map(role => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={data.role_ids.includes(role.id)}
                      onCheckedChange={(checked) => {
                        setData('role_ids', checked
                          ? [...data.role_ids, role.id]
                          : data.role_ids.filter(id => id !== role.id)
                        );
                      }}
                    />
                    <Label htmlFor={`role-${role.id}`}>{role.name}</Label>
                    <span className="text-sm text-gray-500">
                      ({(role.permissions ?? []).map(p => p.name).join(', ')})
                    </span>
                  </div>
                ))}
              </div>
              {errors.role_ids && (
                <p className="text-red-500 text-sm mt-1">{errors.role_ids}</p>
              )}
            </div>

            <Button type="submit" className="flex items-center gap-2 bg-primary cursor-pointer hover:bg-gray-100 text-black shadow-sm" disabled={processing}>
              Create User
            </Button>
          </div>
            <div>
              <Label>Direct Permissions</Label>
              <div className="mt-2 space-y-2">
                {permissions.map(p => (
                  <div key={p.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`permission-${p.id}`}
                      checked={(data.permission_ids ?? []).includes(p.id)}
                      onCheckedChange={(checked) => {
                        const current = data.permission_ids ?? [];
                        setData('permission_ids', checked
                          ? [...current, p.id]
                          : current.filter(id => id !== p.id)
                        );
                      }}
                    />
                    <Label htmlFor={`permission-${p.id}`}>{p.name}</Label>
                  </div>)
                )}
              </div>
              {errors.permission_ids && (
                <p className="text-red-500 text-sm mt-1">{errors.permission_ids}</p>
              )}
            </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
