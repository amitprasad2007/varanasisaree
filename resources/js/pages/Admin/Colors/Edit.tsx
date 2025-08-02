import React from 'react';
import { useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from "sweetalert2";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface Color {
  id: number;
  name: string;
  hex_code: string | null;
  status: 'active' | 'inactive';
}

interface Props {
  color: Color;
}

export default function Edit({ color }: Props) {
    const { data, setData, put, processing, errors } = useForm({
      name: color.name,
      hex_code: color.hex_code || '',
      status: color.status
    });
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      put(route('colors.update', color.id), {
        onSuccess: () => {
            Swal.fire({
                title: 'Success!',
                text: 'Color updated successfully',
                icon: 'success',
                timer: 4000,
                showConfirmButton: false
            });
        }
      });
    };
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Colors', href: route('colors.index') },
        { title: 'Edit Color', href: route('colors.edit', color.id) },
    ];  
    return (
      <DashboardLayout title="Edit Color">
        <div className="space-y-4 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Edit Color</h1>
        </div>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
        <div className="bg-white rounded-md shadow p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                  <Input
                    value={data.name}
                    onChange={e => setData('name', e.target.value)}
                    placeholder="Color name"
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>
  
                                <div className="space-y-2">
                  <label className="text-sm font-medium">Hex Code</label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={data.hex_code}
                      onChange={e => setData('hex_code', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={data.hex_code}
                      onChange={e => setData('hex_code', e.target.value)}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                  {errors.hex_code && <p className="text-sm text-red-500">{errors.hex_code}</p>}
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
                  <Button variant="outline" type="submit" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" disabled={processing}>
                    {processing ? 'Updating...' : 'Update Color'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </DashboardLayout>
    );
  }