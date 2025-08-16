import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { PlusIcon, TrashIcon, PencilIcon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from 'sweetalert2';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog';

interface Testimonial {
  id: number;
  name: string;
  email: string;
  designation: string | null;
  company: string | null;
  photo: string | null;
  testimonial: string;
  testimonial_hi: string | null;
  status: 'active' | 'inactive';
  approval_status: 'pending' | 'approved' | 'rejected';
  rating: number | null;
  created_at: string;
}

interface Props {
  testimonials: Testimonial[];
}

export default function Index({ testimonials }: Props) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] = useState<Testimonial | null>(null);


  const confirmDelete = (testimonial: Testimonial) => {
    setTestimonialToDelete(testimonial);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (testimonialToDelete) {
      router.delete(route('testimonials.destroy', testimonialToDelete.id), {
        onSuccess: () => {
          Swal.fire({
            title: 'Success!',
            text: `Testimonial deleted successfully`,
            icon: 'success',
            timer: 4000,
            showConfirmButton: false
          });
          setIsDeleteDialogOpen(false);
          setTestimonialToDelete(null);
        },
      });
    }
  };

  const handleStatusChange = (testimonial: Testimonial, status: boolean) => {
    router.post(route('testimonials.update-status', testimonial.id), {
      status: status ? 'active' : 'inactive',
    }, {
      onSuccess: () => {
        Swal.fire({
          title: 'Success!',
          text: `Testimonial ${status ? 'activated' : 'deactivated'} successfully`,
          icon: 'success',
          timer: 4000,
          showConfirmButton: false
        });
      },
    });
  };

  const handleApprovalStatusChange = (testimonial: Testimonial, newStatus: 'pending' | 'approved' | 'rejected') => {
    router.post(route('testimonials.update-approval-status', testimonial.id), {
      approval_status: newStatus,
    }, {
        onSuccess: () => {
          Swal.fire({
            title: 'Success!',
            text: `Testimonial marked as ${newStatus}`,
            icon: 'success',
            timer: 4000,
            showConfirmButton: false
          });
        },
    });
  };

  const getApprovalBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="pending">Pending</Badge>;
      case 'approved':
        return <Badge variant="approved">Approved</Badge>;
      case 'rejected':
        return <Badge variant="rejected">Rejected</Badge>;
      default:
        return null;
    }
  };
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Testimonials', href: route('testimonials.index') },

  ];

  return (
    <DashboardLayout title="Testimonials">
      <div className="space-y-6">
        <div className="space-y-4 pb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Testimonials</h1>
              <p className="text-muted-foreground">
                Manage customer testimonials and reviews
              </p>
            </div>
            <Button variant='outline' asChild>
              <Link href={route('testimonials.create')}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add New Testimonial
              </Link>
            </Button>
          </div>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
        <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Photo</TableHead>
                  <TableHead className="w-[200px]">Client</TableHead>
                  <TableHead className="hidden md:table-cell">Content</TableHead>
                  <TableHead className="hidden sm:table-cell w-[120px]">Status</TableHead>
                  <TableHead className="hidden sm:table-cell w-[120px]">Approval</TableHead>
                  <TableHead className="w-[150px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testimonials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No testimonials found. Start by adding one.
                    </TableCell>
                  </TableRow>
                ) : (
                  testimonials.map((testimonial) => (
                    <TableRow key={testimonial.id}>
                      <TableCell>
                        {testimonial.photo ? (
                          <img
                            src={`/storage/${testimonial.photo}`}
                            alt={testimonial.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                            {testimonial.name ? testimonial.name.charAt(0) : '?'}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{testimonial.name}</div>
                        {testimonial.designation && (
                          <div className="text-xs text-muted-foreground">
                            {testimonial.designation}
                            {testimonial.company && `, ${testimonial.company}`}
                          </div>
                        )}
                        {testimonial.rating && (
                          <div className="flex mt-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-xs ${i < testimonial.rating! ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="line-clamp-2 max-w-md">
                          {testimonial.testimonial}
                        </div>
                        {testimonial.testimonial_hi && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            <span className="bg-gray-100 px-1 rounded">Hindi</span> Available
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Switch
                          checked={testimonial.status === 'active'}
                          onCheckedChange={(checked) => handleStatusChange(testimonial, checked)}
                        />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex flex-col space-y-1">
                          {getApprovalBadge(testimonial.approval_status)}
                          <div className="mt-1 flex space-x-1">
                            <button
                              onClick={() => handleApprovalStatusChange(testimonial, 'approved')}
                              className={`cursor-pointer text-xs px-1 rounded ${testimonial.approval_status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleApprovalStatusChange(testimonial, 'rejected')}
                              className={`cursor-pointer text-xs px-1 rounded ${testimonial.approval_status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" size="sm" asChild>
                            <Link href={route('testimonials.edit', testimonial.id)}>
                              <PencilIcon className="h-4 w-4" />
                            </Link>
                          </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 border-red-200 cursor-pointer hover:bg-red-50 hover:text-red-600"
                              onClick={() => setTestimonialToDelete(testimonial)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          {testimonialToDelete && (
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
                                <AlertDialogDescription>
                                Are you sure you want to delete this testimonial from {testimonialToDelete?.name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel  className="cursor-pointer" onClick={() => setIsDeleteDialogOpen(false)}>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleDelete}
                                  className="bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          )}
                        </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
        </div>
      </div>

    </DashboardLayout>
  );
}
