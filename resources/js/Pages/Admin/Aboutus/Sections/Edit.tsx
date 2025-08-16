import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Upload } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface Props {
  aboutus: { id: number; page_title: string };
  section: {
    id: number;
    section_title: string;
    section_content: any;
    image: string | null;
    order: number;
    status: 'active' | 'inactive';
  };
}

const Edit: React.FC<Props> = ({ aboutus, section }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(section.image ? `/storage/${section.image}` : null);
  const { data, setData, post, processing, errors } = useForm<any>({
    section_title: section.section_title,
    section_content: section.section_content || {},
    image: null,
    order: section.order,
    status: section.status,
    _method: 'PUT',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('aboutus.sections.update', { aboutus: aboutus.id, section: section.id }), { forceFormData: true });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setData('image', file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <DashboardLayout title={`Edit Section - ${aboutus.page_title}`}>
      <Head title={`Edit Section - ${aboutus.page_title}`} />
      <div className="space-y-4 pb-6">
        <div className="flex items-center mb-6">
          <Link href={route('aboutus.sections.index', aboutus.id)} className="mr-4">
            <Button variant="outline" size="sm" className="cursor-pointer">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Edit Section</h1>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Section Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="section_title">Title</Label>
                <Input id="section_title" value={data.section_title} onChange={e => setData('section_title', e.target.value)} />
                {errors.section_title && <p className="text-sm text-red-500">{errors.section_title}</p>}
              </div>
              <div className="space-y-2">
                <Label>Content (JSON)</Label>
                <Textarea
                  rows={10}
                  value={JSON.stringify(data.section_content, null, 2)}
                  onChange={e => {
                    try {
                      const json = JSON.parse(e.target.value || '{}');
                      setData('section_content', json);
                    } catch (err) {
                      // ignore type until valid
                    }
                  }}
                />
                {errors.section_content && <p className="text-sm text-red-500">{errors.section_content}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image (optional)</Label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input type="file" id="image" className="hidden" accept="image/*" onChange={handleImageChange} />
                    <label htmlFor="image" className="cursor-pointer inline-flex items-center gap-2 border rounded-md px-3 py-2">
                      <Upload className="h-4 w-4" /> Upload Image
                    </label>
                    {errors.image && <p className="text-sm text-red-500 mt-1">{errors.image}</p>}
                  </div>
                  {imagePreview && (
                    <div className="w-40 h-24 bg-gray-100 rounded overflow-hidden">
                      <img src={imagePreview} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order">Order</Label>
                  <Input id="order" type="number" value={data.order} onChange={e => setData('order', Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch id="status" checked={data.status === 'active'} onCheckedChange={c => setData('status', c ? 'active' : 'inactive')} />
                    <Label htmlFor="status">Active</Label>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={processing} className="cursor-pointer">Update</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Edit;


