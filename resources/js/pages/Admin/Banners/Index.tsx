import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { GripVertical, Plus, Eye, EyeOff, Edit, Trash2, Image } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

interface Banner {
  id: number;
  title: string;
  image: string;
  description: string | null;
  link: string | null;
  status: 'active' | 'inactive';
  order: number;
}

interface Props {
  banners: Banner[];
}

const Index = ({ banners }: Props) => {
  const [sortedBanners, setSortedBanners] = useState<Banner[]>(banners);
  
  const { delete: destroy } = useForm();

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      destroy(route('banners.destroy', id), {
        preserveScroll: true,
        onSuccess: () => {
          toast.success('Banner deleted successfully');
        },
      });
    }
  };

  const handleToggleStatus = (id: number) => {
    axios.post(route('banners.update-status', id))
      .then(() => {
        setSortedBanners(sortedBanners.map(banner => {
          if (banner.id === id) {
            return {
              ...banner,
              status: banner.status === 'active' ? 'inactive' : 'active'
            };
          }
          return banner;
        }));
        
        toast.success('Banner status updated successfully');
      })
      .catch(error => {
        console.error('Error updating status:', error);
        toast.error('Failed to update banner status');
      });
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(sortedBanners);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the order property to match the new positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1,
    }));

    setSortedBanners(updatedItems);

    // Save the new order to the server
    axios.post(route('banners.update-order'), {
      banners: updatedItems.map(item => ({ id: item.id, order: item.order })),
    })
      .then(() => {
        toast.success('Banner order updated successfully');
      })
      .catch(error => {
        console.error('Error updating order:', error);
        toast.error('Failed to update banner order');
      });
  };

  return (
    <DashboardLayout title="Banners">
      <Head title="Banners" />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Banners</h1>
        <Link href={route('banners.create')}>
          <Button variant="default">
            <Plus className="h-4 w-4 mr-2" />
            Add New Banner
          </Button>
        </Link>
      </div>

      {sortedBanners.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No banners found</h3>
          <p className="text-gray-500 mb-4">Get started by creating a new banner.</p>
          <Link href={route('banners.create')}>
            <Button variant="default">
              <Plus className="h-4 w-4 mr-2" />
              Add New Banner
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <DragDropContext onDragEnd={onDragEnd}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ width: '50px' }}></TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <Droppable droppableId="banners">
                {(provided) => (
                  <TableBody
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {sortedBanners.map((banner, index) => (
                      <Draggable key={banner.id} draggableId={banner.id.toString()} index={index}>
                        {(provided) => (
                          <TableRow
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                          >
                            <TableCell>
                              <div 
                                {...provided.dragHandleProps}
                                className="cursor-move flex justify-center"
                              >
                                <GripVertical className="h-5 w-5 text-gray-400" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <img 
                                src={`/storage/${banner.image}`} 
                                alt={banner.title || 'Banner'} 
                                className="h-12 w-20 object-cover rounded-md"
                              />
                            </TableCell>
                            <TableCell>{banner.title || 'Untitled'}</TableCell>
                            <TableCell>
                              {banner.link ? (
                                <a 
                                  href={banner.link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline truncate block max-w-xs"
                                >
                                  {banner.link}
                                </a>
                              ) : (
                                <span className="text-gray-400 italic">No link</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant={banner.status === 'active' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleToggleStatus(banner.id)}
                              >
                                {banner.status === 'active' ? (
                                  <>
                                    <Eye className="h-4 w-4 mr-1" />
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="h-4 w-4 mr-1" />
                                    Inactive
                                  </>
                                )}
                              </Button>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Link href={route('banners.edit', banner.id)}>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(banner.id)}
                                  className="text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </TableBody>
                )}
              </Droppable>
            </Table>
          </DragDropContext>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Index;