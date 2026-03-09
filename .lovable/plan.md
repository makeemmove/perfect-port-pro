

## Plan: Fix Kids color + Coming Up missing dates

### Issues identified

1. **Events Tab**: Kids category uses `bg-emerald-200` — too light/invisible on white cards. User wants **blue**.
2. **Coming Up (SortableEventItem)**: Some events show no date in the badge because `new Date(event.date)` returns `Invalid Date` — the month/day render as blank. Need a fallback.

### Changes

#### `src/components/dashboard/EventsTab.tsx`
- Change `kids` color from `bg-emerald-200 / text-emerald-800` → `bg-blue-200 / text-blue-800`

#### `src/components/dashboard/widgets/SortableEventItem.tsx`
- Change `Kids` color from `bg-amber-500` → `bg-blue-500` (match Events tab)
- Add invalid-date guard: if date is invalid, show `"TBD"` or similar text instead of blank month/day
- Ensure the date badge always renders with genre color even when date is missing

