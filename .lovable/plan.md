

## Plan: Events Sorting, Eats Icon, MBTA Sizing, and Drag Handle

### 1. Sort events within each month group by date

**File: `src/components/dashboard/EventsTab.tsx`** (line 48)

The `groupByMonth` function preserves insertion order but doesn't explicitly sort events within each group. The source data is sorted, but to guarantee correctness, add `.sort()` on each group's events array by date before returning.

### 2. Eats icon: Add a rounded square border around the fork

**File: `src/components/dashboard/BottomNav.tsx`** (lines 23-29)

Wrap the fork SVG paths inside a `<rect>` to give it a rounded square container, making it feel more "full":
```xml
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth={2}>
  <rect x="2" y="2" width="20" height="20" rx="5" />
  <path d="M13 6v4.5c0 1-0.8 1.8-1.8 1.8S9.4 11.5 9.4 10.5V6" />
  <path d="M11.2 6v4.5" />
  <path d="M11.2 12.3v5.7" />
</svg>
```

### 3. Match MBTA card size to SRTA card

**File: `src/components/dashboard/widgets/MbtaWidget.tsx`**

The MBTA card has extra content (station selector, two Select dropdowns vs one) making it taller. Compact its layout:
- Merge route + station selectors onto the same row as the header badge
- Reduce the countdown text from `text-3xl` to `text-4xl` to match SRTA's `text-4xl` (or vice versa -- standardize both to `text-3xl`)
- Actually SRTA uses `text-4xl` for countdown while MBTA uses `text-3xl`. Standardize both to `text-3xl`
- Move the station selector inline with the route selector to save vertical space

### 4. Replace drag handle bar with corner grip button

**File: `src/components/dashboard/DraggableWidget.tsx`**

Replace the centered horizontal pill (`w-10 h-1 rounded-full`) with a small corner grip button positioned at the top-right of the widget. This will be a 32x32 touch target with a 6-dot grip icon, much easier to grab on mobile:

```tsx
<button
  ref={setActivatorNodeRef}
  {...attributes}
  {...listeners}
  className="absolute top-2 right-2 w-8 h-8 rounded-xl bg-muted/60 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none z-10 opacity-40 group-hover:opacity-70 hover:!opacity-100 transition-opacity duration-300"
  aria-label="Drag to reorder"
>
  <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor" className="text-muted-foreground">
    <circle cx="4" cy="2" r="1.5" />
    <circle cx="10" cy="2" r="1.5" />
    <circle cx="4" cy="7" r="1.5" />
    <circle cx="10" cy="7" r="1.5" />
    <circle cx="4" cy="12" r="1.5" />
    <circle cx="10" cy="12" r="1.5" />
  </svg>
</button>
```

Remove the centered bar div entirely. The widget container gets `relative` (already has it) so the absolute-positioned button sits in the corner.

### Summary

| Change | File | Detail |
|--------|------|--------|
| Sort events by date | `EventsTab.tsx` | Sort within each month group |
| Eats icon with square | `BottomNav.tsx` | Add rounded rect around fork |
| MBTA matches SRTA size | `MbtaWidget.tsx` | Compact layout, standardize countdown size |
| Corner drag button | `DraggableWidget.tsx` | Replace bar with 6-dot corner button |

