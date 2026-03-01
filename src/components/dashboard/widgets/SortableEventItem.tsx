import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CityEvent } from '@/data/events';

interface SortableEventItemProps {
  id: string;
  event: CityEvent;
  onEventClick?: (event: CityEvent) => void;
}

const SortableEventItem = ({ id, event, onEventClick }: SortableEventItemProps) => {
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
    opacity: isDragging ? 0.85 : 1,
    zIndex: isDragging ? 50 : 'auto' as const,
  };

  const d = new Date(event.date);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 py-2.5 px-3.5 rounded-xl bg-card border border-border shadow-card hover:shadow-card-hover transition-shadow group/event"
    >
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="p-0.5 rounded opacity-40 group-hover/event:opacity-70 hover:!opacity-100 cursor-grab active:cursor-grabbing touch-none text-muted-foreground flex-shrink-0"
        aria-label="Drag to reorder"
      >
        <svg width="10" height="10" viewBox="0 0 14 14" fill="currentColor">
          <circle cx="4" cy="2" r="1.3" />
          <circle cx="10" cy="2" r="1.3" />
          <circle cx="4" cy="7" r="1.3" />
          <circle cx="10" cy="7" r="1.3" />
          <circle cx="4" cy="12" r="1.3" />
          <circle cx="10" cy="12" r="1.3" />
        </svg>
      </button>
      <div className="w-2 h-2 rounded-full flex-shrink-0 bg-secondary" />
      <div className="text-[13px] font-medium flex-1 whitespace-nowrap overflow-hidden text-ellipsis text-foreground">
        {event.name}
      </div>
      <div className="mono text-[10px] text-muted-foreground flex-shrink-0">
        {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </div>
      {onEventClick && (
        <button
          onClick={() => onEventClick(event)}
          className="text-[9px] font-semibold tracking-wide uppercase py-[2px] px-2 rounded-full bg-foreground/5 text-foreground border border-border hover:bg-foreground/10 transition-colors flex-shrink-0"
        >
          Info
        </button>
      )}
    </div>
  );
};

export default SortableEventItem;
