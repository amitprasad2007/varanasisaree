import React from 'react';
import { Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
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
import { useForm } from 'react-hook-form';
import { VideoProvider } from '@/types/product';
import { Inertia } from '@inertiajs/inertia';

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
  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: provider.name,
      base_url: provider.base_url,
      logo: null,
      status: provider.status as 'active' | 'inactive',
    },
  });

  const onSubmit = (data: FormValues) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('base_url', data.base_url);
    formData.append('status', data.status);
    formData.append('_method', 'PUT');
    
    if (data.logo) {
      formData.append('logo', data.logo);
    }

    // Submit the form using Inertia
    Inertia.post(route('video-providers.update', provider.id), formData, {
      forceFormData: true,
    });
  };

  return (
    <DashboardLayout title={`Edit Provider: ${provider.name}`}>
      <div className="space-y-6">
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

        <Card>
          <CardHeader>
            <CardTitle>Provider Details</CardTitle>
            <CardDescription>
              Edit the information for this video provider
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              const file = e.target.files[0];
                              // Handle file upload logic here
                            }
                          }}
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
                  >
                    Update Provider
                  </Button>
                </CardFooter>
              </form>

          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
