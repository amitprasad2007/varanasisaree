import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { useController, useForm } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from 'sweetalert2';


const formSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  designation: z.string().optional(),
  email: z.string().optional(),
  company: z.string().optional(),
  photo: z.any().optional(),
  testimonial: z.string().min(1, 'Testimonial content is required'),
  testimonial_hi: z.string().optional(),
  rating: z.coerce.number().min(1).max(5).optional().nullable(),
  status: z.enum(['active', 'inactive']).default('inactive'),
  approval_status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
});

type FormValues = z.infer<typeof formSchema>;

export default function Create() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      designation: '',
      email: '',
      company: '',
      photo: null,
      testimonial: '',
      testimonial_hi: '',
      rating: null,
      status: 'inactive' as const,
      approval_status: 'pending' as const,
    },
  });

  const { control, handleSubmit, formState } = form;
  
  // Custom file input controller
  const { field: photoField } = useController({
    name: 'photo',
    control,
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      photoField.onChange(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: FormValues) => {
    // Convert form data to FormData for file upload
    const formData = new FormData();
    formData.append('name', data.name || '');
    formData.append('email', data.email || '');
    if (data.designation) formData.append('designation', data.designation);
    if (data.company) formData.append('company', data.company);
    if (data.photo) formData.append('photo', data.photo);
    
    formData.append('testimonial', data.testimonial);
    if (data.testimonial_hi) formData.append('testimonial_hi', data.testimonial_hi);
    if (data.rating !== null) formData.append('rating', String(data.rating));
    
    formData.append('status', data.status);
    formData.append('approval_status', data.approval_status);

    router.post(route('testimonials.store'), formData, {
      onSuccess: () => {
        Swal.fire({
            title: 'Success!',
            text: `Testimonial has been created successfully.`,
            icon: 'success',
            timer: 4000,
            showConfirmButton: false
        });
      },
    });
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Testimonials', href: route('testimonials.index') },
    { title: 'Add Testimonials', href: route('testimonials.create') },
];

  return (
    <DashboardLayout title="Add Testimonial">
      <div className="space-y-4 pb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Add Testimonial</h1>
            <p className="text-muted-foreground">
              Create a new customer testimonial
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href={route('testimonials.index')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Testimonials
            </Link>
          </Button>
        </div>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>
        <Card>
          <CardHeader>
            <CardTitle>Testimonial Details</CardTitle>
            <CardDescription>
              Enter the testimonial information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <FormField
                      control={control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Name*</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="designation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position</FormLabel>
                          <FormControl>
                            <Input placeholder="CEO" {...field} />
                          </FormControl>
                          <FormDescription>
                            Client's job title or position
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type='email' placeholder="email id" {...field} />
                          </FormControl>
                          <FormDescription>
                            Client's Email id
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input placeholder="Acme Inc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="rating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rating (1-5)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={1} 
                              max={5}
                              placeholder="5" 
                              {...field}
                              value={field.value === null ? '' : field.value}
                              onChange={(e) => {
                                const value = e.target.value === '' ? null : parseInt(e.target.value, 10);
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Optional rating out of 5 stars
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="photo"
                      render={() => (
                        <FormItem>
                          <FormLabel>Client Photo</FormLabel>
                          <FormControl>
                            <div className="space-y-4">
                              <Input 
                                type="file" 
                                accept="image/*" 
                                onChange={handlePhotoChange}
                              />
                              {imagePreview && (
                                <div className="mt-2">
                                  <img 
                                    src={imagePreview} 
                                    alt="Preview" 
                                    className="w-24 h-24 rounded-full object-cover border"
                                  />
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormDescription>
                            Upload a photo of the client (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <FormField
                      control={control}
                      name="testimonial"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Testimonial Content (English)*</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter the testimonial content in English" 
                              className="min-h-[150px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="testimonial_hi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Testimonial Content (Hindi)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter the testimonial content in Hindi" 
                              className="min-h-[150px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Optional Hindi translation of the testimonial
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <FormField
                        control={control}
                        name="status"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Active Status</FormLabel>
                              <FormDescription>
                                Set if this testimonial is active
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

                      <FormField
                        control={control}
                        name="approval_status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Approval Status</FormLabel>
                            <FormControl>
                              <select 
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value as 'pending' | 'approved' | 'rejected')}
                              >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            </FormControl>
                            <FormDescription>
                              Set the approval status of this testimonial
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <CardFooter className="flex justify-end px-0 pb-0">
                  <Button 
                    type="submit" variant="outline"  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? 'Creating...' : 'Create Testimonial'}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </CardContent>
        </Card>

    </DashboardLayout>
  );
}
