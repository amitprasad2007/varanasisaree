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
}

const Create: React.FC<Props> = ({ aboutus }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { data, setData, post, processing, errors } = useForm<any>({
    aboutus_id: aboutus.id,
    section_title: '',
    section_content: {},
    image: null,
    order: 0,
    status: 'active',
  });

  const [sectionContentInput, setSectionContentInput] = useState<string>(
    JSON.stringify({}, null, 2)
  );
  const [sectionContentError, setSectionContentError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate JSON before submit
    try {
      const parsed = JSON.parse(sectionContentInput || '{}');
      setData('section_content', parsed);
      setSectionContentError(null);
    } catch (err) {
      setSectionContentError('Please enter valid JSON');
      return;
    }
    post(route('aboutus.sections.store'), { forceFormData: true });
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
    <DashboardLayout title={`Add Section - ${aboutus.page_title}`}>
      <Head title={`Add Section - ${aboutus.page_title}`} />
      <div className="space-y-4 pb-6">
        <div className="flex items-center mb-6">
          <Link href={route('aboutus.sections.index', aboutus.id)} className="mr-4">
            <Button variant="outline" size="sm" className="cursor-pointer">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Add Section</h1>
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
                  value={sectionContentInput}
                  onChange={e => {
                    const value = e.target.value;
                    setSectionContentInput(value);
                    try {
                      const parsed = JSON.parse(value || '{}');
                      setData('section_content', parsed);
                      setSectionContentError(null);
                    } catch (err) {
                      setSectionContentError('Invalid JSON');
                    }
                  }}
                />
                {sectionContentError && (
                  <p className="text-sm text-red-500">{sectionContentError}</p>
                )}
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
              <Button type="submit" disabled={processing} className="cursor-pointer">Create</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Create;


