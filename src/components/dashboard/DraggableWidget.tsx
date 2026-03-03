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
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-muted/60 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none z-10 opacity-40 group-hover:opacity-70 hover:!opacity-100 transition-opacity duration-300"
        aria-label="Drag to reorder"
      >
        <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor" className="text-muted-foreground">
          <circle cx="4" cy="2" r="1.5" />
          <circle cx="10" cy="2" r="1.5" />
          <circle cx="4" cy="7" r="1.5" />
          <circle cx="10" cy="7" r="1.5" />
          <circle cx="4" cy="12" r="1.5" />
          <circle cx="10" cy="12" r="1.5" />
        </svg>
      </button>
      {children}
    </div>
  );
};

export default DraggableWidget;
