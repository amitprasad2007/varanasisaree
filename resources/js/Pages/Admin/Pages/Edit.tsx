import React from 'react';
import { useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from "sweetalert2";

interface PageType {
  value: string;
  label: string;
}

interface Page {
  id: number;
  title: string;
  slug: string;
  type: string;
  content: string | null;
  metadata: any;
  is_active: boolean;
}

interface Props {
  page: Page;
  pageTypes: PageType[];
}

export default function Edit({ page, pageTypes }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    title: page.title || '',
    slug: page.slug || '',
    type: page.type || 'page',
    content: page.content || '',
    metadata: page.metadata ? JSON.stringify(page.metadata, null, 2) : '',
    is_active: page.is_active || false,
  });

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Pages & Policies', href: route('pages.index') },
    { title: 'Edit Page', href: route('pages.edit', page.id) },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('pages.update', page.id), {
      onSuccess: () => {
        Swal.fire({
          title: 'Success!',
          text: 'Page updated successfully',
          icon: 'success',
          timer: 4000,
          showConfirmButton: false
        });
      }
    });
  };

  return (
    <DashboardLayout title="Edit Page">
      <div className="space-y-4 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Edit Page</h1>
          <Button
            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
        </div>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>

      <div className="bg-white rounded-md shadow-lg border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={data.title}
                onChange={e => setData('title', e.target.value)}
                placeholder="Enter page title"
              />
              {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={data.slug}
                onChange={e => setData('slug', e.target.value)}
                placeholder="Auto-generated from title"
              />
              {errors.slug && <p className="text-sm text-red-600">{errors.slug}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select value={data.type} onValueChange={(value) => setData('type', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && <p className="text-sm text-red-600">{errors.type}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={data.content}
              onChange={e => setData('content', e.target.value)}
              placeholder="Enter page content..."
              rows={10}
            />
            {errors.content && <p className="text-sm text-red-600">{errors.content}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="metadata">Metadata (JSON)</Label>
            <Textarea
              id="metadata"
              value={data.metadata}
              onChange={e => setData('metadata', e.target.value)}
              placeholder='{"key": "value"}'
              rows={4}
            />
            <p className="text-sm text-gray-500">Optional: Enter metadata as JSON format</p>
            {errors.metadata && <p className="text-sm text-red-600">{errors.metadata}</p>}
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

          <Button 
            variant="outline" 
            type="submit" 
            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" 
            disabled={processing}
          >
            Update Page
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}