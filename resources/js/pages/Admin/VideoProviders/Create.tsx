import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Label } from "@/components/ui/label";
import { Checkbox } from '@/components/ui/checkbox';
import {
Card,
CardContent,
CardDescription,
CardFooter,
CardHeader,
CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import { useForm } from '@inertiajs/react';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from 'sweetalert2';

type CheckedState = boolean | "indeterminate";

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        base_url:'',
        logo: null as File | null,
        status: true as CheckedState,
    });
    const [previewlogo, setPreviewlogo] = React.useState<string | null>(null);

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

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Video Providers', href: route('video-providers.index') },
        { title: 'Add Video Providers', href: route('video-providers.create') },
    ];

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('video-providers.store'), {
          onSuccess: () => {
            Swal.fire({
                title: 'Success!',
                text: 'Video Provider created successfully',
                icon: 'success',
                timer: 4000,
                showConfirmButton: false
            });
        }
        });
      };


  return (
    <DashboardLayout title="Add Video Provider">
      <div className="space-y-6">
        <div className="space-y-4 pb-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Add Video Provider</h1>
                    <p className="text-muted-foreground">
                    Configure a new video platform for product videos
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href={route('video-providers.index')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Providers
                    </Link>
                </Button>
            </div>
            <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Provider Details</CardTitle>
                <CardDescription>
                    Enter the information for the video provider
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Brand Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            placeholder="YouTube"
                            onChange={e => setData('name', e.target.value)}
                        />
                        The name of the video platform (e.g., YouTube, Vimeo)
                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="base_url">Base URL </Label>
                        <Input
                            id="base_url"
                            type="url"
                            value={data.base_url}
                            onChange={e => setData('base_url', e.target.value)}
                            placeholder="https://example.com/page"
                        />
                         Upload a logo for the video provider (optional)
                        {errors.base_url && (<p className="text-sm text-red-500">{errors.base_url}</p>)}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="logo">Provider Logo</Label>
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
                                        alt="Previewlogo"
                                        className="w-32 h-32 object-cover rounded-md transition-all duration-300 group-hover:w-40 group-hover:h-40 group-hover:shadow-lg group-hover:z-20 group-hover:relative"
                                    />
                                </div>
                            )}
                        </div>
                        {errors.logo && <p className="text-sm text-red-600">{errors.logo}</p>}
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
                    <CardFooter className="flex justify-end px-0 pb-0">
                        <Button type="submit" variant="outline"  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" disabled={processing}>
                            Create Provider
                        </Button>
                    </CardFooter>
                </form>
            </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
