import React from 'react';
import { Link } from '@inertiajs/react';

import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useController, useForm } from 'react-hook-form';
import { Product, VideoProvider } from '@/types/product';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from 'sweetalert2';


const formSchema = z.object({
  video_provider_id: z.string().min(1, 'Video provider is required'),
  title: z.string().min(1, 'Title is required'),
  video_id: z.string().min(1, 'Video ID is required'),
  description: z.string().optional(),
  thumbnail: z.any().optional(),
  is_featured: z.boolean().default(false),
  status: z.enum(['active', 'inactive']).default('active'),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateProps {
  product: Product;
  providers: VideoProvider[];
}

export default function Create({ product, providers }: CreateProps) {
  const form = useForm<FormValues>({
    defaultValues: {
      video_provider_id: '',
      title: '',
      video_id: '',
      description: '',
      thumbnail: null,
      is_featured: false,
      status: 'active' as const,
    },
  });

  const { control, handleSubmit, formState } = form;
  const { errors,isSubmitting  } = formState;

  // Custom file input controller
  const { field: thumbnailField } = useController({
    name: 'thumbnail',
    control,
  });

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      thumbnailField.onChange(e.target.files[0]);
    }
  };

  const onSubmit = (data: FormValues) => {
    // Convert form data to FormData for file upload
    const formData = new FormData();
    formData.append('video_provider_id', data.video_provider_id);
    formData.append('title', data.title);
    formData.append('video_id', data.video_id);

    if (data.description) {
      formData.append('description', data.description);
    }

    formData.append('is_featured', data.is_featured ? '1' : '0');
    formData.append('status', data.status);

    if (data.thumbnail) {
      formData.append('thumbnail', data.thumbnail);
    }

    // Submit the form using Inertia
    router.post(route('product-videos.store', product.id),formData, {
      forceFormData: true,
      onSuccess: () => {
        Swal.fire({
           title: 'Success!',
           text: 'Video added successfully.',
           icon: 'success',
           timer: 4000,
           showConfirmButton: false
       });
     }
    });

  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Product', href: route('products.index') },
    { title: 'Show Product', href: route('products.show', product.id) },
    { title: 'Product Video', href: route('product-videos.index', product.id) },
    { title: 'Add Product Video', href: route('product-videos.create', product.id) },
  ];

  return (
    <DashboardLayout title={`Add Video to ${product.name}`}>
      <div className="space-y-6">
      <div className="space-y-4 pb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Add Video</h1>
            <p className="text-muted-foreground">
              Add a new video to {product.name}
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href={route('product-videos.index', product.id)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Videos
            </Link>
          </Button>
        </div>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>


        <Card>
          <CardHeader>
            <CardTitle>Video Details</CardTitle>
            <CardDescription>
              Enter the details for the product video
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={control}
                  name="video_provider_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video Provider</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white border border-gray-300 rounded-md shadow-sm">
                            <SelectValue placeholder="Select a provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                          {providers.map(provider => (
                            <SelectItem key={provider.id} value={provider.id.toString()}>
                              {provider.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose the platform where the video is hosted
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Product Demo Video" {...field} />
                      </FormControl>
                      <FormDescription>
                        A descriptive title for the video
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="video_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video ID</FormLabel>
                      <FormControl>
                        <Input placeholder="dQw4w9WgXcQ" {...field} />
                      </FormControl>
                      <FormDescription>
                        The unique identifier for the video on the provider's platform
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what this video shows..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A brief description of the video content (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="thumbnail"
                  render={() => (
                    <FormItem>
                      <FormLabel>Video Thumbnail</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailChange}
                        />
                      </FormControl>
                      <FormDescription>
                        Upload a custom thumbnail image (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="is_featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Featured Video</FormLabel>
                        <FormDescription>
                          Set as the primary video for this product
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
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
                          Set if this video is currently active
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
                    {isSubmitting ? 'Adding...' : 'Add Video '}
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
