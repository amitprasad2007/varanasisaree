import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';

export interface ProductVariantImage {
  id: number;
  product_variant_id: number;
  image_path: string;
  alt_text?: string;
  is_primary: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

interface ProductVariantImageCarouselProps {
  images: ProductVariantImage[];
  variantName: string;
}

export function ProductVariantImageCarousel({ images, variantName }: ProductVariantImageCarouselProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium mb-4">Variant Image Gallery Preview</h2>
      <Carousel className="w-full max-w-4xl mx-auto">
        <CarouselContent>
          {images.map((image) => (
            <CarouselItem key={image.id} className="basis-full md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-2 relative">
                    <img
                      src={`/storage/${image.image_path}`}
                      alt={image.alt_text || variantName}
                      className="w-full h-full object-cover rounded"
                    />
                    {image.is_primary && (
                      <div className="absolute top-3 right-3 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full">
                        Primary
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-1" />
        <CarouselNext className="right-1" />
      </Carousel>
    </div>
  );
}
