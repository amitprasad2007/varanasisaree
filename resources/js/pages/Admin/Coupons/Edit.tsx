
import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { BadgePercent } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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

interface EditProps {
  coupon: Coupon;
}

const formSchema = z.object({
  code: z.string()
    .min(3, "Code must be at least 3 characters")
    .max(30, "Code cannot exceed 30 characters")
    .toUpperCase(),
  type: z.enum(["fixed", "percentage"]),
  value: z.coerce.number()
    .min(0, "Value must be at least 0")
    .refine(
      (val) => true, 
      { message: "Value is required" }
    ),
  min_spend: z.coerce.number().nullable().optional(),
  max_discount: z.coerce.number().nullable().optional(),
  usage_limit: z.coerce.number().int().nullable().optional(),
  expires_at: z.string().nullable().optional(),
  status: z.boolean().default(true),
});

export default function Edit({ coupon }: EditProps) {
  const { toast } = useToast();
  
  // Format the expiry date for the datetime-local input
  const formatDateTimeLocal = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    values: {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      min_spend: coupon.min_spend,
      max_discount: coupon.max_discount,
      usage_limit: coupon.usage_limit,
      expires_at: formatDateTimeLocal(coupon.expires_at),
      status: coupon.status,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.type === 'percentage' && values.value > 100) {
      form.setError('value', { message: 'Percentage discount cannot exceed 100%' });
      return;
    }
    
    form.put(route('coupons.update', coupon.id), {
      onSuccess: () => {
        toast({
          title: "Coupon Updated",
          description: `${values.code} has been updated successfully.`,
        });
      },
    });
  }

  return (
    <AdminLayout title="Edit Coupon">
      <Head title="Edit Coupon" />
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Edit Coupon</h1>
        <p className="text-muted-foreground">Update an existing discount coupon</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-1">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <BadgePercent className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Coupon Details</h3>
                <p className="text-sm text-muted-foreground">Configure your discount coupon</p>
              </div>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coupon Code</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="SUMMER20" 
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter a unique code customers will use to apply the discount.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How the discount will be applied
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Value</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="number"
                              min="0"
                              step={form.watch("type") === "percentage" ? "1" : "0.01"}
                              {...field} 
                              placeholder={form.watch("type") === "percentage" ? "10" : "5.00"}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              {form.watch("type") === "percentage" ? "%" : "$"}
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          {form.watch("type") === "percentage" 
                            ? "Percentage discount to apply (1-100)"
                            : "Fixed amount to deduct from the order"
                          }
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="min_spend"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Spend</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="number"
                              min="0"
                              step="0.01"
                              {...field}
                              value={field.value === null ? '' : field.value}
                              onChange={(e) => {
                                const value = e.target.value === '' ? null : parseFloat(e.target.value);
                                field.onChange(value);
                              }}
                              placeholder="0.00"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              $
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Minimum order amount required (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="max_discount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Discount</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="number"
                              min="0"
                              step="0.01"
                              {...field}
                              value={field.value === null ? '' : field.value}
                              onChange={(e) => {
                                const value = e.target.value === '' ? null : parseFloat(e.target.value);
                                field.onChange(value);
                              }}
                              placeholder="0.00"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              $
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Maximum discount amount (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="usage_limit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usage Limit</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="1"
                            step="1"
                            {...field}
                            value={field.value === null ? '' : field.value}
                            onChange={(e) => {
                              const value = e.target.value === '' ? null : parseInt(e.target.value);
                              field.onChange(value);
                            }}
                            placeholder="Unlimited"
                          />
                        </FormControl>
                        <FormDescription>
                          How many times this coupon can be used (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expires_at"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => {
                              const value = e.target.value === '' ? null : e.target.value;
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          When this coupon expires (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">Usage Statistics</div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="font-medium">Used {coupon.used_count} times</div>
                    {coupon.usage_limit && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {coupon.used_count} out of {coupon.usage_limit} available uses
                      </div>
                    )}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <FormDescription>
                          Coupon will be available for use
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => window.history.back()}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}