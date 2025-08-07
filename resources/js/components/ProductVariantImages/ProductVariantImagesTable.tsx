import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { GripVertical, Trash2, Star } from 'lucide-react';
import { ProductVariantImage } from './ProductVariantImageCarousel';

interface ProductVariantImagesTableProps {
  images: ProductVariantImage[];
  onDelete: (id: number) => void;
  onSetPrimary: (id: number) => void;
  onDragEnd: (result: DropResult) => void;
}

export function ProductVariantImagesTable({
  images,
  onDelete,
  onSetPrimary,
  onDragEnd
}: ProductVariantImagesTableProps) {
  const [deleteImageId, setDeleteImageId] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-medium">Manage Images</h3>
        <p className="text-sm text-gray-500">Drag and drop to reorder images</p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="images-table">
          {(provided) => (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Alt Text</TableHead>
                  <TableHead>Primary</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                {images.map((image, index) => (
                  <Draggable
                    key={image.id.toString()}
                    draggableId={image.id.toString()}
                    index={index}
                  >
                    {(provided: DraggableProvided) => (
                      <TableRow
                        ref={provided.innerRef}
                        {...provided.draggableProps}

                      >
                        <TableCell>
                          <div {...provided.dragHandleProps} className="cursor-grab">
                            <GripVertical className="h-4 w-4 text-gray-400" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <img
                            src={`/storage/${image.image_path}`}
                            alt={image.alt_text || 'Variant image'}
                            className="w-16 h-16 object-cover rounded"
                          />
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{image.alt_text || '-'}</span>
                        </TableCell>
                        <TableCell>
                          {image.is_primary ? (
                            <Badge variant="default">
                              <Star className="w-3 h-3 mr-1" />
                              Primary
                            </Badge>
                          ) : (
                            <Button
                              variant="outline"
                              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                              size="sm"
                              onClick={() => onSetPrimary(image.id)}
                            >
                              Set Primary
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-500">{image.display_order}</span>
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setDeleteImageId(image.id)}
                                className="cursor-pointer hover:bg-red-100 dark:hover:bg-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Image</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this image? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDeleteImageId(null)} className='cursor-pointer'>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    if (deleteImageId) {
                                      onDelete(deleteImageId);
                                      setDeleteImageId(null);
                                    }
                                  }}
                                  className="bg-red-600 hover:bg-red-700 cursor-pointer"
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
  );
}
