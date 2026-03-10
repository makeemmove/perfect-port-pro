

## Plan: Fix EventsTab date badges using inline styles

The same Tailwind purging issue that affected `SortableEventItem` is happening here. Dynamic Tailwind classes like `bg-blue-500` assembled from variables get purged at build time. The fix is to switch `dateBadgeColors` to hex inline styles, matching the approach already used in `SortableEventItem.tsx`.

### Changes

#### `src/components/dashboard/EventsTab.tsx`
- Convert `dateBadgeColors` from Tailwind classes to hex color values
- Update the date badge `div` (around line 119) to use `style={{ backgroundColor, color }}` instead of className interpolation

Colors:
- arts: `#fbb6ce` / `#831843`
- music: `#c7d2fe` / `#3730a3`
- kids: `#3b82f6` / `#ffffff`
- family: `#fed7aa` / `#9a3412`
- festival: `#fde68a` / `#92400e`
- holiday: `#fecaca` / `#991b1b`
- community: `#fed7aa` / `#9a3412`
- education: `#99f6e4` / `#115e59`
- theater: `#e9d5ff` / `#6b21a8`

