import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEffect, useRef, type ReactNode } from 'react';

interface SortableWidgetItemProps {
  id: string;
  children: ReactNode;
  isEditMode: boolean;
}

const SortableWidgetItem = ({ id, children, isEditMode }: SortableWidgetItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: !isEditMode,
  });

  // Hard-kill context menu and touchstart default in edit mode
  useEffect(() => {
    const el = ref.current;
    if (!el || !isEditMode) return;

    const killContext = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const killTouch = (e: TouchEvent) => {
      e.preventDefault();
    };

    el.addEventListener('contextmenu', killContext, { passive: false });
    el.addEventListener('touchstart', killTouch, { passive: false });

    return () => {
      el.removeEventListener('contextmenu', killContext);
      el.removeEventListener('touchstart', killTouch);
    };
  }, [isEditMode]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const setRefs = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    (ref as any).current = node;
  };

  return (
    <div
      ref={setRefs}
      style={style}
      className={`${isEditMode ? 'jiggle cursor-grab active:cursor-grabbing' : ''} ${isDragging ? 'widget-lifted' : ''}`}
      {...(isEditMode ? { ...attributes, ...listeners } : {})}
    >
      {children}
    </div>
  );
};

export default SortableWidgetItem;
