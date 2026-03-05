import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { ReactNode } from 'react';

interface SortableWidgetItemProps {
  id: string;
  children: ReactNode;
  isEditMode: boolean;
}

const SortableWidgetItem = ({ id, children, isEditMode }: SortableWidgetItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: !isEditMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isEditMode ? 'jiggle' : ''} ${isDragging ? 'widget-lifted' : ''}`}
    >
      {isEditMode && (
        <div
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="drag-handle-tab absolute top-2 right-2 z-30 w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" strokeWidth={2.5} />
        </div>
      )}
      {children}
    </div>
  );
};

export default SortableWidgetItem;
