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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Category {
    id: number;
    title: string;
    status: boolean;
}

interface SubcategoryCreateProps {
    categories: Category[];
}
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Categories', href: route('categories.index') },
    { title: 'SubCategories', href: route('subcatindex') },
    { title: 'Create SubCategory', href: route('subcategories.create') },
];

type CheckedState = boolean | "indeterminate";

const SubcategoryCreate: React.FC<SubcategoryCreateProps> = ({ categories }) => {
    const { data, setData, post, processing, errors } = useForm({
        parent_id: '',
        title: '',
        slug: '',
        description: '',
        summary: '',
        photo: null as File | null,
        status: true as CheckedState,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('subcategories.store'), {
            onSuccess: () => {
                Swal.fire({
                    title: 'Success!',
                    text: 'SubCategory created successfully',
                    icon: 'success',
                    timer: 4000,
                    showConfirmButton: false
                });
            }
        });
    };
    const [preview, setPreview] = React.useState<string | null>(null);
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
        <DashboardLayout title="Create Subcategory">
            <div className="space-y-4 pb-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Create Subcategory</h1>
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
                        <Label htmlFor="parent_id">Parent Category</Label>
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
                        {errors.parent_id && <p className="text-sm text-red-600">{errors.parent_id}</p>}
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
                        <Checkbox
                            id="is_active"
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

                    <Button  variant="outline" type="submit" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" disabled={processing}>
                        Create Subcategory
                    </Button>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default SubcategoryCreate;
