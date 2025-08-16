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

interface AboutUs {
  id: number;
  page_title: string;
  description: string | null;
  image: string | null;
  status: 'active' | 'inactive';
}

interface Props {
  aboutus: AboutUs;
}

const Edit: React.FC<Props> = ({ aboutus }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(aboutus.image ? `/storage/${aboutus.image}` : null);
  const { data, setData, post, processing, errors } = useForm<any>({
    page_title: aboutus.page_title,
    description: aboutus.description || '',
    image: null,
    status: aboutus.status,
    _method: 'PUT',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('aboutus.update', aboutus.id), { forceFormData: true });
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
    <DashboardLayout title="Edit About Us">
      <Head title="Edit About Us" />
      <div className="space-y-4 pb-6">
        <div className="flex items-center mb-6">
          <Link href={route('aboutus.index')} className="mr-4">
            <Button variant="outline" size="sm" className="cursor-pointer">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Edit About Us</h1>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>About Us Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="page_title">Page Title</Label>
                <Input id="page_title" value={data.page_title} onChange={e => setData('page_title', e.target.value)} />
                {errors.page_title && <p className="text-sm text-red-500">{errors.page_title}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={4} value={data.description} onChange={e => setData('description', e.target.value)} />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input type="file" id="image" className="hidden" accept="image/*" onChange={handleImageChange} />
                    <label htmlFor="image" className="cursor-pointer inline-flex items-center gap-2 border rounded-md px-3 py-2">
                      <Upload className="h-4 w-4" /> Replace Image
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
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Switch id="status" checked={data.status === 'active'} onCheckedChange={c => setData('status', c ? 'active' : 'inactive')} />
                  <Label htmlFor="status">Active</Label>
                </div>
                {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
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


