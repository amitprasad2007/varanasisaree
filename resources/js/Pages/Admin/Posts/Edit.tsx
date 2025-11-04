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

interface PostCategory {
  id: number;
  name: string;
  slug: string;
  status: string;
}

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  author_name: string | null;
  category_id: number | null;
  status: string;
  featured_image: string | null;
  fallback_image: string | null;
  is_featured: boolean;
  category: PostCategory | null;
}

interface Props {
  post: Post;
  categories: PostCategory[];
}

export default function Edit({ post, categories }: Props) {
  const { data, setData, post: submitPost, processing, errors } = useForm({
    title: post.title || '',
    slug: post.slug || '',
    content: post.content || '',
    excerpt: post.excerpt || '',
    author_name: post.author_name || '',
    category_id: post.category_id?.toString() || '',
    status: post.status || 'draft',
    featured_image: null as File | null,
    fallback_image: null as File | null,
    is_featured: post.is_featured || false,
  });

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Blog Posts', href: route('posts.index') },
    { title: 'Edit Post', href: route('posts.edit', post.id) },
  ];

  const [featuredPreview, setFeaturedPreview] = React.useState<string | null>(
    post.featured_image ? `/storage/${post.featured_image}` : null
  );
  const [fallbackPreview, setFallbackPreview] = React.useState<string | null>(
    post.fallback_image ? `/storage/${post.fallback_image}` : null
  );

  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setData('featured_image', file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFeaturedPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFeaturedPreview(post.featured_image ? `/storage/${post.featured_image}` : null);
    }
  };

  const handleFallbackImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setData('fallback_image', file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFallbackPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFallbackPreview(post.fallback_image ? `/storage/${post.fallback_image}` : null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitPost(route('posts.update', post.id), {
      onSuccess: () => {
        Swal.fire({
          title: 'Success!',
          text: 'Blog post updated successfully',
          icon: 'success',
          timer: 4000,
          showConfirmButton: false
        });
      }
    });
  };

  return (
    <DashboardLayout title="Edit Blog Post">
      <div className="space-y-4 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Edit Blog Post</h1>
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
                placeholder="Enter post title"
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
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={data.excerpt}
              onChange={e => setData('excerpt', e.target.value)}
              placeholder="Brief description of the post"
              rows={3}
            />
            {errors.excerpt && <p className="text-sm text-red-600">{errors.excerpt}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={data.content}
              onChange={e => setData('content', e.target.value)}
              placeholder="Write your blog post content here..."
              rows={10}
            />
            {errors.content && <p className="text-sm text-red-600">{errors.content}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="author_name">Author Name</Label>
              <Input
                id="author_name"
                value={data.author_name}
                onChange={e => setData('author_name', e.target.value)}
                placeholder="Enter author name"
              />
              {errors.author_name && <p className="text-sm text-red-600">{errors.author_name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && <p className="text-sm text-red-600">{errors.category_id}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={data.status} onValueChange={(value) => setData('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="featured_image">Featured Image</Label>
              <div className="space-y-4">
                <Input
                  id="featured_image"
                  type="file"
                  accept="image/*"
                  onChange={handleFeaturedImageChange}
                />
                {featuredPreview && (
                  <div className="relative group">
                    <img
                      src={featuredPreview}
                      alt="Featured Preview"
                      className="w-32 h-32 object-cover rounded-md transition-all duration-300 group-hover:w-40 group-hover:h-40 group-hover:shadow-lg group-hover:z-20 group-hover:relative"
                    />
                  </div>
                )}
              </div>
              {errors.featured_image && <p className="text-sm text-red-600">{errors.featured_image}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fallback_image">Fallback Image</Label>
              <div className="space-y-4">
                <Input
                  id="fallback_image"
                  type="file"
                  accept="image/*"
                  onChange={handleFallbackImageChange}
                />
                {fallbackPreview && (
                  <div className="relative group">
                    <img
                      src={fallbackPreview}
                      alt="Fallback Preview"
                      className="w-32 h-32 object-cover rounded-md transition-all duration-300 group-hover:w-40 group-hover:h-40 group-hover:shadow-lg group-hover:z-20 group-hover:relative"
                    />
                  </div>
                )}
              </div>
              {errors.fallback_image && <p className="text-sm text-red-600">{errors.fallback_image}</p>}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_featured"
              checked={data.is_featured}
              onCheckedChange={(checked: boolean) => setData('is_featured', checked)}
            />
            <label
              htmlFor="is_featured"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Featured Post
            </label>
          </div>

          <Button 
            variant="outline" 
            type="submit" 
            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" 
            disabled={processing}
          >
            Update Blog Post
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}