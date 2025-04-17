
import React from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Image, PlusCircle } from 'lucide-react';

interface EmptyStateProps {
  productId: number;
}

export function EmptyState({ productId }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-500 p-12 text-center">
      <div className="flex flex-col items-center justify-center gap-2">
        <Image className="h-12 w-12 text-gray-400" />
        <h3 className="text-lg font-medium">No images uploaded yet</h3>
        <p className="text-muted-foreground">
          Add images to showcase this product
        </p>
        <Button className="mt-4" asChild>
          <Link href={route('product-images.create', productId)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Images
          </Link>
        </Button>
      </div>
    </div>
  );
}