import React from 'react';
import { useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from "sweetalert2";

type CheckedState = boolean | "indeterminate";

const CategoryCreate = () => {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        slug:'',
        summary: '',
        photo: null as File | null,
        status: true as CheckedState,
    });

    const [preview, setPreview] = React.useState<string | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Categories', href: route('categories.index') },
        { title: 'Create Category', href: route('categories.create') },
    ];

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('categories.store'), {
            onSuccess: () => {
                Swal.fire({
                    title: 'Success!',
                    text: 'Category created successfully',
                    icon: 'success',
                    timer: 4000,
                    showConfirmButton: false
                });
            }
        });
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('photo', file);

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    };

    return (
        <DashboardLayout title="Create Category">
            <div className="space-y-4 pb-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Create Category</h1>
                    <Button
                        variant="outline"
                        onClick={() => window.history.back()}
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        Cancel
                    </Button>
                </div>
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="bg-white rounded-md shadow-lg border border-gray-100 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={e => setData('title', e.target.value)}
                        />
                        {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                            id="slug"
                            value={data.slug}
                            onChange={e => setData('slug', e.target.value)}
                        />
                        {errors.slug && <p className="text-sm text-red-600">{errors.slug}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="summary">Description</Label>
                        <Textarea
                            id="summary"
                            value={data.summary}
                            onChange={e => setData('summary', e.target.value)}
                        />
                        {errors.summary && <p className="text-sm text-red-600">{errors.summary}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="photo">Photo</Label>
                        <div className="space-y-4">
                            <Input
                                id="photo"
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                            />
                            {preview && (
                                <div className="relative group">
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="w-32 h-32 object-cover rounded-md transition-all duration-300 group-hover:w-40 group-hover:h-40 group-hover:shadow-lg group-hover:z-20 group-hover:relative"
                                    />
                                </div>
                            )}
                        </div>
                        {errors.photo && <p className="text-sm text-red-600">{errors.photo}</p>}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Label htmlFor="status">Status</Label>
                        <Checkbox
                            id="status"
                            checked={data.status}
                            onCheckedChange={(checked) => setData('status', checked)}
                        />
                        <label
                            htmlFor="status"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Active
                        </label>
                    </div>

                    <Button variant="outline" type="submit" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" disabled={processing}>
                        Create Category
                    </Button>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default CategoryCreate;
