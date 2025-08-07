import React from 'react';
import { Link, useForm } from '@inertiajs/react';
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
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ArrowLeft, Images } from 'lucide-react';
import { router } from '@inertiajs/react';
import Swal from 'sweetalert2';

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
  created_at: string;
}

interface Props {
  product: Product;
  variants: ProductVariant[];
}

export default function Index({ product, variants }: Props) {
  const { delete: destroy } = useForm();
  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Are you sure you want to delete this variant?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route('product-variants.destroy', [product.id, id]), {
          onSuccess: () => {
            Swal.fire({
              title: 'Success!',
              text: 'Variant deleted successfully',
              icon: 'success',
              timer: 4000,
              showConfirmButton: false
            });
          },
          onError: () => {
            Swal.fire({
              title: 'Error!',
              text: 'Failed to delete variant',
              icon: 'error',
              timer: 4000,
              showConfirmButton: false
            });
          }
        });
      }
    });
  };

  return (
    <DashboardLayout title={`Product Variants - ${product.name}`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link
            href={route('products.index')}
            className="flex w-42 items-center text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md p-2 mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" />
            Back to Products
          </Link>
          <h1 className="text-2xl font-bold">Product Variants - {product.name}</h1>
        </div>
        <Link href={route('product-variants.create', product.id)}>
          <Button variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
            <Plus className="w-4 h-4 mr-2" />
            Add Variant
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-md shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((variant) => (
              <TableRow key={variant.id}>
                <TableCell className="font-medium">{variant.sku}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {variant.color?.hex_code && (
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: variant.color.hex_code }}
                      />
                    )}
                    {variant.color?.name || 'N/A'}
                  </div>
                </TableCell>
                <TableCell>{variant.size?.name || 'N/A'}</TableCell>
                <TableCell>₹{variant.price}</TableCell>
                <TableCell>{variant.discount}%</TableCell>
                <TableCell>{variant.stock_quantity}</TableCell>
                <TableCell>
                  <Badge variant={variant.status === 'active' ? 'default' : 'secondary'}>
                    {variant.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(variant.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={route('product-variant-images.index', variant.id)}>
                      <Button variant="outline" size="sm" title="View Images" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Images className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link href={route('product-variants.edit', [product.id, variant.id])}>
                      <Button variant="outline" size="sm" title="Edit Variant" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(variant.id)}
                      title="Delete Variant"
                      className="cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}
