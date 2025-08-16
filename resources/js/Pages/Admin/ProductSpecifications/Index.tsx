
import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from "sweetalert2";
interface Product {
  id: number;
  name: string;
}

interface Specification {
  id: number;
  name: string;
  value: string;
}

interface Props {
  product: Product;
  specifications: Specification[];
}

export default function Index({ product, specifications }: Props) {
  const { delete: destroy, processing } = useForm();

  const handleDelete = (specificationId: number) => {
    destroy(route('product-specifications.destroy', [product.id, specificationId]), {
      onSuccess: () => {
        Swal.fire({
            title: 'Success!',
            text: 'Specification deleted successfully',
            icon: 'success',
            timer: 4000,
            showConfirmButton: false
        });
      },
      onError: () => {
        Swal.fire({
            title: 'Error!',
            text: 'Failed to delete specification',
            icon: 'error',
            timer: 4000,
            showConfirmButton: false
        });
      }
    });
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Product', href: route('products.index') },
    { title: 'Show Product', href: route('products.show', product.id) },
    { title: 'Product Specification', href: route('product-specifications.index', product.id) },
  ];
  return (
    <DashboardLayout title={`Product Specifications: ${product.name}`}>
      <div className="space-y-6">
      <div className="space-y-4 pb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Product Specifications</h1>
            <p className="text-muted-foreground">
              Manage specifications for {product.name}
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="hover:bg-gray-100 dark:hover:bg-gray-800" asChild>
              <Link href={route('products.show', product.id)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Product
              </Link>
            </Button>
            <Button variant="outline" className="hover:bg-gray-100 dark:hover:bg-gray-800" asChild>
              <Link href={route('product-specifications.create', product.id)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Specification
              </Link>
            </Button>
          </div>
        </div>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Specifications</CardTitle>
            <CardDescription>
              Custom specifications for this product
            </CardDescription>
          </CardHeader>
          <CardContent>
            {specifications.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {specifications.map((spec) => (
                    <TableRow key={spec.id}>
                      <TableCell className="font-medium">{spec.name}</TableCell>
                      <TableCell>{spec.value}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="icon" variant="outline" asChild>
                            <Link href={route('product-specifications.edit', [product.id, spec.id])}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Link>
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="outline" className=' text-red-500 hover:bg-red-50 cursor-pointer'>
                                <Trash2 className="h-4 w-4 " />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Specification</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this specification? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className='cursor-pointer'>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(spec.id)}
                                  disabled={processing}
                                  className="bg-red-600 cursor-pointer hover:bg-red-700 text-white"
                                >
                                  {processing ? 'Deleting...' : 'Delete'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground mb-4">No specifications have been added yet.</p>
                <Button asChild>
                  <Link href={route('product-specifications.create', product.id)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add First Specification
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
