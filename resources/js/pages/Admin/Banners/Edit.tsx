import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Upload } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { router } from '@inertiajs/react';

interface Banner {
  id: number;
  title: string | null;
  image: string;
  description: string | null;
  link: string | null;
  status: 'active' | 'inactive';
  order: number;
}

interface Props {
  banner: Banner;
}

interface FormData {
  title: string;
  image: File | null;
  description: string;
  link: string;
  status: string;
  _method: string;
  [key: string]: any;
}

const Edit = ({ banner }: Props) => {
  const [imagePreview, setImagePreview] = useState<string | null>(`/storage/${banner.image}`);
  
  const { data, setData, post, processing, errors } = useForm<FormData>({
    title: banner.title || '',
    image: null,
    description: banner.description || '',
    link: banner.link || '',
    status: banner.status,
    _method: 'PUT'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert form data to FormData for file upload
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.image) {
      formData.append('image', data.image);
    }
    formData.append('description', data.description);
    formData.append('link', data.link);
    formData.append('status', data.status);
    formData.append('_method', 'PUT');

    post(route('banners.update', banner.id), {
      data: formData,
      forceFormData: true,
      onSuccess: () => {
        // Handle success if needed
      }
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setData('image', file);
      
      // Create a preview of the image
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <DashboardLayout title="Edit Banner">
      <Head title="Edit Banner" />
      
      <div className="flex items-center mb-6">
        <Link href={route('banners.index')} className="mr-4">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Banners
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">Edit Banner</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Banner Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                  id="title"
                  value={data.title}
                  onChange={e => setData('title', e.target.value)}
                  placeholder="Enter banner title"
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Banner Image</Label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        id="image"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <label 
                        htmlFor="image" 
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm font-medium mb-1">Replace Image</span>
                        <span className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</span>
                      </label>
                    </div>
                    {errors.image && (
                      <p className="text-sm text-red-500 mt-1">{errors.image}</p>
                    )}
                  </div>
                  
                  {imagePreview && (
                    <div className="w-40">
                      <div className="aspect-video rounded-md overflow-hidden bg-gray-100">
                        <img 
                          src={imagePreview} 
                          alt="Banner preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={e => setData('description', e.target.value)}
                  placeholder="Enter banner description"
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="link">Link URL (Optional)</Label>
                <Input
                  id="link"
                  type="url"
                  value={data.link}
                  onChange={e => setData('link', e.target.value)}
                  placeholder="https://example.com/page"
                />
                {errors.link && (
                  <p className="text-sm text-red-500">{errors.link}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="status"
                    checked={data.status === 'active'}
                    onCheckedChange={checked => setData('status', checked ? 'active' : 'inactive')}
                  />
                  <Label htmlFor="status">Active</Label>
                </div>
                <p className="text-sm text-gray-500">
                  Toggle to make this banner visible on the frontend
                </p>
                {errors.status && (
                  <p className="text-sm text-red-500">{errors.status}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={processing}
              >
                Update Banner
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Edit;
