import { Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
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
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

import { VideoProvider } from '@/types/product';
import axios from 'axios';
import { toast } from 'sonner';

interface IndexProps {
  providers: VideoProvider[];
}

export default function Index({ providers }: IndexProps) {
  const handleDelete = (providerId: number) => {
    if (confirm('Are you sure you want to delete this video provider?')) {
      axios.delete(`/admin/video-providers/${providerId}`)
        .then(response => {
          toast.success('Video provider deleted successfully');
          window.location.reload();
        })
        .catch(error => {
          toast.error(error.response?.data?.message || 'Error deleting video provider');
          console.error(error);
        });
    }
  };

  return (
    <DashboardLayout title="Video Providers">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Video Providers</h1>
          <p className="text-muted-foreground">
            Manage video platforms for product videos
          </p>
        </div>
        <Button asChild>
          <Link href={route('video-providers.create')}>Add New Provider</Link>
        </Button>
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
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={route('video-providers.edit', provider.id)}>
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600" 
                            onClick={() => handleDelete(provider.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
