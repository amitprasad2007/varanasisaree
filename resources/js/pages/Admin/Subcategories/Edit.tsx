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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Subcategory {
    id: number;
    title: string;
    slug: string;
    status: string;
    photo: string | null;
    parent: { title: string; id: number };
    parent_id?: number;
    summary: string;
    is_active: boolean;
    category_id: number;
}

interface Category {
    id: number;
    title: string;
}

interface SubcategoryEditProps {
    subcategory: Subcategory;
    categories: Category[];
}

const SubcategoryEdit: React.FC<SubcategoryEditProps> = ({ subcategory, categories }) => {
    const { data, setData, post, processing, errors } = useForm({
        category_id: subcategory.category_id || '',
        title: subcategory.title || '',
        slug: subcategory.slug || '',
        summary: subcategory.summary || '',
        status: subcategory.status === 'active' || false,
        photo: null as File | null,
        parent_id: subcategory.parent?.id.toString() || '',
    });
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Categories', href: route('categories.index') },
        { title: 'SubCategories', href: route('subcatindex') },
        { title: 'Edit Subcategory', href: route('subcategories.edit', subcategory.id) },
    ];
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('subcategories.update', subcategory.id));
    };
    const [preview, setPreview] = React.useState<string | null>(subcategory.photo ? `/storage/${subcategory.photo}` : null);
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
        <DashboardLayout title="Edit Subcategory">
              <div className="space-y-4 pb-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Edit Subcategory</h1>
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

            <div className="bg-white rounded-md shadow p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="parent_id">Category</Label>
                        <Select
                            value={data.parent_id}
                            onValueChange={value => setData('parent_id', value)}
                        >
                            <SelectTrigger className="bg-white border border-gray-300 rounded-md shadow-sm">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                                {categories.map(category => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                        {category.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.category_id && <p className="text-sm text-red-600">{errors.category_id}</p>}
                    </div>

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
                        Update Subcategory
                    </Button>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default SubcategoryEdit;
