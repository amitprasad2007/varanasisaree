import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CollectionType {
  id: number;
  name: string;
  icon?: string;
}


interface Collection {
  id: number;
  name: string;
  description?: string;
  collection_type_id?: number;
  image?: string;
  display_order: number;
  status: string;
}

interface Props {
  collection: Collection;
  collectionTypes: CollectionType[];
}

export default function Edit({ collection, collectionTypes  }: Props) {
  const { data, setData, put, processing, errors } = useForm({
    name: collection.name,
    description: collection.description || '',
    collection_type_id: collection.collection_type_id?.toString() || '',
    image: collection.image || '',
    display_order: collection.display_order,
    status: collection.status,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/admin/collections/${collection.id}`);
  };

  return (
    <DashboardLayout title="Edit Collections">
      <Head title="Edit Collection" />
      
      <div className="p-6">
        <div className="mb-6">
          <Link href="/admin/collections">
            <Button variant="outline">← Back to Collections</Button>
          </Link>
        </div>

        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold mb-6">Edit Collection</h1>

          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                rows={4}
              />
            </div>

            <div>
            <Label htmlFor="collection_type_id">Collection Type *</Label>
              <Select 
                value={data.collection_type_id} 
                onValueChange={(value) => setData('collection_type_id', value)}
              >
                <SelectTrigger className={errors.collection_type_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select a collection type" />
                </SelectTrigger>
                <SelectContent>
                {collectionTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.icon && <span className="mr-2">{type.icon}</span>}
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.collection_type_id && (
                <p className="text-red-500 text-sm mt-1">{errors.collection_type_id}</p>
              )}
            </div>

            <div>
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={data.image}
                onChange={(e) => setData('image', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                value={data.display_order}
                onChange={(e) => setData('display_order', parseInt(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={processing}>
                Update Collection
              </Button>
              <Link href="/admin/collections">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}


