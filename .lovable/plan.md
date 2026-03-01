

## Reorderable Dashboard Widgets with Drag-and-Drop

### Overview
Each section on the Home tab (Weather, MBTA, Quick Stats, SRTA, Coming Up) becomes a standalone widget card that users can drag to reorder. The new order persists across sessions using localStorage. All existing functionality (live timers, route selection, popovers) remains fully intact.

### Library Choice
Install `@dnd-kit/core` and `@dnd-kit/sortable` -- the modern, lightweight, accessible drag-and-drop library for React. It supports vertical sortable lists with smooth animations, placeholder ghosts, and works purely on DOM transforms (no layout thrashing that would affect the current visual style).

### Implementation Steps

**1. Install dependencies**
- `@dnd-kit/core`
- `@dnd-kit/sortable`
- `@dnd-kit/utilities` (for CSS transform helper)

**2. Extract each section into its own widget component**

Create a new file `src/components/dashboard/widgets/` with individual components:
- `WeatherWidget` -- the weather card (extracted from HomeTab)
- `MbtaWidget` -- the MBTA commuter rail card with route/station selectors and countdown
- `SrtaWidget` -- the SRTA bus card with route selector and countdown
- `StatsWidget` -- the 2-column quick stats grid (Events This Week + Local Eats)
- `ComingUpWidget` -- the "Coming Up" events list

Each widget receives its data/state via props from HomeTab (the parent keeps all state and the `tick()` logic unchanged).

**3. Add a `DraggableWidget` wrapper component**

A small wrapper that uses `useSortable()` from dnd-kit. It renders:
- A drag handle icon (6-dot grip icon) in the top-right corner of each card
- The widget content as children
- Applies the `transform` and `transition` styles from dnd-kit for smooth animation
- While dragging: the item gets a slight scale-up and elevated shadow; the placeholder spot shows a dashed border ghost

**4. Update HomeTab to orchestrate drag-and-drop**

```text
HomeTab
  |-- Header (not draggable, stays pinned at top)
  |-- DndContext + SortableContext
       |-- DraggableWidget id="weather"  --> WeatherWidget
       |-- DraggableWidget id="mbta"     --> MbtaWidget
       |-- DraggableWidget id="stats"    --> StatsWidget
       |-- DraggableWidget id="srta"     --> SrtaWidget
       |-- DraggableWidget id="coming-up"--> ComingUpWidget
```

- Widget order stored as `widgetOrder` state: `string[]` defaulting to `['weather','mbta','stats','srta','coming-up']`
- On `onDragEnd`, compute new order using `arrayMove` from `@dnd-kit/sortable` and save to both state and `localStorage`
- On mount, read saved order from `localStorage` (key: `fr-widget-order`)
- Use `restrictToVerticalAxis` modifier from `@dnd-kit/modifiers` to prevent horizontal movement
- Use `closestCenter` collision detection strategy

**5. Drag interaction design**

- **Drag handle**: A small grip icon (three horizontal lines or 6-dot grid) appears at the top-right of each widget card. Only the handle initiates dragging -- tapping the card body still works normally for popovers, selects, etc.
- **While dragging**: The dragged card gets `opacity: 0.95`, `scale: 1.02`, and `shadow-lg`. The drop zone shows a 2px dashed primary-colored border placeholder.
- **Snap**: Cards animate into position with a 200ms ease transition via dnd-kit's built-in CSS transform transitions.

**6. Persistence**

- Save widget order to `localStorage` under key `fr-widget-order` on every reorder
- On page load, restore from localStorage; fall back to default order if not found
- No server/database needed

### What stays the same
- All state management (clock, weather, transit countdowns, route selection) remains in HomeTab -- unchanged
- The visual design, colors, card styles, rounded corners, shadows -- all identical
- The existing scroll behavior inside the Home tab container
- The Ticker, BottomNav, and other tabs are not affected
- Route selection popovers and Select dropdowns continue to work -- the drag handle is the only drag trigger

### Files changed
| File | Action |
|------|--------|
| `package.json` | Add `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `@dnd-kit/modifiers` |
| `src/components/dashboard/DraggableWidget.tsx` | New -- sortable wrapper with drag handle |
| `src/components/dashboard/HomeTab.tsx` | Refactor: extract widget sections into sub-components, wrap in DndContext/SortableContext, add order state + localStorage persistence |

