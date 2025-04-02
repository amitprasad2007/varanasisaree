import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/Components/ui/table";
import { Button } from "@/Components/ui/button";
import { Trash, Edit, Plus } from "lucide-react";

const SubcategoriesIndex = ({ subcategories }) => {
    const { delete: destroy } = useForm();

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this subcategory?')) {
            destroy(route('subcategories.destroy', id));
        }
    };

    return (
        <DashboardLayout title="Subcategories">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Subcategories</h1>
                <Link href={route('subcategories.create')}>
                    <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Subcategory
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-md shadow">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {subcategories.map((subcategory) => (
                            <TableRow key={subcategory.id}>
                                <TableCell className="font-medium">{subcategory.name}</TableCell>
                                <TableCell>{subcategory.category.name}</TableCell>
                                <TableCell>{subcategory.slug}</TableCell>
                                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      subcategory.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {subcategory.is_active ? 'Active' : 'Inactive'}
                  </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end space-x-2">
                                        <Link href={route('subcategories.edit', subcategory.id)}>
                                            <Button variant="outline" size="sm">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(subcategory.id)}
                                        >
                                            <Trash className="h-4 w-4" />
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
