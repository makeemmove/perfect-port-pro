import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ReactNode } from 'react';

interface DraggableWidgetProps {
  id: string;
  children: ReactNode;
  isMobile?: boolean;
  isAnyDragging?: boolean;
}

const DraggableWidget = ({ id, children, isMobile = false, isAnyDragging = false }: DraggableWidgetProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const baseTransform = CSS.Transform.toString(transform);
  
  const style = isMobile
    ? {
        transform: isDragging
          ? `${baseTransform || ''} scale(1.03)`.trim()
          : baseTransform || undefined,
        transition: transition || 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.25s ease, box-shadow 0.25s ease',
        opacity: isDragging ? 1 : isAnyDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 'auto' as const,
        boxShadow: isDragging ? '0 12px 28px -4px rgba(0,0,0,0.18), 0 4px 10px -2px rgba(0,0,0,0.1)' : undefined,
        touchAction: 'none' as const,
        WebkitUserSelect: 'none' as const,
        userSelect: 'none' as const,
      }
    : {
        transform: baseTransform || undefined,
        transition: transition || 'transform 0.3s ease-in-out',
        opacity: isDragging ? 0.92 : 1,
        zIndex: isDragging ? 50 : 'auto' as const,
        scale: isDragging ? '1.02' : '1',
      };

  // Mobile: listeners on entire card, no grip button
  if (isMobile) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="relative mb-2 select-none"
        {...attributes}
        {...listeners}
      >
        {children}
      </div>
    );
  }

  // Desktop: activator on corner grip button
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
