

## Plan: Fix Early badge color, reorder widgets, add genre-colored date boxes

### 1. Fix "Early" status badge — make it green (not white/neutral)

The uploaded screenshot shows the "5 min Early" badge appears with a white/neutral background. Looking at the `TopStatusBadge` code, the early check uses `delayMin && delayMin < 0` — but this condition may fail if `delayMin` is `0` or `undefined` while the `status` string contains "early". 

**Fix:** Add a check for `status?.includes('early')` before the On Time fallback, and ensure the green styling (`bg-emerald-600 text-emerald-50`) is applied. Also fix the `StatusPill` in the popover/route view to match.

### 2. Move News section below Coming Up

In `HomeTab.tsx`, the default widget order is:
```
['news', 'stats', 'coming-up', 'weather', 'srta', 'mbta']
```

**Change to:** `['stats', 'coming-up', 'news', 'weather', 'srta', 'mbta']` — placing news after coming-up. Also clear localStorage so existing users get the new default.

### 3. Color-coded date boxes per genre on Coming Up events

Currently `SortableEventItem` shows a generic secondary-colored circle. Replace this with a small square date badge (like the Events tab) colored by the event's `sub` category, using the existing `dateBadgeColors` map from `EventsTab.tsx`.

**Changes in `SortableEventItem.tsx`:**
- Import color mapping (or define inline) matching genre to bg/text colors
- Replace the generic circle with a rounded square showing month/day, colored by `event.sub`

### Files to modify
- `src/components/dashboard/widgets/MbtaWidget.tsx` — fix TopStatusBadge early condition
- `src/components/dashboard/HomeTab.tsx` — reorder DEFAULT_ORDER
- `src/components/dashboard/widgets/SortableEventItem.tsx` — genre-colored date boxes

