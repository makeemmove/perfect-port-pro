import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import type { CityEvent } from '@/data/events';
import SortableEventItem from './SortableEventItem';

interface ComingUpWidgetProps {
  upcomingEvents: CityEvent[];
  onEventClick?: (event: CityEvent) => void;
  eventOrder: number[];
  onReorderEvents: (newOrder: number[]) => void;
}

const ComingUpWidget = ({ upcomingEvents, onEventClick, eventOrder, onReorderEvents }: ComingUpWidgetProps) => {
  const orderedEvents = eventOrder
    .filter(i => i < upcomingEvents.length)
    .map(i => ({ index: i, event: upcomingEvents[i] }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = eventOrder.indexOf(Number(active.id));
      const newIndex = eventOrder.indexOf(Number(over.id));
      onReorderEvents(arrayMove(eventOrder, oldIndex, newIndex));
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground mt-4 mb-2
                      before:flex-1 before:h-px before:bg-border/60
                      after:flex-1 after:h-px after:bg-border/60">
        ⚡ Coming Up
      </div>
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={eventOrder.map(String)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3 pb-2">
            {orderedEvents.map(({ index, event }) => (
              <SortableEventItem
                key={index}
                id={String(index)}
                event={event}
                onEventClick={onEventClick}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </>
  );
};

export default ComingUpWidget;
