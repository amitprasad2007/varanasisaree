import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash, Edit, Plus,Trash2 } from "lucide-react";
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from 'sweetalert2';

interface Subcategory {
    id: number;
    title: string;
    slug: string;
    status: string;
    photo: string | null;
    parent: {title:string};

  }

interface SubcategoriesIndexProps {
  subcategories: Subcategory[];
}

const SubcategoriesIndex = ({ subcategories }: SubcategoriesIndexProps) => {
    const { delete: destroy } = useForm();
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Categories', href: route('categories.index') },
        { title: 'SubCategories', href: route('subcatindex') },
      ];

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
              destroy(route('subcategories.destroy', id), {
                onSuccess: () => {
                  Swal.fire({
                    title: 'Deleted!',
                    text: 'Your Subcategory has been deleted.',
                    icon: 'success',
                    timer: 3000,
                    showConfirmButton: false
                  });
                }
              });
            }
          });
    };
    function showimage(image: string) {
        if(image.startsWith('http')){
            return image
        }
        return "/storage/"+image
    }
        
    return (
        <DashboardLayout title="Subcategories">
            <div className="space-y-4 pb-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Subcategories</h1>
                    <Link href={route('subcategories.create')}>
                        <Button className="flex items-center gap-2 bg-primary cursor-pointer hover:bg-gray-100 text-black shadow-sm">
                            <Plus className="h-4 w-4" />
                            Add Subcategory
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
                            <TableHead>Name</TableHead>
                            <TableHead>Parent Category</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {subcategories.map((subcategory) => (
                            <TableRow key={subcategory.id}>
                                <TableCell>
                                    {subcategory.photo ? (
                                        <div className="relative group">
                                        <img
                                            src={showimage(subcategory.photo)}
                                            alt={subcategory.title}
                                            className="w-12 h-12 object-cover rounded-md transition-all duration-300 group-hover:w-20 group-hover:h-20 group-hover:shadow-lg group-hover:z-20 group-hover:relative"
                                        />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                                        <span className="text-gray-400 text-xs">No image</span>
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="font-medium">{subcategory.title}</TableCell>
                                <TableCell>{subcategory.parent.title}</TableCell>
                                <TableCell>{subcategory.slug}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        subcategory.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {subcategory.status === 'active' ? 'Active' : 'Inactive'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end space-x-2">
                                        <Link href={route('subcategories.edit', subcategory.id)}>
                                            <Button variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" size="sm">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            className="cursor-pointer text-red-600 hover:bg-red-50"
                                            size="sm"
                                            onClick={() => handleDelete(subcategory.id)}
                                        >
                                       <Trash2 className="h-4 w-4 cursor-pointer" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {subcategories.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                                    No subcategories found. Create your first subcategory.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </DashboardLayout>
    );
};

export default SubcategoriesIndex;
