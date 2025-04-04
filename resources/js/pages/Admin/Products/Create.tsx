
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
} from '@/Components/ui/form';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { Checkbox } from '@/Components/ui/checkbox';
import axios from 'axios';
import { toast } from 'sonner';

export default function Create({ categories, brands }) {
  const [subcategories, setSubcategories] = useState([]);
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    category_id: '',
    subcategory_id: '',
    brand_id: '',
    description: '',
    price: '',
    discount: '0',
    stock_quantity: '0',
    fabric: '',
    color: '',
    size: '',
    work_type: '',
    occasion: '',
    weight: '',
    is_bestseller: false,
    status: 'active'
  });

  useEffect(() => {
    if (data.category_id) {
      fetchSubcategories(data.category_id);
    }
  }, [data.category_id]);

  const fetchSubcategories = async (categoryId) => {
    try {
      const response = await axios.get(`/admin/get-subcategories/${categoryId}`);
      setSubcategories(response.data);
      setData('subcategory_id', ''); // Reset subcategory when category changes
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      toast.error('Failed to load subcategories');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('products.store'), {
      onSuccess: () => {
        toast.success('Product created successfully');
      },
      onError: () => {
        toast.error('Failed to create product');
      }
    });
  };

  return (
    <DashboardLayout title="Create Product">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create New Product</h1>

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
                      value={data.category_id} 
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
                      value={data.subcategory_id}
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
                      value={data.brand_id}
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
                  {processing ? 'Creating...' : 'Create Product'}
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </DashboardLayout>
  );
}