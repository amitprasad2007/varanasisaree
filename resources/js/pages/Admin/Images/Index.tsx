
import React, { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { DropResult } from 'react-beautiful-dnd';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import { Product, ProductImage } from '@/types/product';
import { ProductImageCarousel } from '@/components/ProductImages/ProductImageCarousel';
import { ProductImagesTable } from '@/components/ProductImages/ProductImagesTable';
import { EmptyState } from '@/components/ProductImages/EmptyState';
import { router } from '@inertiajs/react';
import { Trash, Edit, Plus, View } from "lucide-react";
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
interface IndexProps {
  product: Product;
  images: ProductImage[];
  success?: string;
}

export default function Index({ product, images, success }: IndexProps) {
  const [reorderedImages, setReorderedImages] = useState<ProductImage[]>(images || []);
  const { delete: destroy } = useForm();
  const { post: setPrimary } = useForm();
  const { post: updateOrder } = useForm();

  // ... keep existing code (React.useEffect and handlers)
  const handleDelete = (id: number) => {
    destroy(route('product-images.destroy', id), {
      onSuccess: () => {
        toast.success('Image deleted successfully');
      },
      onError: () => {
        toast.error('Failed to delete image');
      }
    });
  };


 const handleSetPrimary = (id: number) => {
    setPrimary(route('product-images.set-primary', id), {
      onSuccess: () => {
        toast.success('Primary image updated');
      },
      onError: () => {
        toast.error('Failed to update primary image');
      }
    });
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(reorderedImages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    const updatedItems = items.map((item, index) => ({
      ...item,
      display_order: index + 1
    }));
    
    setReorderedImages(updatedItems);
  };

  const saveOrder = () => {
    const updatedImages = reorderedImages.map((img) => ({
      id: img.id,
      display_order: img.display_order
    }));
  
    router.post(route('product-images.update-order', product.id), {
      images: updatedImages
    }, {
      onSuccess: () => toast.success('Order saved successfully'),
      onError: () => toast.error('Failed to save order')
    });
  };
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Product', href: route('products.index') },
    { title: 'Show Product', href: route('products.show', product.id) },
    { title: 'Product Image', href: route('product-images.index', product.id) },
  ];
  return (
    <DashboardLayout title={`${product.name} - Images`}>
      <div className="space-y-6">
      <div className="space-y-4 pb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Product Images</h1>            
          </div>
          <div className="flex gap-4">
            <Button variant="outline" asChild>
              <Link href={route('products.show', product.id)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Product
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={route('product-images.create', product.id)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Images
              </Link>
            </Button>
          </div>          
        </div>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
        {reorderedImages.length > 0 ? (
          <div className="bg-white rounded-md shadow-lg border border-gray-100" >
            <ProductImageCarousel 
              images={reorderedImages} 
              productName={product.name}
            />

            <div className="bg-white rounded-lg shadow border mt-1 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Manage Images</h2>
                <Button  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={saveOrder} variant="outline">Save Order</Button>
              </div>

              <ProductImagesTable 
                images={reorderedImages}
                onDelete={handleDelete}
                onSetPrimary={handleSetPrimary}
                onDragEnd={onDragEnd}
              />
            </div>
          </div>
        ) : (
          <EmptyState productId={product.id} />
        )}
      </div>
    </DashboardLayout>
  );
}