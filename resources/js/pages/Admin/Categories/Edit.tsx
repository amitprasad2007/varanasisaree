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

interface Category {
    id: number;
    title: string;
    slug: string;
    summary: string;
    status: string;
    photo: string | null;
    subcategories: any[];
}

interface Props {
    category: Category;
}

const CategoryEdit = ({ category }: Props) => {
    const { data, setData, post, processing, errors } = useForm({
        title: category.title || '',
        slug: category.slug || '',
        summary: category.summary || '',
        status: category.status === 'active' || false,
        photo: null as File | null,
    });

    const [preview, setPreview] = React.useState<string | null>(category.photo ? `/storage/${category.photo}` : null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('categories.update', category.id));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Categories', href: route('categories.index') },
        { title: 'Edit Category', href: route('categories.edit', category.id) },
    ];
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
        <DashboardLayout title="Edit Category">
             <div className="space-y-4">
            <Breadcrumbs breadcrumbs={breadcrumbs} />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Edit Category</h1>
                <Button
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                    variant="outline"
                    onClick={() => window.history.back()}
                >
                    Cancel
                </Button>
            </div>
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
                            id="description"
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
                        <Checkbox
                            id="status"
                            checked={data.status}
                            onCheckedChange={(checked: boolean) => setData('status', checked)}
                        />
                        <label
                            htmlFor="status"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Active
                        </label>
                    </div>

                    <Button variant="outline" type="submit" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" disabled={processing}>
                        Update Category
                    </Button>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default CategoryEdit;
