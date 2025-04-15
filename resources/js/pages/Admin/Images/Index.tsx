import React, { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { DropResult } from 'react-beautiful-dnd';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import { Product, ProductImage } from '@/types/product';
import { ProductImageCarousel } from '@/Pages/Admin/Images/ProductImageCarousel';
import { ProductImagesTable } from '@/Pages/Admin/Images/ProductImagesTable';
import { EmptyState } from '@/Pages/Admin/Images/EmptyState';

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

  React.useEffect(() => {
    if (success) {
      toast.success(success);
    }
  }, [success]);

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
    
    console.log('Saving order with payload:', updatedImages);
    
    updateOrder({
      images: updatedImages
    }, route('product-images.update-order', product.id), {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Image order updated');
      },
      onError: (errors) => {
        console.error('Update order errors:', errors);
        toast.error('Failed to update image order');
      }
    });
  };

  return (
    <DashboardLayout title={`${product.name} - Images`}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Product Images</h1>
            <p className="text-muted-foreground">
              Manage images for {product.name}
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" asChild>
              <Link href={route('products.show', product.id)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Product
              </Link>
            </Button>
            <Button asChild>
              <Link href={route('product-images.create', product.id)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Images
              </Link>
            </Button>
          </div>
        </div>

        {reorderedImages.length > 0 ? (
          <>
            <ProductImageCarousel 
              images={reorderedImages} 
              productName={product.name}
            />

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Manage Images</h2>
                <Button onClick={saveOrder} variant="outline">Save Order</Button>
              </div>

              <ProductImagesTable 
                images={reorderedImages}
                onDelete={handleDelete}
                onSetPrimary={handleSetPrimary}
                onDragEnd={onDragEnd}
              />
            </div>
          </>
        ) : (
          <EmptyState productId={product.id} />
        )}
      </div>
    </DashboardLayout>
  );
}