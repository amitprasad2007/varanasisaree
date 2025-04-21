import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
  BadgePercent,
  Edit,
  Plus,
  Trash2,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from 'sweetalert2';

interface Coupon {
  id: number;
  code: string;
  type: 'fixed' | 'percentage';
  value: number;
  min_spend: number | null;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  expires_at: string | null;
  status: boolean;
}

interface IndexProps {
  coupons: Coupon[];
}

export default function Index({ coupons }: IndexProps) {
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const { toast } = useToast();

  const handleDelete = () => {
    if (couponToDelete) {
      router.delete(route('coupons.destroy', couponToDelete.id), {
        onSuccess: () => {
            Swal.fire({
            title: "Coupon Deleted",
            text: `${couponToDelete.code} has been deleted successfully.`,
            icon: 'success',
            timer: 4000,
            showConfirmButton: false
          });
          setCouponToDelete(null);
        },
      });
    }
  };

  const handleStatusChange = (coupon: Coupon) => {
    router.post(route('coupons.update-status', coupon.id), {}, {
      onSuccess: () => {
        Swal.fire({
            title: `Coupon ${coupon.status ? 'Deactivated' : 'Activated'}`,
            text: `${coupon.code} has been ${coupon.status ? 'deactivated' : 'activated'} successfully.`,
            icon: 'success',
            timer: 4000,
            showConfirmButton: false
        });
      },
    });
  };

  const isExpired = (date: string | null): boolean => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const formatCurrency = (amount: number | null | string): string => {
    if (amount === null) return '-';
    if (typeof amount === 'string') {
      const convertedAmount = parseFloat(amount);
      if (!isNaN(convertedAmount)) {
        return `₹${convertedAmount.toFixed(2)}`;
      }
      return '-';
    }
    if (typeof amount !== 'number') return '-';
    return `₹${amount.toFixed(2)}`;
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Coupons', href: route('coupons.index') },

  ];
  return (
    <DashboardLayout title="Coupons">
      <Head title="Coupons" />
      <div className="space-y-4 pb-6">
      <div className="flex justify-between items-center mb-6">

        <div>
          <h1 className="text-2xl font-bold tracking-tight">Coupons</h1>
          <p className="text-muted-foreground">Manage discount coupons for your store</p>
        </div>
        <Link href={route('coupons.create')}>
          <Button variant='outline' className="flex items-center gap-2 bg-primary cursor-pointer hover:bg-gray-100 text-black shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Add Coupon
          </Button>
        </Link>
      </div>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Min. Spend</TableHead>
              <TableHead>Max Discount</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center text-center">
                    <BadgePercent className="h-12 w-12 text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">No coupons found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Get started by creating a new coupon.
                    </p>
                    <Link href={route('coupons.create')} className="mt-4">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Coupon
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-medium">{coupon.code}</TableCell>
                  <TableCell>
                    <Badge variant={coupon.type === 'percentage' ? 'default' : 'secondary'}>
                      {coupon.type === 'percentage' ? 'Percentage' : 'Fixed'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {coupon.type === 'percentage' ? `${coupon.value}%` : formatCurrency(coupon.value)}
                  </TableCell>
                  <TableCell>{coupon.min_spend ? formatCurrency(coupon.min_spend) : '-'}</TableCell>
                  <TableCell>{coupon.max_discount ? formatCurrency(coupon.max_discount) : '-'}</TableCell>
                  <TableCell>
                    {coupon.usage_limit
                      ? `${coupon.used_count} / ${coupon.usage_limit}`
                      : `${coupon.used_count} / ∞`
                    }
                  </TableCell>
                  <TableCell>
                    {coupon.expires_at ? (
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span className={isExpired(coupon.expires_at) ? "text-red-500" : ""}>
                          {format(new Date(coupon.expires_at), 'MMM dd, yyyy')}
                        </span>
                        {isExpired(coupon.expires_at) && (
                          <Badge variant="expired">Expired</Badge>
                        )}
                      </div>
                    ) : (
                      'Never'
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={coupon.status}
                        onCheckedChange={() => handleStatusChange(coupon)}
                      />
                      <span>{coupon.status ? 'Active' : 'Inactive'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Link href={route('coupons.edit', coupon.id)}>
                        <Button className='cursor-pointer' variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 border-red-200 cursor-pointer hover:bg-red-50 hover:text-red-600"
                            onClick={() => setCouponToDelete(coupon)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        {couponToDelete && (
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete coupon "{couponToDelete.code}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel  className="cursor-pointer" onClick={() => setCouponToDelete(null)}>
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
    </DashboardLayout>
  );
}
