import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash, Edit, Plus } from "lucide-react";
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';

interface Category {
  id: number;
  title: string;
  slug: string;
  status: string;
  photo: string | null;
  subcategories: any[];
}

interface Props {
  categories: Category[];
}

const CategoriesIndex = ({ categories }: Props) => {
  const { delete: destroy } = useForm();

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Categories', href: route('categories.index') },
  ];

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      destroy(route('categories.destroy', id));
    }
  };

  return (
    <DashboardLayout title="Categories">
      <div className="space-y-4">
        <Breadcrumbs breadcrumbs={breadcrumbs} />
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Categories</h1>
          <Link href={route('categories.create')}>
            <Button className="flex items-center gap-2 bg-primary cursor-pointer hover:bg-gray-100 text-black shadow-sm">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-md shadow-lg border border-gray-100">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Subcategories</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  {category.photo ? (
                    <div className="relative group">
                      <img 
                        src={`/storage/${category.photo}`} 
                        alt={category.title}
                        className="w-12 h-12 object-cover rounded-md transition-all duration-300 group-hover:w-20 group-hover:h-20 group-hover:shadow-lg group-hover:z-20 group-hover:relative"                     
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No image</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{category.title}</TableCell>
                <TableCell>{category.slug}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    category.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {category.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell>{category.subcategories.length}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Link href={route('categories.edit', category.id)}>
                      <Button variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash className=" h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  No categories found. Create your first category.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
};

export default CategoriesIndex;
