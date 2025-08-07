
import React from 'react';
import { ProductImage } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Move, Star, Trash2 } from 'lucide-react';
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

interface ProductImagesTableProps {
  images: ProductImage[];
  onDelete: (id: number) => void;
  onSetPrimary: (id: number) => void;
  onDragEnd: (result: DropResult) => void;
}

export function ProductImagesTable({
  images,
  onDelete,
  onSetPrimary,
  onDragEnd
}: ProductImagesTableProps) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="images">
        {(provided) => (
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
              {images.map((image, index) => (
                <Draggable key={image.id} draggableId={String(image.id)} index={index}>
                  {(provided) => (
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
                              alt={image.alt_text || 'Product image'}
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
                            onClick={() => onSetPrimary(image.id)}
                            className="h-6 w-6 p-0 cursor-pointer"
                          >
                            <Star className="h-3 w-3" />
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon" className=" text-red-600 hover:bg-red-50 cursor-pointer">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription >
                                This action cannot be undone. This will permanently delete this image.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDelete(image.id)}
                                className="bg-red-500 hover:bg-red-600 cursor-pointer"
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
  );
}
