import React from 'react';
import { useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from 'sweetalert2';
import {
  Form,
  FormControl,
  FormField,
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

interface Size {
  id: number;
  name: string;
  code: string | null;
  status: 'active' | 'inactive';
}

interface Props {
  size: Size;
}

export default function Edit({ size }: Props) {
  const { data, setData, put, processing, errors } = useForm({
    name: size.name,
    code: size.code || '',
    status: size.status
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('sizes.update', size.id), {
      onSuccess: () => toast.success('Size updated successfully'),
      onError: () => toast.error('Failed to update size')
    });
  };

  return (
    <DashboardLayout title="Edit Size">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Size</h1>

        <div className="bg-white rounded-md shadow p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <FormItem>
                <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input
                    value={data.name}
                    onChange={e => setData('name', e.target.value)}
                    placeholder="Size name (e.g., Small, Medium, Large)"
                  />
                </FormControl>
                {errors.name && <FormMessage>{errors.name}</FormMessage>}
              </FormItem>

              <FormItem>
                <FormLabel>Code</FormLabel>
                <FormControl>
                  <Input
                    value={data.code}
                    onChange={e => setData('code', e.target.value)}
                    placeholder="Size code (e.g., S, M, L, XL)"
                  />
                </FormControl>
                {errors.code && <FormMessage>{errors.code}</FormMessage>}
              </FormItem>

              <FormItem>
                <FormLabel>Status <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Select
                    value={data.status}
                    onValueChange={(value) => setData('status', value as 'active' | 'inactive')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                {errors.status && <FormMessage>{errors.status}</FormMessage>}
              </FormItem>

              <div className="flex justify-end">
                <Button type="submit" disabled={processing}>
                  {processing ? 'Updating...' : 'Update Size'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}