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

interface Brand {
    id: number;
    name: string;
    slug: string;
    status: string;
    description: string;
    images: string | null;
    logo:string | null;
}

interface Props {
    brand: Brand
}

export default function Edit({ brand }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    name: brand.name ||'',
    slug: brand.slug || '',
    description: brand.description|| '',
    images: null as File | null,
    logo: null as File | null,
    status: brand.status === 'active' || false,

  });
//console.log(data);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('brands.update', brand.id), {
        onSuccess: () => {
            Swal.fire({
                title: 'Success!',
                text: 'Brand updated successfully',
                icon: 'success',
                timer: 4000,
                showConfirmButton: false
            });
        }
    });
  };
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Brands', href: route('brands.index') },
    { title: 'Edit Brand', href: route('brands.edit', brand.id) },
];
const [preview, setPreview] = React.useState<string | null>(brand.images ? `/storage/${brand.images}` : null);
const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setData('images', file);

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
const [previewlogo, setPreviewlogo] = React.useState<string | null>(brand.images ? `/storage/${brand.logo}` : null);
const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setData('logo', file);

    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewlogo(reader.result as string);
        };
        reader.readAsDataURL(file);
    } else {
        setPreviewlogo(null);
    }
};
  return (
    <DashboardLayout title="Edit Brand">
        <div className="space-y-4 pb-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Edit Brand</h1>
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
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={e => setData('name', e.target.value)}
                    />
                    {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
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
                        value={data.description}
                        onChange={e => setData('description', e.target.value)}
                    />
                    {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="images">Images</Label>
                    <div className="space-y-4">
                        <Input
                            id="images"
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
                    {errors.images && <p className="text-sm text-red-600">{errors.images}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="logo">Logo</Label>
                    <div className="space-y-4">
                        <Input
                            id="logo"
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                        />
                        {previewlogo && (
                            <div className="relative group">
                                <img
                                    src={previewlogo}
                                    alt="Preview"
                                    className="w-32 h-32 object-cover rounded-md transition-all duration-300 group-hover:w-40 group-hover:h-40 group-hover:shadow-lg group-hover:z-20 group-hover:relative"
                                />
                            </div>
                        )}
                    </div>
                    {errors.logo && <p className="text-sm text-red-600">{errors.logo}</p>}
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
                    Update Brand
                </Button>

            </form>
        </div>
    </DashboardLayout>
  );
}
