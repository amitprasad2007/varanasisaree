import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from "sweetalert2";

interface Product {
  id: number;
  name: string;
  price: string;
  category?: { name: string };
  brand?: { name: string };
  images?: Array<{ image_path: string }>;
  pivot?: { display_order: number };
}

interface Collection {
  id: number;
  name: string;
  type: string;
}

interface Props {
  collection: Collection;
  collectionProducts: Product[];
  availableProducts: Product[];
}

export default function Products({ collection, collectionProducts, availableProducts }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data, setData, post, processing, reset } = useForm({
    product_id: '',
    display_order: 0,
  });

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/admin/collections/${collection.id}/products`, {
      onSuccess: () => {
        setIsDialogOpen(false);
        reset();
      },
    });
  };

  const handleRemoveProduct = (productId: number) => {
    if (confirm('Are you sure you want to remove this product from the collection?')) {
      router.delete(`/admin/collections/${collection.id}/products/${productId}`);
    }
  };
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Collections', href: route('collections.index') },
    { title: 'Collections Product', href: route('products.create') },
  ];

  return (
    <DashboardLayout title="Collections - Product">
      <Head title={`${collection.name} - Products`} />
      
      <div className="p-6">
        <div className="mb-6">
          <Link href="/admin/collections">
            <Button variant="outline">← Back to Collections</Button>
          </Link>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">{collection.name}</h1>
            <p className="text-gray-600">Manage products in this collection</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Product</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Product to Collection</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <Label htmlFor="product_id">Select Product *</Label>
                  <Select value={data.product_id} onValueChange={(value) => setData('product_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name} - ${product.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={data.display_order}
                    onChange={(e) => setData('display_order', parseInt(e.target.value))}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={processing}>
                    Add Product
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white rounded-lg shadow">
          {collectionProducts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No products in this collection yet.</p>
              <p className="text-sm mt-2">Click "Add Product" to start adding products.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Display Order</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collectionProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0].image_path}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No image</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category?.name}</TableCell>
                    <TableCell>{product.brand?.name}</TableCell>
                    <TableCell>${product.price}</TableCell>
                    <TableCell>{product.pivot?.display_order}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveProduct(product.id)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}