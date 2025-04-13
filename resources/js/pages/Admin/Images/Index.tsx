import React, { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Link, useForm } from '@inertiajs/react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash, Edit, Plus, View } from "lucide-react";
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from 'sweetalert2';
import ImageUploadModal from './ImageUploadModal';


interface Product {
    id: number;
    name: string;
    imageproducts: { image_url: string; sort_order: number; id: number }[];
    brand: { name: string };
    price: number;
}

interface Props {
    products: Product[];
}

const ImagesIndex = ({ products }: Props) => {

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Product', href: route('products.index') },
        { title: 'Images', href: route('productimages.index') },
    ];

    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

    const openModal = (productId: number) => {
        setSelectedProductId(productId);
        setModalOpen(true);
    };

    return (
        <DashboardLayout title="Categories">
            <div className="space-y-4 pb-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Products Images</h1>
                </div>
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="bg-white rounded-md shadow-lg border border-gray-100">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Brand</TableHead>
                            <TableHead>Images</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.length > 0 ? (
                            products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>{product.brand?.name || 'N/A'}</TableCell>
                                    <TableCell>
                                        {product.imageproducts.length > 0 ? (
                                            product.imageproducts.map((images)=>(
                                                images.image_url
                                            ))
                                        ): ('N/A')}
                                    </TableCell>
                                    <TableCell className="text-left">
                                        <div className="flex space-x-2">
                                            <Button className="flex items-center gap-2 bg-primary cursor-pointer hover:bg-gray-100 text-black shadow-sm" variant="outline"  onClick={() => openModal(product.id)}>
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-4">
                                    No products found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <ImageUploadModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} productId={selectedProductId!} />
        </DashboardLayout>
    );
};

export default ImagesIndex;
