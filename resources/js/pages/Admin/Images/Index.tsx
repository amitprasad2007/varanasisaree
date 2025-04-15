import React, { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Plus } from "lucide-react";
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from 'sweetalert2';
import ImageUploadModal from '@/Pages/Admin/Images/ImageUploadModal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Trash, Edit, View } from "lucide-react";
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious 
} from '@/components/ui/carousel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from 'react-beautiful-dnd';
import { PlusCircle, Trash2, Star, Image, Move } from 'lucide-react';

interface Image {
    id: number;
    image_path: string;
    alt_text?: string;
    is_primary: boolean;
    display_order: number;
}

interface Product {
    id: number;
    name: string;
}

interface Props {
    product: Product;
    images: Image[];
    success?: string;
}

export default function ImagesIndex({ product, images, success }: Props) {
    const [reorderedImages, setReorderedImages] = useState(images || []);
    
    const { delete: destroy } = useForm();
    const { post: setPrimary } = useForm();
    const { post: updateOrder } = useForm();
  
    React.useEffect(() => {
      if (success) {
        toast.success(success);
      }
    }, [success]);
  
    const handleDelete = (id: number) => {
      destroy(route('product-images.destroy', id), {
        onSuccess: () => {
          toast.success('Image deleted successfully');
        },
        onError: () => {
          toast.error('Failed to delete image');
        }
      });
    };
  
    const handleSetPrimary = (id: number) => {
      setPrimary(route('product-images.set-primary', id), {
        onSuccess: () => {
          toast.success('Primary image updated');
        },
        onError: () => {
          toast.error('Failed to update primary image');
        }
      });
    };
  
    const onDragEnd = (result: DropResult) => {
      if (!result.destination) return;
      
      const items = Array.from(reorderedImages);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      
      // Update the display order based on new positions
      const updatedItems = items.map((item, index) => ({
        ...item,
        display_order: index + 1
      }));
      
      setReorderedImages(updatedItems);
    };
  
    const saveOrder = () => {
      updateOrder(route('product-images.update-order', product.id), {
        ...reorderedImages.map((img) => ({
          id: img.id,
          display_order: img.display_order
        })),
        preserveScroll: true,
        onSuccess: () => {
          toast.success('Image order updated');
        },
        onError: () => {
          toast.error('Failed to update image order');
        }
      });
    };
  
    return (
      <DashboardLayout title={`${product.name} - Images`}>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Product Images</h1>
              <p className="text-muted-foreground">
                Manage images for {product.name}
              </p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" asChild>
                <Link href={route('products.show', product.id)}>Back to Product</Link>
              </Button>
              <Button asChild>
                <Link href={route('product-images.create', product.id)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Images
                </Link>
              </Button>
            </div>
          </div>
  
          {reorderedImages.length > 0 ? (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium mb-4">Image Gallery Preview</h2>
                <Carousel className="w-full max-w-4xl mx-auto">
                  <CarouselContent>
                    {reorderedImages.map((image) => (
                      <CarouselItem key={image.id} className="basis-full md:basis-1/2 lg:basis-1/3">
                        <div className="p-1">
                          <Card>
                            <CardContent className="flex aspect-square items-center justify-center p-2 relative">
                              <img 
                                src={`/storage/${image.image_path}`} 
                                alt={image.alt_text || product.name} 
                                className="w-full h-full object-cover rounded"
                              />
                              {image.is_primary && (
                                <div className="absolute top-3 right-3 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full">
                                  Primary
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-1" />
                  <CarouselNext className="right-1" />
                </Carousel>
              </div>
  
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">Manage Images</h2>
                  <Button onClick={saveOrder} variant="outline">Save Order</Button>
                </div>
  
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="images">
                    {(provided: DroppableProvided) => (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[80px]">Order</TableHead>
                            <TableHead>Image</TableHead>
                            <TableHead>Alt Text</TableHead>
                            <TableHead className="text-center">Primary</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                          {reorderedImages.map((image, index) => (
                            <Draggable key={image.id} draggableId={String(image.id)} index={index}>
                              {(provided: DraggableProvided) => (
                                <TableRow
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                >
                                  <TableCell className="w-[80px]">
                                    <div className="flex items-center">
                                      <div 
                                        {...provided.dragHandleProps}
                                        className="cursor-move p-2 hover:bg-gray-100 rounded mr-2"
                                      >
                                        <Move className="h-4 w-4 text-muted-foreground" />
                                      </div>
                                      {image.display_order}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-3">
                                      <div className="h-16 w-16 overflow-hidden rounded border bg-gray-50">
                                        <img 
                                          src={`/storage/${image.image_path}`} 
                                          alt={image.alt_text || product.name}
                                          className="h-full w-full object-cover" 
                                        />
                                      </div>
                                      <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                        {image.image_path}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {image.alt_text || <span className="text-muted-foreground">No alt text</span>}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {image.is_primary ? (
                                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100">
                                        <Star className="h-3 w-3 text-yellow-500" />
                                      </span>
                                    ) : (
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => handleSetPrimary(image.id)}
                                        className="h-6 w-6 p-0"
                                      >
                                        <Star className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-red-500">
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete this image.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction 
                                            onClick={() => handleDelete(image.id)}
                                            className="bg-red-500 hover:bg-red-600"
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </TableCell>
                                </TableRow>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </TableBody>
                      </Table>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="flex flex-col items-center justify-center gap-2">
                <Image className="h-12 w-12 text-gray-400" />
                <h3 className="text-lg font-medium">No images uploaded yet</h3>
                <p className="text-muted-foreground">
                  Add images to showcase this product
                </p>
                <Button className="mt-4" asChild>
                  <Link href={route('product-images.create', product.id)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Images
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }
