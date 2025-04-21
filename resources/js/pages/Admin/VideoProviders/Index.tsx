import { Link,useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Plus, View, PlusCircle } from "lucide-react";
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
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from 'sweetalert2';
import { Badge } from '@/components/ui/badge';
import { VideoProvider } from '@/types/product';


interface IndexProps {
  providers: VideoProvider[];
}

export default function Index({ providers }: IndexProps) {
    const { delete: destroy } = useForm();
  const handleDelete = (providerId: number) => {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
          destroy(route('video-providers.destroy', providerId), {
            onSuccess: () => {
              Swal.fire({
                title: 'Deleted!',
                text: 'Your Video Provider has been deleted.',
                icon: 'success',
                timer: 3000,
                showConfirmButton: false
              });
            }
          });
        }
    });
  };
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Video Providers', href: route('video-providers.index') },
  ];
  return (
    <DashboardLayout title="Video Providers">
        <div className="space-y-4 pb-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Video Providers</h1>
          <p className="text-muted-foreground">
            Manage video platforms for product videos
          </p>
        </div>
        <Link href={route('video-providers.create')}>
            <Button className="flex items-center gap-2 bg-primary cursor-pointer hover:bg-gray-100 text-black shadow-sm">
              <Plus className="h-4 w-4" />
              Add New Provider
            </Button>
        </Link>
      </div>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Video Providers</CardTitle>
          <CardDescription>
            Configure platforms where your product videos are hosted
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Base URL</TableHead>
                <TableHead>Logo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providers.length > 0 ? (
                providers.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium">{provider.name}</TableCell>
                    <TableCell>{provider.base_url}</TableCell>
                    <TableCell>
                      {provider.logo ? (
                        <img
                          src={`/storage/${provider.logo}`}
                          alt={provider.name}
                          className="h-8 w-auto object-contain"
                        />
                      ) : (
                        <span className="text-muted-foreground text-sm">No logo</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={provider.status === 'active' ? 'secondary' : 'default'}
                      >
                        {provider.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-left">
                    <div className="flex  space-x-2">
                        <Link href={route('video-providers.edit', provider.id)}>
                            <Button variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" size="sm">
                                <Edit className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                           className="text-red-500 cursor-pointer dark:hover:bg-red-50"
                            size="sm"
                            onClick={() => handleDelete(provider.id)}
                            >
                            <Trash2 className="h-4 w-4 cursor-pointer" />
                        </Button>
                    </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    <div className="flex flex-col items-center justify-center text-muted-foreground space-y-2">
                      <p>No video providers found</p>
                      <Button variant="outline" asChild size="sm">
                        <Link href={route('video-providers.create')}>Add your first provider</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
