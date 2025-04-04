import React from 'react';
import { useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/Components/ui/form';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Checkbox } from '@/Components/ui/checkbox';
import { toast } from 'sonner';
import Swal from "sweetalert2";

interface Brand {
  id: number;
  name: string;
  description: string;
  status: boolean;
}

export default function Edit({ brand }: { brand: Brand }) {
  const { data, setData, put, processing, errors } = useForm({
    name: brand.name || '',
    description: brand.description || '',
    status: brand.status,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('brands.update', brand.id), {
        onSuccess: () => {
            Swal.fire({
                title: 'Success!',
                text: 'Brand updated successfully',
                icon: 'success',
                timer: 4000,
                showConfirmButton: false
            });
        },
      onError: () => {
        toast.error('Failed to update brand');
      }
    });
  };

  return (
    <DashboardLayout title="Edit Brand">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Brand: {brand.name}</h1>

        <div className="bg-white rounded-md shadow p-6">
          <Form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <FormItem>
                <FormLabel>Brand Name <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input 
                    value={data.name}
                    onChange={e => setData('name', e.target.value)}
                    placeholder="Enter brand name" 
                  />
                </FormControl>
                {errors.name && <FormMessage>{errors.name}</FormMessage>}
              </FormItem>

              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    value={data.description || ''}
                    onChange={e => setData('description', e.target.value)}
                    placeholder="Brand description" 
                    rows={4}
                  />
                </FormControl>
                {errors.description && <FormMessage>{errors.description}</FormMessage>}
              </FormItem>

              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                <Checkbox
                    id="status"
                    checked={data.status}
                    onCheckedChange={(checked: boolean) => setData('status', checked)}
                />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Active</FormLabel>
                  <FormDescription>
                    Make this brand visible on the site
                  </FormDescription>
                </div>
                {errors.status && <FormMessage>{errors.status}</FormMessage>}
              </FormItem>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={processing}
                >
                  {processing ? 'Updating...' : 'Update Brand'}
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </DashboardLayout>
  );
}