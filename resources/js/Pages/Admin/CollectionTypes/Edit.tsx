import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from 'sweetalert2';

interface CollectionType {
  id: number;
  name: string;
  slug:string,
  description?: string;
  banner_image?: string;
  thumbnail_image?: string;
  seo_title?: string;
  seo_description?: string;
  meta?: Record<string, any> | null;
  sort_order: number;
  is_active: boolean;
}

interface Props {
  collectionType: CollectionType;
}

export default function Edit({ collectionType }: Props) {
  const { data, setData, post, transform, processing, errors } = useForm({
    name: collectionType.name,
    slug: collectionType.slug,
    description: collectionType.description || '',
    banner_image: null as File | null,
    thumbnail_image: null as File | null,
    seo_title: collectionType.seo_title || '',
    seo_description: collectionType.seo_description || '',
    sort_order: collectionType.sort_order,
    is_active: collectionType.is_active,
  });

  const [bannerPreview, setBannerPreview] = React.useState<string | null>(
    collectionType.banner_image ? `/storage/${collectionType.banner_image}` : null
  );
  const [thumbnailPreview, setThumbnailPreview] = React.useState<string | null>(
    collectionType.thumbnail_image ? `/storage/${collectionType.thumbnail_image}` : null
  );

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Collection Types', href: route('collection-types.index') },
    { title: 'Edit Collection Type', href: route('collection-types.edit', collectionType.id) },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    transform((current) => ({ ...current, _method: 'put' }));
    post(route('collection-types.update', collectionType.id), {
      forceFormData: true,
      onSuccess: () => {
        Swal.fire({
          title: 'Success!',
          text: 'Collection type updated successfully',
          icon: 'success',
          timer: 4000,
          showConfirmButton: false
        });
      }
    });
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setData('banner_image', file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setData('thumbnail_image', file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <DashboardLayout title="Edit Collection Type">
      <Head title="Edit Collection Type" />
      
      <div className="space-y-4 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Edit Collection Type</h1>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Cancel
          </Button>
        </div>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>

      <div className="bg-white rounded-md shadow-lg border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={data.slug}
                onChange={(e) => setData('slug', e.target.value)}
              />
              {errors.slug && <p className="text-sm text-red-600">{errors.slug}</p>}
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                rows={4}
              />
              {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
            </div>

            <div>
              <Label htmlFor="banner_image">Banner Image</Label>
              <div className="space-y-4">
                <Input
                  id="banner_image"
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                />
                {bannerPreview && (
                  <div className="relative group">
                    <img
                      src={bannerPreview}
                      alt="Banner Preview"
                      className="w-32 h-32 object-cover rounded-md transition-all duration-300 group-hover:w-40 group-hover:h-40 group-hover:shadow-lg group-hover:z-20 group-hover:relative"
                    />
                  </div>
                )}
              </div>
              {errors.banner_image && <p className="text-sm text-red-600">{errors.banner_image}</p>}
            </div>

            <div>
              <Label htmlFor="thumbnail_image">Thumbnail Image</Label>
              <div className="space-y-4">
                <Input
                  id="thumbnail_image"
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                />
                {thumbnailPreview && (
                  <div className="relative group">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail Preview"
                      className="w-32 h-32 object-cover rounded-md transition-all duration-300 group-hover:w-40 group-hover:h-40 group-hover:shadow-lg group-hover:z-20 group-hover:relative"
                    />
                  </div>
                )}
              </div>
              {errors.thumbnail_image && <p className="text-sm text-red-600">{errors.thumbnail_image}</p>}
            </div>

            <div>
              <Label htmlFor="seo_title">SEO Title</Label>
              <Input
                id="seo_title"
                value={data.seo_title}
                onChange={(e) => setData('seo_title', e.target.value)}
                placeholder="SEO title"
              />
              {errors.seo_title && <p className="text-sm text-red-600">{errors.seo_title}</p>}
            </div>

            <div>
              <Label htmlFor="seo_description">SEO Description</Label>
              <Textarea
                id="seo_description"
                value={data.seo_description}
                onChange={(e) => setData('seo_description', e.target.value)}
                rows={3}
                placeholder="Short SEO description"
              />
              {errors.seo_description && <p className="text-sm text-red-600">{errors.seo_description}</p>}
            </div>

            <div>
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input
                id="sort_order"
                type="number"
                value={data.sort_order}
                onChange={(e) => setData('sort_order', Number(e.target.value))}
              />
              {errors.sort_order && <p className="text-sm text-red-600">{errors.sort_order}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={data.is_active}
                onCheckedChange={(checked: boolean) => setData('is_active', checked)}
              />
              <label
                htmlFor="is_active"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Active
              </label>
            </div>

            <Button variant="outline" type="submit" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" disabled={processing}>
              Update Collection Type
            </Button>
          </form>
      </div>
    </DashboardLayout>
  );
}