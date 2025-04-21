import React, { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
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
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Pencil, Plus, Trash2, Star } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Product, ProductVideo } from '@/types/product';
import axios from 'axios';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from 'sweetalert2';




interface IndexProps {
  product: Product;
  videos: ProductVideo[];
}

export default function Index({ product, videos }: IndexProps) {
  const [videoList, setVideoList] = useState(videos);
  const [isReordering, setIsReordering] = useState(false);
  const { delete: destroy } = useForm();

  const handleDelete = (videoId: number) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if(result.isConfirmed){       
          destroy(route('product-videos.destroy', [product.id,videoId]), {
            onSuccess: () => {
              Swal.fire({
                title: 'Deleted!',
                text: 'Your Subcategory has been deleted.',
                icon: 'success',
                timer: 3000,
                showConfirmButton: false
              });
              setVideoList(videoList.filter(video => video.id !== videoId));
            }
          });
        }
      });
  };

  const handleSetFeatured = (videoId: number) => {
    axios.post(`/product-videos/${videoId}/set-featured`)
      .then(response => {
        Swal.fire({
          title: 'Success!',
          text: 'Video Marked as Featured',
          icon: 'success',
          timer: 4000,
          showConfirmButton: false
        });        
        // Update local state to reflect the change
        const updatedVideos = videoList.map(video => ({
          ...video,
          is_featured: video.id === videoId
        }));
        
        setVideoList(updatedVideos);
      })
      .catch(error => {
        Swal.fire({
          title: 'Error!',
          text: 'Error setting video as featured',
          icon: 'error',
          timer: 4000,
          showConfirmButton: false
        }); 
      });
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(videoList);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update display order based on new positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      display_order: index
    }));

    setVideoList(updatedItems);

    // Save the new order to the server
    axios.post(`/products/${product.id}/videos/update-order`, {
      videos: updatedItems.map(video => ({
        id: video.id,
        display_order: video.display_order
      }))
    })
    .then(response => {
      Swal.fire({
        title: 'Success!',
        text: 'Video order updated successfully',
        icon: 'success',
        timer: 4000,
        showConfirmButton: false
      });  
    })
    .catch(error => {
      Swal.fire({
        title: 'Error!',
        text: 'Error updating video order',
        icon: 'error',
        timer: 4000,
        showConfirmButton: false
      }); 
      console.error(error);
    });
  };
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Product', href: route('products.index') },
    { title: 'Show Product', href: route('products.show', product.id) },
    { title: 'Product Video', href: route('product-videos.index', product.id) },
  ];


  return (
    <DashboardLayout title={`Videos for ${product.name}`}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Product Videos</h1>
            <p className="text-muted-foreground">
              Manage videos for {product.name}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={route('products.show', product.id)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Product
              </Link>
            </Button>
            <Button asChild variant="outline" >
              <Link href={route('product-videos.create', product.id)}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Video
              </Link>
            </Button>
          </div>          
        </div>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
        <Card>
          <CardHeader>
            <CardTitle>Videos</CardTitle>
            <CardDescription>
              Drag and drop to reorder videos, set featured video, or edit video details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {videoList.length > 0 ? (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="videos">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead style={{ width: 50 }}>#</TableHead>
                            <TableHead>Thumbnail</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Provider</TableHead>
                            <TableHead>Video ID</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Featured</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {videoList.map((video, index) => (
                            <Draggable 
                              key={video.id.toString()} 
                              draggableId={video.id.toString()} 
                              index={index}
                            >
                              {(provided) => (
                                <TableRow
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <TableCell className="w-10">{index + 1}</TableCell>
                                  <TableCell>
                                    {video.thumbnail ? (
                                      <img 
                                        src={`/storage/${video.thumbnail}`} 
                                        alt={video.title} 
                                        className="h-12 w-20 object-cover rounded"
                                      />
                                    ) : (
                                      <div className="h-12 w-20 bg-gray-200 rounded flex items-center justify-center">
                                        <span className="text-xs text-gray-500">No thumbnail</span>
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell className="font-medium">{video.title}</TableCell>
                                  <TableCell>{video.video_provider?.name}</TableCell>
                                  <TableCell className="truncate max-w-[120px]">
                                    {video.video_id}
                                  </TableCell>
                                  <TableCell>
                                    <Badge 
                                      variant={video.status === 'active' ? 'secondary' : 'default'}
                                    >
                                      {video.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {video.is_featured ? (
                                      <Badge className="bg-yellow-500">
                                        <Star className="h-3 w-3 mr-1" />
                                        Featured
                                      </Badge>
                                    ) : (
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => handleSetFeatured(video.id)}
                                      >
                                        Set Featured
                                      </Button>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex space-x-2">
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        asChild
                                      >
                                        <Link href={route('product-videos.edit', [product.id, video.id])}>
                                          <Pencil className="h-4 w-4" />
                                        </Link>
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        className="text-red-500"
                                        onClick={() => handleDelete(video.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-gray-100 p-4 mb-4">
                  <video className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">No videos yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add videos to showcase your product features and functionality
                </p>
                <Button asChild>
                  <Link href={route('product-videos.create', product.id)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Video
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
