import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, Eye } from "lucide-react";
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from 'sweetalert2';

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
  status: string;
  excerpt: string | null;
  featured_image: string | null;
  is_featured: boolean;
  published_at: string | null;
  views_count: number;
  category: PostCategory | null;
  author_name: string | null;
}

interface Props {
  posts: {
    data: Post[];
    links: any;
    meta: any;
  };
}

export default function Index({ posts }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Blog Posts', href: route('blogposts.index') },
  ];

  const { delete: destroy } = useForm();

  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        destroy(route('posts.destroy', id), {
          onSuccess: () => {
            Swal.fire({
              title: 'Deleted!',
              text: 'Your blog post has been deleted.',
              icon: 'success',
              timer: 3000,
              showConfirmButton: false
            });
          }
        });
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout title="Blog Posts">
      <div className="space-y-4 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Blog Posts</h1>
          <Link href={route('blogposts.create')}>
            <Button className="flex items-center gap-2 bg-primary cursor-pointer hover:bg-gray-100 text-black shadow-sm">
              <Plus className="h-4 w-4" />
              Add Post
            </Button>
          </Link>
        </div>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>
      
      <div className="bg-white rounded-md shadow-lg border border-gray-100">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.data.length > 0 ? (
              posts.data.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    {post.featured_image ? (
                      <div className="relative group">
                        <img
                          src={`/storage/${post.featured_image}`}
                          alt={post.title}
                          className="w-12 h-12 object-cover rounded-md transition-all duration-300 group-hover:w-20 group-hover:h-20 group-hover:shadow-lg group-hover:z-20 group-hover:relative"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{post.title}</div>
                      {post.excerpt && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {post.excerpt}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {post.category ? (
                      <Badge variant="outline">{post.category.name}</Badge>
                    ) : (
                      <span className="text-gray-400">No category</span>
                    )}
                  </TableCell>
                  <TableCell>{post.author_name || 'Unknown'}</TableCell>
                  <TableCell>{getStatusBadge(post.status)}</TableCell>
                  <TableCell>
                    {post.is_featured ? (
                      <Badge className="bg-purple-100 text-purple-800">Featured</Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>{post.views_count}</TableCell>
                  <TableCell>
                    {post.published_at ? (
                      <span className="text-sm text-gray-600">
                        {new Date(post.published_at).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-gray-400">Not published</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end space-x-2">
                      <Link href={route('blogposts.show', post.id)}>
                        <Button variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={route('blogposts.edit', post.id)}>
                        <Button variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="cursor-pointer text-red-600 hover:bg-red-50"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                      >
                        <Trash2 className="h-4 w-4 cursor-pointer" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  No blog posts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}