
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import Swal from "sweetalert2";

type CheckedState = boolean | "indeterminate";
export default function Create() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
    status: true as CheckedState,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    post(route('brands.store'), {
      onSuccess: () => {
        Swal.fire({
            title: 'Success!',
            text: 'Brand created successfully',
            icon: 'success',
            timer: 4000,
            showConfirmButton: false
        });
    },
      onError: () => {
        Swal.fire({
            title: 'error!',
            text: 'Failed to create brand',
            icon: 'error',
            timer: 4000,
            showConfirmButton: false
        });
      }
    });
  };

  return (
    <DashboardLayout title="Create Brand">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create New Brand</h1>

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
                   onCheckedChange={(checked) => setData('status', checked)}
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
                  {processing ? 'Creating...' : 'Create Brand'}
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </DashboardLayout>
  );
}