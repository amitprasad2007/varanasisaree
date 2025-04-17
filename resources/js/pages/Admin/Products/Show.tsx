import React from 'react';
import { Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Pencil, ArrowLeft, Image, ListChecks } from 'lucide-react';
interface product {
    id: number;
    name:string;
    slug:string;
    category:{title:string};
    subcategory:{title:string};
    brand:{name:string};
    price:string;
    discount:number;
    stock_quantity:number;
    status:string;
    is_bestseller:boolean;
    created_at:string;
    updated_at:string;
    description:string;
    fabric:string;
    color:string;
    size:number;
    weight:number;
    work_type:string;
    occasion:string;
  }

  interface Props {
    product: product;
  }

export default function Show({ product }: Props) {
  const renderProductAttribute = (label: string, value: any, suffix: string = '') => {
    return value ? (
      <div className="grid grid-cols-3 gap-4 py-3 border-b">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="col-span-2">{value}{suffix}</span>
      </div>
    ) : null;
  };
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Product', href: route('products.index') },
    { title: 'Show Product', href: route('products.show', product.id) },
  ];

  return (
    <DashboardLayout title={`Product: ${product.name}`}>
      <div className="space-y-4 pb-6">
        <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
              <p className="text-muted-foreground">
                View product details and information
              </p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" asChild>
                <Link href={route('products.index')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Products
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={route('product-images.index', product.id)}>
                  <Image className="h-4 w-4 mr-2" />
                  Manage Images
                </Link>
              </Button>
              <Button variant="outline" asChild>
              <Link href={route('product-specifications.index', product.id)}>
                <ListChecks className="h-4 w-4 mr-2" />
                Manage Specifications
              </Link>
            </Button>
              <Button variant="outline" asChild>
                <Link href={route('products.edit', product.id)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Product
                </Link>
              </Button>
            </div>        
        </div>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>       
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Core product details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableHead className="w-[180px]">Name</TableHead>
                    <TableCell>{product.name}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Slug</TableHead>
                    <TableCell>{product.slug}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableCell>{product.category?.title}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Subcategory</TableHead>
                    <TableCell>{product.subcategory?.title}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Brand</TableHead>
                    <TableCell>{product.brand?.name}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableCell>{product.description || 'No description provided'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableCell>
                      <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                        {product.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
              <CardDescription>
                Product pricing and stock information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableHead className="w-[180px]">Price</TableHead>
                    <TableCell>${parseFloat(product.price).toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Discount</TableHead>
                    <TableCell>{Number(product.discount).toFixed(2)}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Final Price</TableHead>
                    <TableCell>
                      ${(Number(product.price) * (1 - Number(product.discount) / 100)).toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Stock Quantity</TableHead>
                    <TableCell>{product.stock_quantity}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Bestseller</TableHead>
                    <TableCell>
                      <Badge variant={product.is_bestseller ? 'default' : 'outline'}>
                        {product.is_bestseller ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Attributes</CardTitle>
              <CardDescription>
                Detailed product specifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableHead className="w-[180px]">Fabric</TableHead>
                    <TableCell>{product.fabric || 'Not specified'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Color</TableHead>
                    <TableCell>{product.color || 'Not specified'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Size</TableHead>
                    <TableCell>{product.size || 'Not specified'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Work Type</TableHead>
                    <TableCell>{product.work_type || 'Not specified'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Occasion</TableHead>
                    <TableCell>{product.occasion || 'Not specified'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Weight</TableHead>
                    <TableCell>
                      {product.weight ? `${Number(product.weight).toFixed(2)} kg` : 'Not specified'}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
    </DashboardLayout>
  );
}