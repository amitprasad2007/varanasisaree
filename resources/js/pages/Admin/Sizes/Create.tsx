import React from 'react';
import { useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from 'sweetalert2';
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function Create() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    code: '',
    status: 'active'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('sizes.store'), {
      onSuccess: () => toast.success('Size created successfully'),
      onError: () => toast.error('Failed to create size')
    });
  };

  return (
    <DashboardLayout title="Create Size">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create New Size</h1>

        <div className="bg-white rounded-md shadow p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={e => setData('name', e.target.value)}
                  placeholder="Size name (e.g., Small, Medium, Large)"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm font-medium text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="code" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Code
                </label>
                <Input
                  id="code"
                  value={data.code}
                  onChange={e => setData('code', e.target.value)}
                  placeholder="Size code (e.g., S, M, L, XL)"
                  className={errors.code ? "border-red-500" : ""}
                />
                {errors.code && (
                  <p className="text-sm font-medium text-destructive">{errors.code}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Status <span className="text-red-500">*</span>
                </label>
                <Select
                  value={data.status}
                  onValueChange={(value) => setData('status', value)}
                >
                  <SelectTrigger className={errors.status ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm font-medium text-destructive">{errors.status}</p>
                )}
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={processing}>
                  {processing ? 'Creating...' : 'Create Size'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}