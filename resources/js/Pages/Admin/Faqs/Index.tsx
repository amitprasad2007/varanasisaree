import React, { useState } from 'react';
import { Link, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, GripVertical } from "lucide-react";
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from 'sweetalert2';

interface Faq {
  id: number;
  question: string;
  answer: string;
  order: number;
  status: string;
}

interface Props {
  faqs: {
    data: Faq[];
    links: any;
    meta: any;
  };
}

export default function Index({ faqs }: Props) {
  const [faqItems, setFaqItems] = useState(faqs.data);
  const [draggedItem, setDraggedItem] = useState<Faq | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'FAQs', href: route('faqs.index') },
  ];

  const { delete: destroy } = useForm();

  const handleDelete = (id: number) => {
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
        destroy(route('faqs.destroy', id), {
          onSuccess: () => {
            Swal.fire({
              title: 'Deleted!',
              text: 'Your FAQ has been deleted.',
              icon: 'success',
              timer: 3000,
              showConfirmButton: false
            });
          }
        });
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, faq: Faq) => {
    setDraggedItem(faq);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLTableRowElement>, targetFaq: Faq) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.id === targetFaq.id) {
      setIsDragging(false);
      setDraggedItem(null);
      return;
    }

    const newItems = [...faqItems];
    const draggedIndex = newItems.findIndex(item => item.id === draggedItem.id);
    const targetIndex = newItems.findIndex(item => item.id === targetFaq.id);

    // Remove dragged item and insert at target position
    newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItem);

    // Update order values
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    setFaqItems(updatedItems);
    setIsDragging(false);
    setDraggedItem(null);

    // Send update to server
    updateFaqsOrder(updatedItems);
  };

  const updateFaqsOrder = (items: Faq[]) => {
    const faqsData = items.map(item => ({
      id: item.id,
      order: item.order
    }));

    router.post(route('faqs.update-order'), {
      faqs: faqsData
    }, {
      preserveScroll: true,
      onSuccess: () => {
        Swal.fire({
          title: 'Success!',
          text: 'FAQ order updated successfully',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  };

  const updateStatus = (id: number, status: string) => {
    router.post(route('faqs.update-status', id), {
      status: status
    }, {
      preserveScroll: true,
      onSuccess: () => {
        Swal.fire({
          title: 'Success!',
          text: 'FAQ status updated successfully',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  };

  return (
    <DashboardLayout title="FAQs">
      <div className="space-y-4 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">FAQs Management</h1>
          <Link href={route('faqs.create')}>
            <Button className="flex items-center gap-2 bg-primary cursor-pointer hover:bg-gray-100 text-black shadow-sm">
              <Plus className="h-4 w-4" />
              Add FAQ
            </Button>
          </Link>
        </div>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>
      
      <div className="bg-white rounded-md shadow-lg border border-gray-100">
        <div className="p-4 border-b">
          <p className="text-sm text-gray-600">
            <GripVertical className="inline h-4 w-4 mr-1" />
            Drag and drop rows to reorder FAQs
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead width="50"></TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Answer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {faqItems.length > 0 ? (
              faqItems.map((faq) => (
                <TableRow 
                  key={faq.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, faq)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, faq)}
                  className={`${isDragging && draggedItem?.id === faq.id ? 'opacity-50' : ''} cursor-move hover:bg-gray-50`}
                >
                  <TableCell>
                    <GripVertical className="h-4 w-4 text-gray-400" />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {faq.order}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium max-w-xs">
                    <div className="truncate" title={faq.question}>
                      {faq.question}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <div className="truncate text-gray-600" title={faq.answer}>
                      {faq.answer}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(faq.status)}
                      <select
                        value={faq.status}
                        onChange={(e) => updateStatus(faq.id, e.target.value)}
                        className="text-xs border rounded px-2 py-1"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end space-x-2">
                      <Link href={route('faqs.edit', faq.id)}>
                        <Button variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="cursor-pointer text-red-600 hover:bg-red-50"
                        size="sm"
                        onClick={() => handleDelete(faq.id)}
                      >
                        <Trash2 className="h-4 w-4 cursor-pointer" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No FAQs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}