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
  icon?: string;
}

interface Props {
  collectionTypes?: CollectionType[];
}


export default function Create({ collectionTypes = [] }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
    collection_type_id: '',
    banner_image: null as File | null,
    thumbnail_image: null as File | null,
    seo_title: '',
    seo_description: '',
    meta: '', // JSON string or left empty
    sort_order: 0,
    is_active: true as boolean,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post( route('collections.store'), { forceFormData: true });

  };

  return (
    <DashboardLayout title="Create Collections">
      <Head title="Create Collection" />

      <div className="p-6">
        <div className="mb-6">
          <Link href={route('collections.index')}>
            <Button variant="outline">← Back to Collections</Button>
          </Link>
        </div>

        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold mb-6">Create Collection</h1>

          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
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
            <Label htmlFor="collection_type_id">Collection Type *</Label>
              <Select
                value={data.collection_type_id}
                onValueChange={(value) => setData('collection_type_id', value)}
              >
                <SelectTrigger className={errors.collection_type_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select a collection type" />
                </SelectTrigger>
                <SelectContent>
                  {collectionTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.icon && <span className="mr-2">{type.icon}</span>}
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.collection_type_id && (
                <p className="text-red-500 text-sm mt-1">{errors.collection_type_id}</p>
              )}
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
                Create Collection
              </Button>
              <Link href={route('collections.index')}>
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
