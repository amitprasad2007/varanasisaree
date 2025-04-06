import React from 'react';
import { Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Show({ product }) {
  const renderProductAttribute = (label, value, suffix = '') => {
    return value ? (
      <div className="grid grid-cols-3 gap-4 py-3 border-b">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="col-span-2">{value}{suffix}</span>
      </div>
    ) : null;
  };

  return (
    <DashboardLayout title={`Product: ${product.name}`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-gray-500">Product ID: {product.id}</p>
        </div>
        <div className="space-x-2">
          <Link href={route('products.edit', product.id)}>
            <Button variant="outline">Edit Product</Button>
          </Link>
          <Link href={route('products.index')}>
            <Button variant="ghost">Back to Products</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {renderProductAttribute("Name", product.name)}
              {renderProductAttribute("Slug", product.slug)}
              {renderProductAttribute("Category", product.category?.name || 'N/A')}
              {renderProductAttribute("Subcategory", product.subcategory?.name || 'N/A')}
              {renderProductAttribute("Brand", product.brand?.name || 'N/A')}
              {renderProductAttribute("Status", (
                <span className={`px-2 py-1 rounded-full text-xs ${
                  product.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.status}
                </span>
              ))}
              {renderProductAttribute("Bestseller", product.is_bestseller ? "Yes" : "No")}
              {renderProductAttribute("Created At", new Date(product.created_at).toLocaleString())}
              {renderProductAttribute("Updated At", new Date(product.updated_at).toLocaleString())}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing & Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {renderProductAttribute("Price", `$${parseFloat(product.price).toFixed(2)}`)}
              {renderProductAttribute("Discount", product.discount > 0 ? `${product.discount}%` : "No discount")}
              {renderProductAttribute("Stock Quantity", product.stock_quantity)}
              
              {product.discount > 0 && (
                renderProductAttribute(
                  "Sale Price", 
                  `$${(parseFloat(product.price) * (1 - parseFloat(product.discount) / 100)).toFixed(2)}`
                )
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Product Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              {product.description ? (
                <p>{product.description}</p>
              ) : (
                <p className="text-gray-500 italic">No description provided</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Attributes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {renderProductAttribute("Fabric", product.fabric || 'Not specified')}
              {renderProductAttribute("Color", product.color || 'Not specified')}
              {renderProductAttribute("Size", product.size || 'Not specified')}
              {renderProductAttribute("Work Type", product.work_type || 'Not specified')}
              {renderProductAttribute("Occasion", product.occasion || 'Not specified')}
              {renderProductAttribute("Weight", product.weight ? `${product.weight} kg` : 'Not specified')}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}