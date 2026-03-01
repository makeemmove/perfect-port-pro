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
    transition,
    opacity: isDragging ? 0.92 : 1,
    zIndex: isDragging ? 50 : 'auto' as const,
    scale: isDragging ? '1.02' : '1',
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Drag handle */}
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 z-10 p-1.5 rounded-lg opacity-0 group-hover:opacity-60 hover:!opacity-100 
                   transition-opacity cursor-grab active:cursor-grabbing touch-none
                   bg-muted/60 hover:bg-muted text-muted-foreground"
        aria-label="Drag to reorder"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <circle cx="4" cy="2" r="1.2" />
          <circle cx="10" cy="2" r="1.2" />
          <circle cx="4" cy="7" r="1.2" />
          <circle cx="10" cy="7" r="1.2" />
          <circle cx="4" cy="12" r="1.2" />
          <circle cx="10" cy="12" r="1.2" />
        </svg>
      </button>
      {children}
    </div>
  );
};

export default DraggableWidget;
