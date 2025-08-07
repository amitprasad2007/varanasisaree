declare module '@hello-pangea/dnd' {
  export interface DropResult {
    draggableId: string;
    type: string;
    source: {
      index: number;
      droppableId: string;
    };
    destination?: {
      index: number;
      droppableId: string;
    };
  }

  export interface DroppableProvided {
    innerRef: (element: HTMLElement | null) => void;
    droppableProps: {
      [key: string]: any;
    };
    placeholder?: React.ReactNode;
  }

  export interface DraggableProvided {
    innerRef: (element: HTMLElement | null) => void;
    draggableProps: {
      [key: string]: any;
    };
    dragHandleProps?: {
      [key: string]: any;
    };
  }

  export const DragDropContext: React.FC<{
    onDragEnd: (result: DropResult) => void;
    children: React.ReactNode;
  }>;

  export const Droppable: React.FC<{
    droppableId: string;
    children: (provided: DroppableProvided) => React.ReactNode;
  }>;

  export const Draggable: React.FC<{
    draggableId: string;
    index: number;
    children: (provided: DraggableProvided) => React.ReactNode;
  }>;
}
