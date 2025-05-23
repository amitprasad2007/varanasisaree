import React from 'react';
import { Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { router } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useController, useForm } from 'react-hook-form';
import { VideoProvider } from '@/types/product';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from 'sweetalert2';

const formSchema = z.object({
  name: z.string().min(1, 'Provider name is required'),
  base_url: z.string().min(1, 'Base URL is required').url('Must be a valid URL'),
  logo: z.any().optional(),
  status: z.enum(['active', 'inactive']),
});

type FormValues = z.infer<typeof formSchema>;

interface EditProps {
  provider: VideoProvider;
}

export default function Edit({ provider }: EditProps) {
    const form = useForm<FormValues>({
    defaultValues: {
      name: provider.name,
      base_url: provider.base_url,
      logo: null,
      status: provider.status as 'active' | 'inactive',
    },
  });

  const { control, handleSubmit, formState } = form;
  const { errors,isSubmitting  } = formState;

  // Custom file input controller
  const { field: logoField } = useController({
    name: 'logo',
    control,
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      logoField.onChange(e.target.files[0]);
    }
  };

  const onSubmit = (data: FormValues) => {
    // Convert form data to FormData for file upload
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('base_url', data.base_url);
    formData.append('status', data.status);
    formData.append('_method', 'PUT');

    if (data.logo) {
      formData.append('logo', data.logo);
    }

    // Submit the form using Inertia
    router.post(route('video-providers.update', provider.id), formData, {
        forceFormData: true,
        onSuccess: () => {
            Swal.fire({
               title: 'Success!',
               text: 'Video Provider Updated successfully',
               icon: 'success',
               timer: 4000,
               showConfirmButton: false
           });
         }
      });
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Video Providers', href: route('video-providers.index') },
    { title: 'Edit Video Providers', href: route('video-providers.edit',provider.id) },
  ];
  return (
    <DashboardLayout title={`Edit Provider: ${provider.name}`}>
      <div className="space-y-6">
      <div className="space-y-4 pb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Video Provider</h1>
            <p className="text-muted-foreground">
              Update the configuration for {provider.name}
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href={route('video-providers.index')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Providers
            </Link>
          </Button>
        </div>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Provider Details</CardTitle>
            <CardDescription>
              Edit the information for this video provider
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider Name</FormLabel>
                      <FormControl>
                        <Input placeholder="YouTube" {...field} />
                      </FormControl>
                      <FormDescription>
                        The name of the video platform (e.g., YouTube, Vimeo)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="base_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.youtube.com/embed/" {...field} />
                      </FormControl>
                      <FormDescription>
                        The base URL used for embedding videos from this provider
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {provider.logo && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Current Logo</h3>
                    <img
                      src={`/storage/${provider.logo}`}
                      alt={provider.name}
                      className="h-12 w-auto object-contain border rounded p-2"
                    />
                  </div>
                )}

                <FormField
                  control={control}
                  name="logo"
                  render={() => (
                    <FormItem>
                      <FormLabel>Provider Logo</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                        />
                      </FormControl>
                      <FormDescription>
                        Upload a new logo for the video provider (leave empty to keep current)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>
                          Set if this provider is currently active
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value === 'active'}
                          onCheckedChange={(checked) => field.onChange(checked ? 'active' : 'inactive')}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <CardFooter className="flex justify-end px-0 pb-0">
                  <Button
                    type="submit"
                    variant="outline"  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Updating...' : 'Update Provider'}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}