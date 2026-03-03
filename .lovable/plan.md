

## Update Events from New CSV, Fix Weather Times, Clean Up Ticker and Eats Icon

### 1. Replace Events Data Source with New CSV

**Copy file:** `user-uploads://Fall_River_Events_2026_Final.csv` to `src/data/Fall_River_Events_2026_Final.csv`

**Rewrite `src/data/events.ts`:**
- Import the new CSV instead of `fall_river_dashboard_master.csv`
- The new CSV has different columns: `Event Name, Date, Location, Category, Price, Direct Information Link`
- Update the parser to match these columns
- Map to the existing `CityEvent` interface: `name` from col 0, `date` from col 1, `location` from col 2, `sub` (category) from col 3, `cost` from col 4, `url` from col 5
- `time` and `desc` will be empty strings (not in the new CSV)
- Update `evTagMap` and `evClassMap` to include the new categories from the CSV: Arts, Music, Kids, Kids/Education, Family, Festival, Holiday

**Update `src/components/dashboard/EventsTab.tsx`:**
- Update the FILTERS array to match new categories: All, Music, Arts, Kids, Festival, Holiday, Family
- Update `tagStyles` and `leftBarColors` to cover new categories
- Since `desc` is empty, show the location text instead in the card body
- Since `time` is empty, hide the time line in the date block

### 2. Fix Weather Hourly Time Bug

The bug: `nowISO = now.toISOString().slice(0, 13)` produces a UTC hour string (e.g., `2026-03-03T03`) but the API returns local Eastern time strings (e.g., `2026-03-02T22`). This mismatch causes the index to fall back to 0, showing hours starting from midnight.

**Fix in `src/data/weather.ts`:**
- Instead of matching by ISO string, find the hourly index by comparing timestamps: parse each `times[idx]` as a Date and find the one closest to `now` without exceeding it
- This correctly handles timezone differences

### 3. Remove SRTA Price from Ticker

**Update `src/components/dashboard/Ticker.tsx`:**
- Remove the line `"SRTA Bus 101/102/103 -- $1.50 cash . $1.25 CharlieCard"`
- Keep other ticker items, updating any that reference old/mock events to use events from the new CSV

### 4. Better Eats Icon for Bottom Nav and Stats Widget

**Update `src/components/dashboard/BottomNav.tsx`:**
- Replace the current fork/knife SVG with a more recognizable and appealing icon -- a plate with utensils (fork on left, knife on right, plate circle in center)

**Update `src/components/dashboard/widgets/StatsWidget.tsx`:**
- Match the Local Eats icon to the new bottom nav icon for consistency

### Files Changed

| File | Changes |
|------|---------|
| `src/data/Fall_River_Events_2026_Final.csv` | Copy new CSV into project |
| `src/data/events.ts` | Rewrite parser for new CSV columns and new categories |
| `src/components/dashboard/EventsTab.tsx` | Update filters, tag colors, card layout for new data shape |
| `src/data/weather.ts` | Fix hourly time matching to use Date comparison instead of UTC string matching |
| `src/components/dashboard/Ticker.tsx` | Remove SRTA bus price line, update event references |
| `src/components/dashboard/BottomNav.tsx` | Replace Eats icon with plate + utensils design |
| `src/components/dashboard/widgets/StatsWidget.tsx` | Match Local Eats icon to new bottom nav icon |

