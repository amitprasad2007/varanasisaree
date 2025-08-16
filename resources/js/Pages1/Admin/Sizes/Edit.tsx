import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
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
import { ArrowLeft } from 'lucide-react';
import { CardContent, Card, CardHeader, CardTitle } from '@/components/ui/card';

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
      onSuccess: () => {
        Swal.fire({
          title: 'Size updated successfully',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      },
      onError: () => {
        Swal.fire({
          title: 'Failed to update size',
          icon: 'error',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Sizes', href: route('sizes.index') },
    { title: 'Edit Size', href: route('sizes.edit', size.id) },
];

  return (
    <DashboardLayout title="Edit Size">
      <Head title="Edit Size" />
      <div className="space-y-4 pb-6">
        <div className="flex items-center mb-6 justify-between">
          <h1 className="text-2xl font-semibold">Edit Size</h1>
          <Link href={route('sizes.index')} className="mr-4">
            <Button variant="outline" className="flex items-center gap-2 bg-primary cursor-pointer hover:bg-gray-100 text-black shadow-sm" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sizes
            </Button>
          </Link>
        </div>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Size Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                  <Input
                    value={data.name}
                    onChange={e => setData('name', e.target.value)}
                    placeholder="Size name (e.g., Small, Medium, Large)"
                  />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Code</label>
                  <Input
                    value={data.code}
                    onChange={e => setData('code', e.target.value)}
                    placeholder="Size code (e.g., S, M, L, XL)"
                  />
                {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status <span className="text-red-500">*</span></label>
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
                {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
              </div>

              <div className="flex justify-end">
                <Button variant="outline" type="submit" disabled={processing} className="flex items-center gap-2 bg-primary cursor-pointer hover:bg-gray-100 text-black shadow-sm">
                  {processing ? 'Updating...' : 'Update Size'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
