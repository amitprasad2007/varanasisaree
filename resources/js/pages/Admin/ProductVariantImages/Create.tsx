import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Link } from '@inertiajs/react';
import { ArrowLeft, X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from "sweetalert2";

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

interface Props {
  variant: ProductVariant;
}

interface ImageFile {
  file: File;
  preview: string;
  altText: string;
}

export default function Create({ variant }: Props) {
  const [selectedImages, setSelectedImages] = useState<ImageFile[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number>(0);

  const { processing } = useForm();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      altText: ''
    }));

    setSelectedImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      // Adjust primary image index if needed
      if (primaryImageIndex >= updated.length && updated.length > 0) {
        setPrimaryImageIndex(updated.length - 1);
      } else if (primaryImageIndex === index && updated.length > 0) {
        setPrimaryImageIndex(0);
      }
      return updated;
    });
  };

  const updateAltText = (index: number, altText: string) => {
    setSelectedImages(prev =>
      prev.map((img, i) => i === index ? { ...img, altText } : img)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedImages.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    const formData = new FormData();

    selectedImages.forEach((imageFile, index) => {
      formData.append(`images[${index}]`, imageFile.file);
      formData.append(`alt_texts[${index}]`, imageFile.altText);
    });

    formData.append('primary_image', primaryImageIndex.toString());


    router.post(
      route('product-variant-images.store', variant.id),
      formData,
      {
        onSuccess: () => {
          Swal.fire({
            title: 'Success!',
            text: 'Images uploaded successfully',
            icon: 'success',
            timer: 4000,
            showConfirmButton: false,
          });
        },
        onError: () => toast.error('Failed to upload images'),
      }
    );
  };

  const variantTitle = `${variant.product.name} - ${variant.color?.name || ''} ${variant.size?.name || ''} (${variant.sku})`.trim();

  return (
    <DashboardLayout title={`Add Images - ${variantTitle}`}>
      <div className="max-w-4xl mx-auto">
        <Link
          href={route('product-variant-images.index', variant.id)}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Variant Images
        </Link>
        <h1 className="text-2xl font-bold mb-6">Add Images - {variantTitle}</h1>

        <div className="bg-white rounded-md shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>Select Images</Label>
              <div className="mt-2">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="mb-4"
                />
                <p className="text-sm text-gray-500">
                  Select multiple images (JPEG, PNG, JPG, GIF - max 2MB each)
                </p>
              </div>
            </div>

            {selectedImages.length > 0 && (
              <>
                <div>
                  <Label>Selected Images</Label>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedImages.map((imageFile, index) => (
                      <div key={index} className="relative border rounded-lg p-4">
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <img
                          src={imageFile.preview}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded mb-3"
                        />

                        <div>
                          <Label htmlFor={`alt-${index}`}>Alt Text (Optional)</Label>
                          <Input
                            id={`alt-${index}`}
                            value={imageFile.altText}
                            onChange={(e) => updateAltText(index, e.target.value)}
                            placeholder="Describe this image"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Primary Image</Label>
                  <RadioGroup
                    value={primaryImageIndex.toString()}
                    onValueChange={(value: string) => setPrimaryImageIndex(parseInt(value))}
                    className="mt-2"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedImages.map((imageFile, index) => (
                        <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
                          <RadioGroupItem value={index.toString()} id={`primary-${index}`} />
                          <Label htmlFor={`primary-${index}`} className="flex-1 cursor-pointer">
                            <div className="flex items-center space-x-3">
                              <img
                                src={imageFile.preview}
                                alt="Preview"
                                className="w-12 h-12 object-cover rounded"
                              />
                              <span>Image {index + 1}</span>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                  <p className="text-sm text-gray-500 mt-2">
                    Select which image should be the primary image for this variant
                  </p>
                </div>
              </>
            )}

            <div className="flex justify-end space-x-3">
              <Link href={route('product-variant-images.index', variant.id)}>
                <Button type="button" variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" disabled={processing || selectedImages.length === 0}>
                {processing ? 'Uploading...' : 'Upload Images'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
