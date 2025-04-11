
import React, { useState, useEffect } from 'react';
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
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from "sweetalert2";
import axios from 'axios';
import { toast } from 'sonner';

interface product {
    id: number;
    name:string;
    slug:string;
    category:{title:string};
    category_id:number;
    subcategory_id:number;
    brand_id:number;
    subcategory:{title:string};
    brand:{name:string};
    price:string;
    discount:number;
    stock_quantity:number;
    status:string;
    is_bestseller:boolean;
    created_at:string;
    updated_at:string;
    description:string;
    fabric:string;
    color:string;
    size:number;
    weight:number;
    work_type:string;
    occasion:string;
  }
  interface brands {

  }
  interface category{

  }
  interface Props {
    product: product;
    brands:brands;
    category:category;
  }

export default function Edit({ category ,product,brands}: Props) {
  const [subcategories, setSubcategories] = useState([]);
  const { data, setData, put, processing, errors } = useForm({
    name: product.name || '',
    category_id: product.category_id || '',
    subcategory_id: product.subcategory_id || '',
    brand_id: product.brand_id || '',
    description: product.description || '',
    price: product.price || '',
    discount: product.discount || '0',
    stock_quantity: product.stock_quantity || '0',
    fabric: product.fabric || '',
    color: product.color || '',
    size: product.size || '',
    work_type: product.work_type || '',
    occasion: product.occasion || '',
    weight: product.weight || '',
    is_bestseller: product.is_bestseller || false,
    status: product.status || 'active'
  });

  useEffect(() => {
    if (data.category_id) {
      fetchSubcategories(String(data.category_id));
    }
  }, [data.category_id]);

  const fetchSubcategories = async (categoryId: string) => {
    try {
      const response = await axios.get(`/get-subcategories/${categoryId}`);
      setSubcategories(response.data);
      setData('subcategory_id', ''); // Reset subcategory when category changes
    } catch (error) {

      Swal.fire({
        title: 'Error!',
        text: 'Error fetching subcategories'+error,
        icon: 'error',
        timer: 3000,
        showConfirmButton: false
    });
    }
  };


  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Product', href: route('products.index') },
    { title: 'Edit Product', href: route('products.edit', product.id) },
];

  return (
    <DashboardLayout title="Edit Product">
        <div className="space-y-4 pb-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Edit Product: {product.name}</h1>
                <Button
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                        variant="outline"
                    onClick={() => window.history.back()}
                >
                    Cancel
                </Button>
            </div>
            <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
        <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Product: {product.name}</h1>

        <div className="bg-white rounded-md shadow p-6">
          <Form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                {/* Basic Info */}
                <FormItem>
                  <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      value={data.name}
                      onChange={e => setData('name', e.target.value)}
                      placeholder="Product name"
                    />
                  </FormControl>
                  {errors.name && <FormMessage>{errors.name}</FormMessage>}
                </FormItem>

                <FormItem>
                  <FormLabel>Category <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Select
                      value={data.category_id.toString()}
                      onValueChange={(value) => setData('category_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {errors.category_id && <FormMessage>{errors.category_id}</FormMessage>}
                </FormItem>

                <FormItem>
                  <FormLabel>Subcategory <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Select
                      value={data.subcategory_id.toString()}
                      onValueChange={(value) => setData('subcategory_id', value)}
                      disabled={!data.category_id || subcategories.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !data.category_id ? "Select a category first" :
                          subcategories.length === 0 ? "No subcategories available" :
                          "Select a subcategory"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {subcategories.map((subcategory) => (
                          <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                            {subcategory.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {errors.subcategory_id && <FormMessage>{errors.subcategory_id}</FormMessage>}
                </FormItem>

                <FormItem>
                  <FormLabel>Brand <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Select
                      value={data.brand_id.toString()}
                      onValueChange={(value) => setData('brand_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id.toString()}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {errors.brand_id && <FormMessage>{errors.brand_id}</FormMessage>}
                </FormItem>

                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      value={data.description || ''}
                      onChange={e => setData('description', e.target.value)}
                      placeholder="Product description"
                      rows={4}
                    />
                  </FormControl>
                  {errors.description && <FormMessage>{errors.description}</FormMessage>}
                </FormItem>
              </div>

              <div className="space-y-6">
                {/* Pricing and Inventory */}
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

                {/* Product Attributes */}
                <div className="grid grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>Fabric</FormLabel>
                    <FormControl>
                      <Input
                        value={data.fabric || ''}
                        onChange={e => setData('fabric', e.target.value)}
                        placeholder="Cotton, Silk, etc."
                      />
                    </FormControl>
                    {errors.fabric && <FormMessage>{errors.fabric}</FormMessage>}
                  </FormItem>

                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Input
                        value={data.color || ''}
                        onChange={e => setData('color', e.target.value)}
                        placeholder="Red, Blue, etc."
                      />
                    </FormControl>
                    {errors.color && <FormMessage>{errors.color}</FormMessage>}
                  </FormItem>

                  <FormItem>
                    <FormLabel>Size</FormLabel>
                    <FormControl>
                      <Input
                        value={data.size || ''}
                        onChange={e => setData('size', e.target.value)}
                        placeholder="S, M, L, XL, etc."
                      />
                    </FormControl>
                    {errors.size && <FormMessage>{errors.size}</FormMessage>}
                  </FormItem>

                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={data.weight || ''}
                        onChange={e => setData('weight', e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </FormControl>
                    {errors.weight && <FormMessage>{errors.weight}</FormMessage>}
                  </FormItem>
                </div>

                <FormItem>
                  <FormLabel>Work Type</FormLabel>
                  <FormControl>
                    <Input
                      value={data.work_type || ''}
                      onChange={e => setData('work_type', e.target.value)}
                      placeholder="Embroidery, Print, etc."
                    />
                  </FormControl>
                  {errors.work_type && <FormMessage>{errors.work_type}</FormMessage>}
                </FormItem>

                <FormItem>
                  <FormLabel>Occasion</FormLabel>
                  <FormControl>
                    <Input
                      value={data.occasion || ''}
                      onChange={e => setData('occasion', e.target.value)}
                      placeholder="Casual, Formal, Party, etc."
                    />
                  </FormControl>
                  {errors.occasion && <FormMessage>{errors.occasion}</FormMessage>}
                </FormItem>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              {/* Status & Bestseller */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={data.is_bestseller}
                      onCheckedChange={(checked) => setData('is_bestseller', checked)}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Bestseller</FormLabel>
                    <FormDescription>
                      Mark this product as a bestseller
                    </FormDescription>
                  </div>
                  {errors.is_bestseller && <FormMessage>{errors.is_bestseller}</FormMessage>}
                </FormItem>

                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Select
                      value={data.status}
                      onValueChange={(value) => setData('status', value)}
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
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={processing}
                >
                  {processing ? 'Updating...' : 'Update Product'}
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </DashboardLayout>
  );
}