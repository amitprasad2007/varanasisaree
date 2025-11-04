import React from 'react';
import { useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from "sweetalert2";

interface StatusOption {
  value: string;
  label: string;
}

interface Props {
  statusOptions: StatusOption[];
}

export default function Create({ statusOptions }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    question: '',
    answer: '',
    order: '',
    status: 'active',
  });

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'FAQs', href: route('faqs.index') },
    { title: 'Create FAQ', href: route('faqs.create') },
  ];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    post(route('faqs.store'), {
      onSuccess: () => {
        Swal.fire({
          title: 'Success!',
          text: 'FAQ created successfully',
          icon: 'success',
          timer: 4000,
          showConfirmButton: false
        });
      }
    });
  };

  return (
    <DashboardLayout title="Create FAQ">
      <div className="space-y-4 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Create New FAQ</h1>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Cancel
          </Button>
        </div>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>

      <div className="bg-white rounded-md shadow-lg border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="question">Question *</Label>
            <Input
              id="question"
              value={data.question}
              onChange={e => setData('question', e.target.value)}
              placeholder="Enter the frequently asked question"
              maxLength={500}
            />
            <p className="text-sm text-gray-500">
              {data.question.length}/500 characters
            </p>
            {errors.question && <p className="text-sm text-red-600">{errors.question}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="answer">Answer *</Label>
            <Textarea
              id="answer"
              value={data.answer}
              onChange={e => setData('answer', e.target.value)}
              placeholder="Enter the answer to this question"
              rows={6}
            />
            {errors.answer && <p className="text-sm text-red-600">{errors.answer}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                value={data.order}
                onChange={e => setData('order', e.target.value)}
                placeholder="Leave empty for auto-assignment"
                min="0"
              />
              <p className="text-sm text-gray-500">
                Lower numbers appear first. Leave empty to add at the end.
              </p>
              {errors.order && <p className="text-sm text-red-600">{errors.order}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
            </div>
          </div>

          <Button 
            variant="outline" 
            type="submit" 
            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" 
            disabled={processing}
          >
            Create FAQ
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}