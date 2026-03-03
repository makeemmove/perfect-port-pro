

## Plan: Replace Drag-and-Drop with Arrow Buttons

### Changes

#### 1. `src/components/dashboard/DraggableWidget.tsx` — Full rewrite
- Remove all `@dnd-kit/sortable` usage, `useSortable`, transforms, drag listeners
- Accept new props: `onMoveUp?: () => void`, `onMoveDown?: () => void` (undefined means can't move that direction)
- Render a simple wrapper `<div>` with `relative mb-2` class
- In the top-right corner, render a small button group with `ChevronUp` and/or `ChevronDown` icons from `lucide-react`
  - Only show up arrow if `onMoveUp` is provided
  - Only show down arrow if `onMoveDown` is provided
  - Buttons: 28x28px circles, `bg-accent/15` background, `text-accent` icon color (teal), subtle hover state
  - Stack vertically, positioned `absolute top-2 right-2`, with a small gap
  - `z-10` so they don't get covered

#### 2. `src/components/dashboard/HomeTab.tsx`
- Remove all DnD imports (`DndContext`, `SortableContext`, `closestCenter`, `DragEndEvent`, `DragStartEvent`, `PointerSensor`, `TouchSensor`, `useSensor`, `useSensors`, `restrictToVerticalAxis`, `arrayMove` from sortable)
- Remove `activeId` state, `sensors`, `handleDragStart`, `handleDragEnd`
- Remove the `<DndContext>` and `<SortableContext>` wrappers
- Remove the "Press & hold to reorder" text (line 217-219)
- Add a `moveWidget(id, direction)` function that swaps widget positions in `widgetOrder` and saves to localStorage
- Render widgets with `onMoveUp` / `onMoveDown` props based on index position:
  - First widget: only `onMoveDown`
  - Last widget: only `onMoveUp`
  - Middle widgets: both

#### Files unchanged
All other files, colors, layout, fonts — untouched.

