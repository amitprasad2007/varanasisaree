import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useState } from 'react';

interface Role {
  id: number;
  name: string;
  permissions: Array<{
    id: number;
    name: string;
  }>;
}

// Define a type for the form data
interface FormData {
  name: string;
  email: string;
  password: string;
  mobile: string;
  address: string;
  avatar: File | null;
  role_ids: number[];
  [key: string]: any; // Add index signature
}

export default function Create({ roles }: { roles: Role[] }) {
  const [preview, setPreview] = useState<string | null>(null);
  const { data, setData, post, processing, errors } = useForm<FormData>({
    name: '',
    email: '',
    password: '',
    mobile: '',
    address: '',
    avatar: null,
    role_ids: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'role_ids') {
        data[key].forEach((id: number) => {
          formData.append(`${key}[]`, id.toString());
        });
      } else if (data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    post(route('users.store'));
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

  return (
    <DashboardLayout title="Create New User">
      <Head title="Create User" />
      
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Create New User</h1>
        
        <form onSubmit={handleSubmit} className="max-w-2xl bg-white p-6 rounded-lg shadow">
          <div className="space-y-4">
          <div className="flex justify-center mb-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  {preview ? (
                    <AvatarImage src={preview} alt="Preview" />
                  ) : (
                    <AvatarFallback>Upload</AvatarFallback>
                  )}
                </Avatar>
                <Input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
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
            <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile"
                type="tel"
                value={data.mobile}
                onChange={e => setData('mobile', e.target.value)}
              />
              {errors.mobile && (
                <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
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
                      ({role.permissions.map(p => p.name).join(', ')})
                    </span>
                  </div>
                ))}
              </div>
              {errors.role_ids && (
                <p className="text-red-500 text-sm mt-1">{errors.role_ids}</p>
              )}
            </div>

            <Button type="submit" disabled={processing}>
              Create User
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}