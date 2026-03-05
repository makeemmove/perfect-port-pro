import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isEditMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isEditMode ? 'jiggle cursor-grab active:cursor-grabbing' : ''} ${isDragging ? 'widget-lifted' : ''}`}
      {...(isEditMode ? { ...attributes, ...listeners } : {})}
    >
      {children}
    </div>
  );
};

export default SortableWidgetItem;
