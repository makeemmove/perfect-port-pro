

## Weather Accuracy, Clickable Stats, Remove Eats Map, Center Header

### 1. Fix Weather Hourly Accuracy

**`src/data/weather.ts`**
- Add `weather_code` to both the hourly and current API parameters in `WEATHER_URL`
- Use the existing `wcInfo()` function to map real weather codes to icons instead of guessing from precipitation amounts
- For hourly entries: use `d.hourly.weather_code[idx]` with `wcInfo()` to get accurate icons
- For current conditions: use `d.current.weather_code` with `wcInfo()` for the main icon/label
- Add `current=weather_code` and `hourly=weather_code` to the URL query string

### 2. Make Stats Cards Clickable (Navigate to Tabs)

**`src/components/dashboard/widgets/StatsWidget.tsx`**
- Accept a new prop: `onNavigate: (tab: 'eats' | 'events') => void`
- Wrap the "Events This Week" card in a clickable div that calls `onNavigate('events')`
- Wrap the "Local Eats" card in a clickable div that calls `onNavigate('eats')`
- Add `cursor-pointer` and hover effect to both cards

**`src/components/dashboard/HomeTab.tsx`**
- Accept a new prop: `onNavigate: (tab: 'eats' | 'events') => void`
- Pass `onNavigate` down to `StatsWidget`

**`src/pages/Index.tsx`**
- Pass `onTabChange` (renamed to match) as `onNavigate` prop to `HomeTab`

### 3. Remove Map from Eats Tab, Match Events Layout

**`src/components/dashboard/EatsTab.tsx`** -- Full rewrite
- Remove all Leaflet imports (`L`, map refs, markers, `COORDS` import)
- Replace with a card-based list matching EventsTab structure:
  - Header: "Eats" title with subtitle and utensils icon
  - Category filter bar (keep existing CATEGORIES array)
  - Card list with: colored left bar per category, restaurant name, truncated description, hours, price, category tag pill, "More Info" button
- Keep QuickViewModal integration unchanged
- Color mapping: Portuguese=#dc2626, Bakery=#d97706, Italian=#059669, Seafood=#0891b2, Asian=#7c3aed, Casual=#ea580c, Specialty=#db2777

**`src/pages/Index.tsx`** -- Update eats container
- Change eats tab wrapper from `flex flex-col` to `overflow-y-auto` with padding `18px 16px 76px` (same as other tabs)

### 4. Center the Header (Fall River + Date/Time)

**`src/components/dashboard/HomeTab.tsx`**
- Change the header from `justify-between` (left-aligned title, right-aligned "Live") to `text-center` centered layout
- "Fall River" title and clock text centered
- Move "Live" indicator above or below, or keep it inline but center the whole block

### Files Changed

| File | Changes |
|------|---------|
| `src/data/weather.ts` | Add `weather_code` to API URL, use `wcInfo()` for accurate hourly and current icons |
| `src/components/dashboard/widgets/StatsWidget.tsx` | Add `onNavigate` prop, make cards clickable |
| `src/components/dashboard/HomeTab.tsx` | Accept and pass `onNavigate`, center header |
| `src/pages/Index.tsx` | Pass `onTabChange` to HomeTab, change eats container to scrollable |
| `src/components/dashboard/EatsTab.tsx` | Remove Leaflet map, rewrite as card list matching EventsTab |

