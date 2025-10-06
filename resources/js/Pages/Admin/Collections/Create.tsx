import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
type FormData = {
  collection_type_id: string;
  name: string;
  slug: string;
  description: string;
  banner_image: string;
  thumbnail_image: string;
  seo_title: string;
  seo_description: string;
  sort_order: number;
  is_active: boolean;
  product_ids: number[];
};

const Create = ({ types, products }: any) => {
  const { data, setData, post, processing, errors } = useForm<FormData>({
    collection_type_id: '', name: '', slug: '', description: '', banner_image: '', thumbnail_image: '', seo_title: '', seo_description: '', sort_order: 0, is_active: true, product_ids: [],
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('collections.store'));
  };

  return (
    <DashboardLayout title="Create Collection">
      <Head title="Create Collection" />
      <form onSubmit={submit} className="space-y-4 bg-white p-6 rounded-md shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Type</label>
            <select className="form-select" value={data.collection_type_id} onChange={e => setData('collection_type_id', e.target.value)}>
              <option value="">Select Type</option>
              {types.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {errors.collection_type_id && <p className="text-red-600 text-sm">{errors.collection_type_id}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Name</label>
            <Input className="form-input" value={data.name} onChange={e => setData('name', e.target.value)} />
            {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Slug</label>
            <Input className="form-input" value={data.slug} onChange={e => setData('slug', e.target.value)} />
            {errors.slug && <p className="text-red-600 text-sm">{errors.slug}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium">Description</label>
            <Textarea className="form-textarea" value={data.description} onChange={e => setData('description', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">Banner Image (path/url)</label>
            <Input className="form-input" value={data.banner_image} onChange={e => setData('banner_image', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">Thumbnail Image (path/url)</label>
            <Input className="form-input" value={data.thumbnail_image} onChange={e => setData('thumbnail_image', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">SEO Title</label>
            <Input className="form-input" value={data.seo_title} onChange={e => setData('seo_title', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">SEO Description</label>
            <Textarea className="form-textarea" value={data.seo_description} onChange={e => setData('seo_description', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">Sort Order</label>
            <Input type="number" className="form-input" value={data.sort_order} onChange={e => setData('sort_order', Number(e.target.value))} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="is_active" checked={data.is_active} onCheckedChange={(checked) => setData('is_active', checked as boolean)} />
            <label htmlFor="is_active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Active</label>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Products</label>
            <select multiple className="form-select min-h-40" value={data.product_ids as any}
                    onChange={(e) => {
                      const options = Array.from((e.target as HTMLSelectElement).selectedOptions).map(o => Number(o.value));
                      setData('product_ids', options);
                    }}>
              {products?.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {errors.product_ids && <p className="text-red-600 text-sm">{errors.product_ids}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={processing} className="bg-primary cursor-pointer hover:bg-gray-100 text-black shadow-sm">Save</Button>
          <Link href={route('collections.index')}>
            <Button type="button" variant="outline" className="cursor-pointer">Cancel</Button>
          </Link>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default Create;


