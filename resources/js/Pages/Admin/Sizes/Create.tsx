import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
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
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Sizes', href: route('sizes.index') },
    { title: 'Create Size', href: route('sizes.create') },
];

  return (
    <DashboardLayout title="Create Size">
      <Head title="Create Size" />
      <div className="space-y-4 pb-6">
          <div className="flex items-center mb-6 justify-between">
          <h1 className="text-2xl font-semibold">Create Size</h1>
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
                <Button variant="outline" type="submit" disabled={processing} className="flex items-center gap-2 bg-primary cursor-pointer hover:bg-gray-100 text-black shadow-sm">
                  {processing ? 'Creating...' : 'Create Size'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
