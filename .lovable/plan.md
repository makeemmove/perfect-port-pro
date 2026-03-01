

## Unify Transit Widgets, Sortable Coming Up Events, Reorder Weather

### 1. Match MBTA and SRTA Widget Sizing and Font

Both widgets will use identical padding, countdown font size, and label sizes.

**`src/components/dashboard/widgets/SrtaWidget.tsx`**
- Change outer div from `p-4` to `p-5` (match MBTA)
- Add `mb-3` to the header row (match MBTA's spacing)
- Change route name button from `text-[13px]` to `text-sm` (match MBTA)
- Change countdown from `text-3xl font-light` to `text-4xl font-semibold tracking-tight` (match MBTA)
- Add `mt-3` wrapper around the countdown/departs row (match MBTA layout)
- Move `busAfter` and hint text outside the flex row with `mt-2` and `mt-1` (match MBTA structure)

### 2. Make Coming Up Events Individually Sortable

Turn the Coming Up section into its own mini drag-and-drop list so users can grab any event and move it to the top or bottom.

**`src/components/dashboard/widgets/ComingUpWidget.tsx`**
- Import `DndContext`, `SortableContext`, `verticalListSortingStrategy`, `arrayMove`, `closestCenter` from dnd-kit
- Import `restrictToVerticalAxis` modifier
- Accept new props: `eventOrder: number[]` and `onReorderEvents: (newOrder: number[]) => void`
- Wrap event list in its own `DndContext` + `SortableContext`
- Each event row becomes a sortable item (using index as ID)
- Add a small drag handle (grip dots icon) on the left side of each event row
- Call `onReorderEvents` on drag end with the new index array

**`src/components/dashboard/HomeTab.tsx`**
- Add state: `eventOrder: number[]` initialized as `[0,1,2,3,4,5]`
- Pass `eventOrder` and `onReorderEvents` to ComingUpWidget
- ComingUpWidget renders events in the user's custom order

### 3. Move Weather Under Coming Up in Default Order

**`src/components/dashboard/HomeTab.tsx`**
- Change `DEFAULT_ORDER` from `['stats', 'coming-up', 'srta', 'mbta', 'weather']` to `['stats', 'coming-up', 'weather', 'srta', 'mbta']`

Note: Existing users with a saved order in localStorage will keep their arrangement. Only new users or after clearing storage will see the new default.

### Files Changed

| File | Action |
|------|--------|
| `src/components/dashboard/widgets/SrtaWidget.tsx` | Unify padding, font sizes, and layout to match MBTA widget |
| `src/components/dashboard/widgets/ComingUpWidget.tsx` | Add per-event drag-and-drop reordering |
| `src/components/dashboard/HomeTab.tsx` | Add event order state, change default widget order |

### No Changes To
- Camera angle, 3D styling, or any visual theme
- MBTA widget (it's the reference -- SRTA matches it)
- Any other components

