import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';

type FormData = {
  name: string;
  slug: string;
  description: string;
  banner_image: string;
  thumbnail_image: string;
  seo_title: string;
  seo_description: string;
  sort_order: number;
  is_active: boolean;
};

const Edit = ({ type }: any) => {
  const { data, setData, put, processing, errors } = useForm<FormData>({
    name: type.name || '', slug: type.slug || '', description: type.description || '', banner_image: type.banner_image || '', thumbnail_image: type.thumbnail_image || '', seo_title: type.seo_title || '', seo_description: type.seo_description || '', sort_order: type.sort_order || 0, is_active: Boolean(type.is_active),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('collection-types.update', type.id));
  };

  return (
    <DashboardLayout title="Edit Collection Type">
      <Head title="Edit Collection Type" />
      <form onSubmit={submit} className="space-y-4 bg-white p-6 rounded-md shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input className="form-input" value={data.name} onChange={e => setData('name', e.target.value)} />
            {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Slug</label>
            <input className="form-input" value={data.slug} onChange={e => setData('slug', e.target.value)} />
            {errors.slug && <p className="text-red-600 text-sm">{errors.slug}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium">Description</label>
            <textarea className="form-textarea" value={data.description} onChange={e => setData('description', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">Banner Image (path/url)</label>
            <input className="form-input" value={data.banner_image} onChange={e => setData('banner_image', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">Thumbnail Image (path/url)</label>
            <input className="form-input" value={data.thumbnail_image} onChange={e => setData('thumbnail_image', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">SEO Title</label>
            <input className="form-input" value={data.seo_title} onChange={e => setData('seo_title', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">SEO Description</label>
            <textarea className="form-textarea" value={data.seo_description} onChange={e => setData('seo_description', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">Sort Order</label>
            <input type="number" className="form-input" value={data.sort_order} onChange={e => setData('sort_order', Number(e.target.value))} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} />
            <span>Active</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={processing} className="bg-primary cursor-pointer hover:bg-gray-100 text-black shadow-sm">Update</Button>
          <Link href={route('collection-types.index')}>
            <Button type="button" variant="outline" className="cursor-pointer">Cancel</Button>
          </Link>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default Edit;


