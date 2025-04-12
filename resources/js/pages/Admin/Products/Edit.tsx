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
import { Label } from "@/components/ui/label";
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
    id: number;
    name: string;
  }
  interface Category{
    id: number;
    title: string;
  }
  interface subcategories {
    id: number;
    title: string;
}
  interface Props {
    product: product;
    brands:brands[ ];
    categories:Category[];
    subcategories:subcategories[];
  }

type CheckedState = boolean | "indeterminate";
type CheckedStateBest = boolean | "indeterminate";
export default function Edit({ categories,product,brands,subcategories}: Props) {
const [fetchedSubcategories, setFetchedSubcategories] = useState(subcategories);
const [hasMounted, setHasMounted] = useState(false);
  const { data, setData, put, processing, errors } = useForm({
    name: product.name || '',
    slug: product.slug || '',
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
    is_bestseller: product.is_bestseller ||  false as CheckedStateBest,
    status: product.status === 'active' ? true as CheckedState: false,
  });

  useEffect(() => {
    if (hasMounted && data.category_id) {
        fetchSubcategories(String(data.category_id));
    } else {
        setHasMounted(true);
    }
  }, [data.category_id]);

  const fetchSubcategories = async (categoryId: string) => {
    try {
      const response = await axios.get(`/get-subcategories/${categoryId}`);
      setFetchedSubcategories(response.data);
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
const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('products.update', product.id), {
        onSuccess: () => {
            Swal.fire({
                title: 'Success!',
                text: 'SubCategory updated successfully',
                icon: 'success',
                timer: 4000,
                showConfirmButton: false
            });
        }
    });
};

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
        <div className="bg-white rounded-md shadow-lg border border-gray-100 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-gray-50 rounded-md shadow-md border border-gray-200 p-6 mt-6">
                    <h2 className="text-2xl font-bold mb-6">Edit Product: {product.name}</h2>
                    <div className="space-y-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                        />
                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                            id="slug"
                            value={data.slug}
                            onChange={e => setData('slug', e.target.value)}
                        />
                        {errors.slug && <p className="text-sm text-red-600">{errors.slug}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category_id">Category</Label>
                        <Select
                            value={String(data.category_id)}
                            onValueChange={value => setData('category_id', value)}
                        >
                            <SelectTrigger className="bg-white border border-gray-300 rounded-md shadow-sm">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                                {categories.map(category => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                        {category.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.category_id && <p className="text-sm text-red-600">{errors.category_id}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subcategory_id">Sub Category</Label>
                        <Select
                        value={String(data.subcategory_id) }
                        onValueChange={(value) => setData('subcategory_id', value)}

                        >
                        <SelectTrigger  className="bg-white border border-gray-300 rounded-md shadow-sm">
                            <SelectValue placeholder={
                            !data.category_id ? "Select a category first" :
                            fetchedSubcategories.length === 0 ? "No subcategories available" :
                            "Select a subcategory"
                            } />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                            {fetchedSubcategories.map((subcategory) => (
                            <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                                {subcategory.title}
                            </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        {errors.subcategory_id && <p className="text-sm text-red-600">{errors.subcategory_id}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="brand_id">Brand</Label>
                        <Select value={String(data.brand_id)} onValueChange={value => setData('brand_id', value)} >
                            <SelectTrigger className="bg-white border border-gray-300 rounded-md shadow-sm">
                                <SelectValue placeholder="Select a brand" />
                            </SelectTrigger>
                            <SelectContent  className="bg-white border border-gray-300 rounded-md shadow-lg">
                                {brands.map((brand) => (
                                <SelectItem key={brand.id} value={brand.id.toString()}>
                                    {brand.name}
                                </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.brand_id && <p className="text-sm text-red-600">{errors.brand_id}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                        />
                        {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="price">Price</Label>
                        <Input
                            id="price"
                            type="number"
                            value={data.price}
                            onChange={e => setData('price', e.target.value)}
                        />
                        {errors.price && <p className="text-sm text-red-600">{errors.price}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="discount">Discount</Label>
                        <Input
                            id="discount"
                            type="number"
                            value={data.discount}
                            onChange={e => setData('discount', e.target.value)}
                        />
                        {errors.discount && <p className="text-sm text-red-600">{errors.discount}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="stock_quantity">Stock Quantity</Label>
                        <Input
                            id="stock_quantity"
                            type="number"
                            value={data.stock_quantity}
                            onChange={e => setData('stock_quantity', e.target.value)}
                        />
                        {errors.stock_quantity && <p className="text-sm text-red-600">{errors.stock_quantity}</p>}
                    </div>
                    <div className="bg-gray-50 rounded-md shadow-md border border-gray-200 p-6 mt-6">
                    <h2 className="text-lg font-bold mb-4">Product Attributes</h2>
                    <div className="space-y-2">
                        <Label htmlFor="fabric">Fabric</Label>
                        <Input
                            id="fabric"
                            value={data.fabric || ''}
                            onChange={e => setData('fabric', e.target.value)}
                            placeholder="Cotton, Silk, etc."
                        />
                        {errors.fabric && <p className="text-sm text-red-600">{errors.fabric}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="color">Color</Label>
                        <Input
                            id="color"
                            value={data.color || ''}
                            onChange={e => setData('color', e.target.value)}
                            placeholder="Red, Blue, etc."
                        />
                        {errors.color && <p className="text-sm text-red-600">{errors.color}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="size">Size</Label>
                        <Input
                            id="size"
                            value={data.size || ''}
                            onChange={e => setData('size', e.target.value)}
                            placeholder="S, M, L, XL, etc."
                        />
                        {errors.size && <p className="text-sm text-red-600">{errors.size}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="weight">Weight</Label>
                        <Input
                            id="weight"
                            type="number"
                            value={data.weight || ''}
                            onChange={e => setData('weight', e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                        />
                        {errors.weight && <p className="text-sm text-red-600">{errors.weight}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="work_type">Work Type</Label>
                        <Input
                            id="work_type"
                            value={data.work_type || ''}
                            onChange={e => setData('work_type', e.target.value)}
                            placeholder="Embroidery, Print, etc."
                        />
                        {errors.work_type && <p className="text-sm text-red-600">{errors.work_type}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="occasion">Occasion</Label>
                        <Input
                            id="occasion"
                            value={data.occasion || ''}
                            onChange={e => setData('occasion', e.target.value)}
                            placeholder="Casual, Formal, Party, etc."
                        />
                        {errors.occasion && <p className="text-sm text-red-600">{errors.occasion}</p>}
                    </div>
                 </div>
                 <div className="bg-gray-50 rounded-md shadow-md border border-gray-200 p-6 mt-6">
                    <h2 className="text-lg font-bold mb-4">Status & Bestseller</h2>
                    <div className="flex items-center space-x-3 space-y-1 mb-2">
                        <Checkbox
                            id="is_bestseller"
                            checked={data.is_bestseller}
                            onCheckedChange={(checked) => setData('is_bestseller', checked)}
                        />
                        <label
                            htmlFor="is_bestseller"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mr-30"
                        >
                            Is Bestseller
                        </label>
                        <Checkbox
                            id="status"
                            checked={data.status}
                            onCheckedChange={(checked) => setData('status', checked)}
                        />
                        <label
                            htmlFor="status"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Active
                        </label>
                    </div>
                 </div>

                </div>
                <Button  variant="outline" type="submit" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" disabled={processing}>
                     {processing ? 'Updating...' : 'Update Product'}
                </Button>
            </form>
        </div>
    </DashboardLayout>
  );
}