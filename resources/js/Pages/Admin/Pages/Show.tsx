import React from 'react';
import { Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, ArrowLeft } from 'lucide-react';

interface Page {
  id: number;
  title: string;
  slug: string;
  type: 'policy' | 'page' | 'faq' | 'settings' | string;
  content: string | null;
  metadata: any;
  is_active: boolean;
  last_updated_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface Props {
  page: Page;
}

const typeBadge = (type: string) => {
  switch (type) {
    case 'policy':
      return <Badge className="bg-purple-100 text-purple-800">Policy</Badge>;
    case 'page':
      return <Badge className="bg-blue-100 text-blue-800">Page</Badge>;
    case 'faq':
      return <Badge className="bg-green-100 text-green-800">FAQ</Badge>;
    case 'settings':
      return <Badge className="bg-orange-100 text-orange-800">Settings</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800">{type}</Badge>;
  }
};

const statusBadge = (active: boolean) => (
  active ? (
    <Badge className="bg-green-100 text-green-800">Active</Badge>
  ) : (
    <Badge className="bg-red-100 text-red-800">Inactive</Badge>
  )
);

export default function Show({ page }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Pages & Policies', href: route('pages.index') },
    { title: 'View Page', href: route('pages.show', page.id) },
  ];

  return (
    <DashboardLayout title={`View Page - ${page.title}`}>
      <div className="space-y-4 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">View Page</h1>
          <div className="flex gap-2">
            <Link href={route('pages.edit', page.id)}>
              <Button variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                <Edit className="h-4 w-4 mr-2" /> Edit
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </div>
        </div>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{page.title}</span>
              <div className="flex items-center gap-2">
                {typeBadge(page.type)}
                {statusBadge(page.is_active)}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Slug</div>
                <div className="font-medium">{page.slug}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Last Updated</div>
                <div className="font-medium">
                  {page.last_updated_at ? new Date(page.last_updated_at).toLocaleString() : '-'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            {page.metadata ? (
              <pre className="text-sm bg-muted p-3 rounded overflow-auto">
                {JSON.stringify(page.metadata, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground">No metadata provided.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent>
          {page.content ? (
            <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">{page.content}</div>
          ) : (
            <p className="text-sm text-muted-foreground">No content available.</p>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
