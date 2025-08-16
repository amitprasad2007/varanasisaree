import React, { useState, useRef, ChangeEvent, DragEvent, FormEvent } from 'react';
import { Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from "sweetalert2";
import { ArrowLeft, Upload, X, Image } from 'lucide-react';



interface Product {
    id: number;
    name: string;
}

interface Props {
    product: Product;
}

export default function Create({ product }: Props) {
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, setData, post, processing, errors, reset, clearErrors } = useForm<{
    images: File[];
    alt_text: string;
    is_primary: boolean;
  }>({
    images: [],
    alt_text: '',
    is_primary: false,
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    setData('images', files);
    clearErrors('images');

    // Generate previews
    const newPreviews: string[] = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newPreviews.push(e.target.result as string);
          if (newPreviews.length === files.length) {
            setPreviews(newPreviews);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newFiles = [...data.images];
    newFiles.splice(index, 1);

    const newPreviews = [...previews];
    newPreviews.splice(index, 1);

    setData('images', newFiles);
    setPreviews(newPreviews);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);

    if (files.length === 0) return;

    setData('images', files);
    clearErrors('images');

    // Generate previews
    const newPreviews: string[] = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newPreviews.push(e.target.result as string);
          if (newPreviews.length === files.length) {
            setPreviews(newPreviews);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    data.images.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });
    formData.append('alt_text', data.alt_text);
    formData.append('is_primary', data.is_primary ? '1' : '0');

    post(route('product-images.store', product.id), {
        method: 'post',
        ...Object.fromEntries(formData),
        onSuccess: () => {
        Swal.fire({
            title: 'Success!',
            text: 'Images added successfully',
            icon: 'success',
            timer: 4000,
            showConfirmButton: false
            });
        }
    });
  };
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Product', href: route('products.index') },
    { title: 'Show Product', href: route('products.show', product.id) },
    { title: 'Product Image', href: route('product-images.index', product.id) },
    { title: 'Add Image', href: route('product-images.create', product.id) },
  ];

  return (
    <DashboardLayout title={`${product.name} - Add Images`}>
      <div className="space-y-6">
      <div className="space-y-4 pb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Upload Images</h1>
            <p className="text-muted-foreground">
              Add images for {product.name}
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href={route('product-images.index', product.id)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Images
            </Link>
          </Button>
        </div>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>

        <div className="bg-white rounded-md shadow-lg border border-gray-400 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <div
                className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <div className="flex flex-col items-center justify-center gap-2">
                  <Upload className="h-10 w-10 text-gray-400" />
                  <h3 className="text-lg font-medium">Drag & drop image files</h3>
                  <p className="text-muted-foreground">
                    or click to browse (JPG, PNG, GIF up to 2MB)
                  </p>
                  <Button type="button" variant="outline" className="mt-2">
                    Select Files
                  </Button>
                </div>
              </div>

              {errors.images && (
                <div className="text-sm text-red-500">
                  {errors.images}
                </div>
              )}

              {previews.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Selected Images</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {previews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <div className="relative aspect-square overflow-hidden rounded-md border bg-gray-50">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="h-full w-full object-cover transition-all group-hover:scale-105"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="alt_text">Alt Text</Label>
                  <Input
                    id="alt_text"
                    value={data.alt_text}
                    onChange={(e) => setData('alt_text', e.target.value)}
                    placeholder="Describe the image for accessibility"
                  />
                  <p className="text-sm text-muted-foreground">
                    Helps with accessibility and SEO
                  </p>
                  {errors.alt_text && (
                    <p className="text-sm text-red-500">{errors.alt_text}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_primary"
                    checked={data.is_primary}
                    onCheckedChange={(checked) => setData('is_primary', Boolean(checked))}
                  />
                  <Label htmlFor="is_primary">Set as primary image</Label>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="outline"
                  disabled={processing || data.images.length === 0}
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {processing ? 'Uploading...' : 'Upload Images'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}