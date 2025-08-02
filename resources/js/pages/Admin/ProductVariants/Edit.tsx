import React from 'react';
import { useForm } from '@inertiajs/react';
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
import { Link } from '@inertiajs/react';
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

interface ProductVariant {
  id: number;
  sku: string;
  price: number;
  discount: number;
  stock_quantity: number;
  image_path: string | null;
  status: 'active' | 'inactive';
  color: Color | null;
  size: Size | null;
}

interface Props {
  product: Product;
  variant: ProductVariant;
  colors: Color[];
  sizes: Size[];
}

export default function Edit({ product, variant, colors, sizes }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    color_id: variant.color?.id?.toString() || '',
    size_id: variant.size?.id?.toString() || '',
    sku: variant.sku,
    price: variant.price.toString(),
    discount: variant.discount.toString(),
    stock_quantity: variant.stock_quantity.toString(),
    image: null as File | null,
    status: variant.status,
    _method: 'PUT'
  });

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Product Variants', href: route('product-variants.index', product.id) },
    { title: 'Edit Product Variant', href: route('product-variants.edit', [product.id, variant.id]) },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    post(route('product-variants.update', [product.id, variant.id]), {
      onSuccess: () => {
        Swal.fire({
          title: 'Success!',
          text: 'Variant updated successfully',
          icon: 'success',
          timer: 4000,
          showConfirmButton: false
        });
      },
      onError: () => {
        Swal.fire({
          title: 'Error!',
          text: 'Failed to update variant',
          icon: 'error',
          timer: 4000,
          showConfirmButton: false
        });
      }
    });
  };

  return (
    <DashboardLayout title={`Edit Product Variant - ${product.name}`}>
      <div className="space-y-4 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Edit Product Variant - {product.name}</h1>
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
        <h1 className="text-2xl font-bold mb-6">Edit Product Variant - {product.name}</h1>

        <div className="bg-white rounded-md shadow p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Select
                      value={data.color_id}
                      onValueChange={(value) => setData('color_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a color" />
                      </SelectTrigger>
                      <SelectContent>
                        {colors.map((color) => (
                          <SelectItem key={color.id} value={color.id.toString()}>
                            <div className="flex items-center gap-2">
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
                  {errors.color_id && <FormMessage>{errors.color_id}</FormMessage>}
                </FormItem>

                <FormItem>
                  <FormLabel>Size</FormLabel>
                  <FormControl>
                    <Select
                      value={data.size_id}
                      onValueChange={(value) => setData('size_id', value)}
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
                  {errors.size_id && <FormMessage>{errors.size_id}</FormMessage>}
                </FormItem>
              </div>

              <FormItem>
                <FormLabel>SKU <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input
                    value={data.sku}
                    onChange={e => setData('sku', e.target.value)}
                    placeholder="Product variant SKU"
                  />
                </FormControl>
                {errors.sku && <FormMessage>{errors.sku}</FormMessage>}
              </FormItem>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormItem>
                  <FormLabel>Price <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={data.price}
                      onChange={e => setData('price', e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </FormControl>
                  {errors.price && <FormMessage>{errors.price}</FormMessage>}
                </FormItem>

                <FormItem>
                  <FormLabel>Discount (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={data.discount}
                      onChange={e => setData('discount', e.target.value)}
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                  </FormControl>
                  {errors.discount && <FormMessage>{errors.discount}</FormMessage>}
                </FormItem>

                <FormItem>
                  <FormLabel>Stock Quantity <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={data.stock_quantity}
                      onChange={e => setData('stock_quantity', e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                  </FormControl>
                  {errors.stock_quantity && <FormMessage>{errors.stock_quantity}</FormMessage>}
                </FormItem>
              </div>

              <FormItem>
                <FormLabel>Variant Image</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    {variant.image_path && (
                      <div className="text-sm text-gray-600">
                        Current image: {variant.image_path}
                      </div>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={e => setData('image', e.target.files?.[0] || null)}
                    />
                  </div>
                </FormControl>
                {errors.image && <FormMessage>{errors.image}</FormMessage>}
              </FormItem>

              <FormItem>
                <FormLabel>Status <span className="text-red-500">*</span></FormLabel>
                <FormControl>
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
                </FormControl>
                {errors.status && <FormMessage>{errors.status}</FormMessage>}
              </FormItem>

              <div className="flex justify-end">
                <Button type="submit" disabled={processing}>
                  {processing ? 'Updating...' : 'Update Variant'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}