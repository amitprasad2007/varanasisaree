
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  roles: Role[];
}

export default function Edit({ user, roles }: { user: User; roles: Role[] }) {
  const { data, setData, put, processing, errors } = useForm({
    name: user.name,
    email: user.email,
    password: '',
    role_ids: user.roles.map(role => role.id),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('users.update', user.id));
  };

  return (
    <DashboardLayout title="Edit User">
      <Head title="Edit User" />
      
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Edit User</h1>
        
        <form onSubmit={handleSubmit} className="max-w-2xl bg-white p-6 rounded-lg shadow">
          <div className="space-y-4">
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
              <Label htmlFor="password">Password (leave blank to keep current)</Label>
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
                  </div>
                ))}
              </div>
              {errors.role_ids && (
                <p className="text-red-500 text-sm mt-1">{errors.role_ids}</p>
              )}
            </div>

            <Button type="submit" disabled={processing}>
              Update User
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}