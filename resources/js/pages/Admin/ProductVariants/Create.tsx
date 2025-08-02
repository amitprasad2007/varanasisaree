import React from 'react';
import { Link, router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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

interface Product {
  id: number;
  name: string;
}

interface Color {
  id: number;
  name: string;
  hex_code: string | null;
}

interface Size {
  id: number;
  name: string;
  code: string | null;
}

interface Props {
  product: Product;
  colors: Color[];
  sizes: Size[];
}

const formSchema = z.object({
  product_id: z.string(),
  color_id: z.string().min(1, 'Color is required'),
  size_id: z.string().min(1, 'Size is required'),
  sku: z.string().min(1, 'SKU is required'),
  price: z.string().min(1, 'Price is required'),
  discount: z.string(),
  stock_quantity: z.string().min(1, 'Stock quantity is required'),
  image: z.any().optional(),
  status: z.enum(['active', 'inactive']),
});

type FormValues = z.infer<typeof formSchema>;

export default function Create({ product, colors, sizes }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product_id: product.id.toString(),
      color_id: '',
      size_id: '',
      sku: '',
      price: '',
      discount: '0',
      stock_quantity: '0',
      image: null,
      status: 'active'
    },
  });

  const { control, handleSubmit, formState: { errors, isSubmitting } } = form;

  const onSubmit = (data: FormValues) => {
    // Convert form data to FormData for file upload
    const formData = new FormData();
    formData.append('product_id', data.product_id);
    formData.append('color_id', data.color_id);
    formData.append('size_id', data.size_id);
    formData.append('sku', data.sku);
    formData.append('price', data.price);
    formData.append('discount', data.discount);
    formData.append('stock_quantity', data.stock_quantity);
    formData.append('status', data.status);
    
    if (data.image) {
      formData.append('image', data.image);
    }

    router.post(route('product-variants.store', product.id), formData, {
      onSuccess: () => {
        Swal.fire({
          title: 'Success!',
          text: 'Variant created successfully',
          icon: 'success',
          timer: 4000,
          showConfirmButton: false
        });
      }
    });
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Product Variants', href: route('product-variants.index', product.id) },
    { title: 'Create Product Variant', href: route('product-variants.create', product.id) },
  ];

  return (
    <DashboardLayout title={`Create Product Variant - ${product.name}`}>
      <div className="space-y-4 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Create Product Variant - {product.name}</h1>
        </div>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>
      <div className="max-w-2xl mx-auto">
        <Link 
          href={route('product-variants.index', product.id)} 
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Variants
        </Link>
        <h1 className="text-2xl font-bold mb-6">Create Product Variant - {product.name}</h1>

        <div className="bg-white rounded-md shadow p-6">
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={control}
                  name="color_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a color" />
                          </SelectTrigger>
                          <SelectContent>
                            {colors.map((color) => (
                              <SelectItem key={color.id} value={color.id.toString()}>
                                <div className="flex items-center gap-2 bg-white p-1 rounded">
                                  {color.hex_code && (
                                    <div
                                      className="w-4 h-4 rounded-full border border-gray-300"
                                      style={{ backgroundColor: color.hex_code }}
                                    />
                                  )}
                                  {color.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="size_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Size</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a size" />
                          </SelectTrigger>
                          <SelectContent>
                            {sizes.map((size) => (
                              <SelectItem key={size.id} value={size.id.toString()}>
                                {size.name} {size.code && `(${size.code})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Product variant SKU"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          min="0"
                          max="100"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="stock_quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          min="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={control}
                name="image"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>Variant Image</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => onChange(e.target.files?.[0] || null)}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Variant'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </DashboardLayout>
  );
}