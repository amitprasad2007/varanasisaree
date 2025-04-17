import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: number;
  name: string;
}

interface CreateProps {
  product: Product;
}

interface SpecificationFormData {
  name: string;
  value: string;
  [key: string]: any;
}

export default function Create({ product }: CreateProps) {
  const { data, setData, post, processing, errors } = useForm<SpecificationFormData>({
    name: '',
    value: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('product-specifications.store', product.id), {
      onSuccess: () => {
        toast.success('Specification added successfully');
      },
      onError: () => {
        toast.error('Failed to add specification');
      }
    });
  };

  return (
    <DashboardLayout title={`Add Specification: ${product.name}`}>
      <div className="max-w-xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Add Specification</h1>
          <Button variant="outline" asChild>
            <Link href={route('product-specifications.index', product.id)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Specifications
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add New Specification for {product.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name <span className="text-red-500">*</span></Label>
                    <Input 
                      value={data.name}
                      onChange={e => setData('name', e.target.value)}
                      placeholder="e.g., Material, Length, Dimensions" 
                    />
                  {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Value <span className="text-red-500">*</span></Label>                  
                    <Input 
                      value={data.value}
                      onChange={e => setData('value', e.target.value)}
                      placeholder="e.g., Cotton, 5.5 meters, 10x15 cm" 
                    />
                  {errors.value && <p className="text-sm text-red-600">{errors.value}</p>}
                </div>
                <div className="pt-4">
                  <Button
                    variant="outline" type="submit" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 w-full" disabled={processing}
                  >
                    {processing ? 'Adding...' : 'Add Specification'}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
