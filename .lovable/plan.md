

## Plan: Mobile Long-Press Drag + Desktop Unchanged

### Approach

Use `@dnd-kit`'s built-in sensors to differentiate mobile vs desktop behavior. On desktop, keep the activator-based corner grip. On mobile, use `TouchSensor` with a long-press delay (350ms) on the entire card, hide the grip button, and add visual feedback.

### Changes

#### 1. `src/components/dashboard/HomeTab.tsx`
- Import `useSensors`, `useSensor`, `PointerSensor`, `TouchSensor` from `@dnd-kit/core`
- Configure sensors:
  - `PointerSensor` with `activationConstraint: { distance: 5 }` (desktop — requires slight movement, works with activator)
  - `TouchSensor` with `activationConstraint: { delay: 350, tolerance: 5 }` (mobile — long-press anywhere)
- Pass `sensors` to `<DndContext>`
- Track `activeId` state via `onDragStart`/`onDragEnd` to pass down for visual feedback
- Add mobile-only hint text `"Press & hold to reorder"` under the header, hidden on `md:` screens

#### 2. `src/components/dashboard/DraggableWidget.tsx`
- Accept new props: `isMobile: boolean`, `isAnyDragging: boolean`
- On mobile (`isMobile`):
  - Remove `setActivatorNodeRef` — attach `listeners` + `attributes` to the entire card div instead
  - Hide the corner grip button
  - Add `select-none` and `-webkit-user-select: none` to prevent text selection/copy-paste popup
  - When `isDragging`: scale 1.03, enhanced shadow, slight border highlight
  - When `isAnyDragging && !isDragging`: fade to opacity 0.5
- On desktop (`!isMobile`):
  - Keep current behavior exactly: activator ref on corner button, button visible
- Add CSS `touch-action: none` on the card when mobile to prevent scroll during drag
- Smooth snap: use `transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)'` on drop

#### 3. `src/hooks/use-mobile.tsx`
- Already exists with `useIsMobile()` hook at 768px breakpoint — reuse as-is

### Visual Feedback Summary (mobile only)

| State | Effect |
|-------|--------|
| Long-press activates | Card scales to 1.03, shadow deepens |
| Dragging | Dragged card elevated, siblings fade to 50% opacity |
| Drop | Smooth 0.3s snap animation |
| Idle | No grip icon visible, clean card surface |

