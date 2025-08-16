import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2, Star } from 'lucide-react';
import { ProductVariantImageCarousel } from '@/components/ProductVariantImages/ProductVariantImageCarousel';
import { ProductVariantImagesTable } from '@/components/ProductVariantImages/ProductVariantImagesTable';
import { EmptyState } from '@/components/ProductImages/EmptyState';
import { toast } from 'sonner';

interface Product {
  id: number;
  name: string;
}

interface Color {
  id: number;
  name: string;
  hex_code?: string;
}

interface Size {
  id: number;
  name: string;
  code?: string;
}

interface ProductVariant {
  id: number;
  product_id: number;
  color_id?: number;
  size_id?: number;
  sku: string;
  price: number;
  discount: number;
  stock_quantity: number;
  status: string;
  product: Product;
  color?: Color;
  size?: Size;
}

interface ProductVariantImage {
  id: number;
  product_variant_id: number;
  image_path: string;
  alt_text?: string;
  is_primary: boolean;
  display_order: number;
}

interface IndexProps {
  variant: ProductVariant;
  images: ProductVariantImage[];
  success?: string;
}

export default function Index({ variant, images, success }: IndexProps) {
  const [reorderedImages, setReorderedImages] = useState<ProductVariantImage[]>(images || []);
  const { delete: destroy } = useForm();

  React.useEffect(() => {
    if (success) {
      toast.success(success);
    }
  }, [success]);

  // Keep local state in sync if server-provided images change
  React.useEffect(() => {
    setReorderedImages(images || []);
  }, [images]);

  const handleDelete = (id: number) => {
    destroy(route('product-variant-images.destroy', id), {
      onSuccess: () => toast.success('Image deleted successfully'),
      onError: () => toast.error('Failed to delete image')
    });
  };

  const handleSetPrimary = (id: number) => {
    router.post(route('product-variant-images.set-primary', { image: id }), {}, {
      onSuccess: () => {
        // Optimistically update local state
        setReorderedImages(prev => prev.map(img => ({ ...img, is_primary: img.id === id })));
        toast.success('Primary image updated');
      },
      onError: () => toast.error('Failed to update primary image')
    });
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(reorderedImages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update display_order for all items
    const updatedItems = items.map((item, index) => ({
      ...item,
      display_order: index + 1
    }));

    setReorderedImages(updatedItems);
  };

  const saveOrder = () => {
    const payload = {
      images: reorderedImages.map((img, index) => ({ id: img.id, display_order: index + 1 }))
    };
    console.log('saveOrder payload snapshot:', JSON.stringify(payload));
    router.post(route('product-variant-images.update-order', { variant: variant.id }), payload, {
      onSuccess: () => toast.success('Image order updated successfully'),
      onError: () => toast.error('Failed to update image order')
    });
  };

  const variantTitle = `${variant.product.name} - ${variant.color?.name || ''} ${variant.size?.name || ''} (${variant.sku})`.trim();

  return (
    <DashboardLayout title={`Variant Images - ${variantTitle}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href={route('product-variants.index', variant.product_id)}
              className="flex w-54 items-center text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md p-2 mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" />
              Back to Product Variants
            </Link>
            <h1 className="text-2xl font-bold">Variant Images - {variantTitle}</h1>
          </div>
          <div className="flex items-center space-x-3">
            {(() => {
              const originalOrder = images.map(i => i.id).join(',');
              const currentOrder = reorderedImages.map(i => i.id).join(',');
              const orderChanged = originalOrder !== currentOrder;
              return orderChanged;
            })() && (
              <Button onClick={saveOrder} variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                Save Order
              </Button>
            )}
            <Link href={route('product-variant-images.create', variant.id)}>
              <Button variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                <Plus className="w-4 h-4 mr-2" />
                Add Images
              </Button>
            </Link>
          </div>
        </div>

        {reorderedImages.length > 0 ? (
          <>
            <ProductVariantImageCarousel images={reorderedImages} variantName={variantTitle} />
            <ProductVariantImagesTable
              images={reorderedImages}
              onDelete={handleDelete}
              onSetPrimary={handleSetPrimary}
              onDragEnd={onDragEnd}
            />
          </>
        ) : (
          <EmptyState
            title="No images uploaded yet"
            description="Upload images to showcase this product variant."
            actionText="Add Images"
            actionHref={route('product-variant-images.create', variant.id)}
            productId={variant.product_id}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
