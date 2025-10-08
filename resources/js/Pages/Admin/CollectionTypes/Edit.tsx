import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
    slug:collectionType.slug,
    description: collectionType.description || '',
    banner_image: null as File | null,
    thumbnail_image: null as File | null,
    seo_title: collectionType.seo_title || '',
    seo_description: collectionType.seo_description || '',
    meta: collectionType.meta ? JSON.stringify(collectionType.meta) : '',
    sort_order: collectionType.sort_order,
    is_active: collectionType.is_active,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Laravel does not parse multipart bodies for PUT/PATCH. Use POST + _method spoofing.
    transform((current) => ({ ...current, _method: 'put' }));
    post(route('collection-types.update', collectionType.id), { forceFormData: true });
  };

  return (
    <DashboardLayout title="Edit Collections Types">
      <Head title="Edit Collection Type" />
      
      <div className="p-6">
        <div className="mb-6">
          <Link href={route('collection-types.index')}>
            <Button variant="outline">← Back to Collection Types</Button>
          </Link>
        </div>

        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold mb-6">Edit Collection Type</h1>

          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                value={data.name}
                onChange={(e) => {setData('name', e.target.value); setData('slug', e.target.value); }}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="banner_image">Banner Image</Label>
              <Input
                id="banner_image"
                type="file"
                onChange={(e) => {
                  const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                  setData('banner_image', file);
                }}
              />
              {errors.banner_image && <p className="text-red-500 text-sm mt-1">{errors.banner_image}</p>}
            </div>

            <div>
              <Label htmlFor="thumbnail_image">Thumbnail Image</Label>
              <Input
                id="thumbnail_image"
                type="file"
                onChange={(e) => {
                  const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                  setData('thumbnail_image', file);
                }}
              />
              {errors.thumbnail_image && <p className="text-red-500 text-sm mt-1">{errors.thumbnail_image}</p>}
            </div>

            <div>
              <Label htmlFor="seo_title">SEO Title</Label>
              <Input
                id="seo_title"
                value={data.seo_title}
                onChange={(e) => setData('seo_title', e.target.value)}
                placeholder="SEO title"
              />
              {errors.seo_title && <p className="text-red-500 text-sm mt-1">{errors.seo_title}</p>}
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
              {errors.seo_description && <p className="text-red-500 text-sm mt-1">{errors.seo_description}</p>}
            </div>

            <div>
              <Label htmlFor="meta">Meta (JSON)</Label>
              <Textarea
                id="meta"
                value={data.meta}
                onChange={(e) => setData('meta', e.target.value)}
                rows={4}
                placeholder='{"key":"value"}'
              />
              {errors.meta && <p className="text-red-500 text-sm mt-1">{errors.meta}</p>}
            </div>

            <div>
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input
                id="sort_order"
                type="number"
                value={data.sort_order}
                onChange={(e) => setData('sort_order', Number(e.target.value))}
              />
              {errors.sort_order && <p className="text-red-500 text-sm mt-1">{errors.sort_order}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={!!data.is_active}
                onCheckedChange={(checked) => setData('is_active', checked)}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={processing}>
                Update Collection Type
              </Button>
              <Link href={route('collection-types.index')}>
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}