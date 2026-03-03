import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ReactNode } from 'react';

interface DraggableWidgetProps {
  id: string;
  children: ReactNode;
}

const DraggableWidget = ({ id, children }: DraggableWidgetProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 0.3s ease-in-out',
    opacity: isDragging ? 0.92 : 1,
    zIndex: isDragging ? 50 : 'auto' as const,
    scale: isDragging ? '1.02' : '1',
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group mb-2">
      <div
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="flex justify-center pt-2 pb-1.5 cursor-grab active:cursor-grabbing touch-none"
        aria-label="Drag to reorder"
      >
        <div className="w-10 h-1 rounded-full bg-muted-foreground/15" />
      </div>
      {children}
    </div>
  );
};

export default DraggableWidget;
