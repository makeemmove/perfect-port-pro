import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CityEvent } from '@/data/events';

const genreColors: Record<string, { bg: string; text: string }> = {
  Music:     { bg: 'bg-indigo-500',  text: 'text-white' },
  Arts:      { bg: 'bg-pink-500',    text: 'text-white' },
  Theater:   { bg: 'bg-pink-600',    text: 'text-white' },
  Community: { bg: 'bg-orange-500',  text: 'text-white' },
  Family:    { bg: 'bg-orange-400',  text: 'text-white' },
  Kids:      { bg: 'bg-blue-500',    text: 'text-white' },
  Education: { bg: 'bg-teal-500',    text: 'text-white' },
  Festival:  { bg: 'bg-yellow-500',  text: 'text-yellow-950' },
  Holiday:   { bg: 'bg-red-500',     text: 'text-white' },
};
const defaultColor = { bg: 'bg-blue-500', text: 'text-white' };

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
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
    zIndex: isDragging ? 50 : 'auto' as const
  };

  const d = new Date(event.date);
  const validDate = !isNaN(d.getTime());
  const month = validDate ? d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : '';
  const day = validDate ? d.getDate() : '—';
  const colors = genreColors[event.sub] || defaultColor;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 py-3 px-4 glass-card active:scale-[0.98] transition-all duration-300 ease-in-out group/event"
    >
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="p-0.5 rounded opacity-30 group-hover/event:opacity-60 hover:!opacity-100 cursor-grab active:cursor-grabbing touch-none text-muted-foreground flex-shrink-0"
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
      <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center flex-shrink-0 ${colors.bg} ${colors.text}`}>
        <span className="text-[9px] font-bold leading-none tracking-wide">{month}</span>
        <span className="text-[15px] font-extrabold leading-tight">{day}</span>
      </div>
      <div className="text-[13px] font-semibold flex-1 whitespace-nowrap overflow-hidden text-ellipsis text-foreground">
        {event.name}
      </div>
      {onEventClick && (
        <button
          onClick={() => onEventClick(event)}
          className="text-[9px] font-bold tracking-wider uppercase py-1 px-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-300 flex-shrink-0"
        >
          Info
        </button>
      )}
    </div>
  );
};

export default SortableEventItem;
