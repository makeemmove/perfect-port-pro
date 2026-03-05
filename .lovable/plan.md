

## Plan: Replace Events CSV & Modernize Events Tab

### 1. Replace events CSV with new data

**`src/data/events_2026.csv`** — Completely replace contents with the uploaded `fall_river_events_final_55.csv` (55 events). This is the sole data source — old events are gone.

New categories in CSV that need handling in `normalizeEventType`: `Games/Pub`, `Food`, `Sports`, `Family/Games`, `Meetup`, `Workshop`. Will update the normalizer to map these appropriately.

### 2. Update event type normalizer

**`src/data/events.ts`** — Add mappings:
- `games`, `pub`, `sports`, `wrestling` → `Community`
- `food` → `Community`
- `family` → `Community`
- `meetup` → `Community`
- `workshop` → `Education`

### 3. Modernize Events Tab design

**`src/components/dashboard/EventsTab.tsx`** — Refresh the visual design:

- **Filter pills**: Gradient background on active state, slightly larger with icon-only compact mode, smooth horizontal scroll
- **Event cards**: Remove the left color bar, use a more modern card with subtle gradient accent on the date badge instead. Date badge gets a colored background matching category. Increase card border-radius, add hover elevation effect
- **Month dividers**: Cleaner sticky header style with bold month name, no decorative lines
- **Category tags**: Pill badges with subtle gradient backgrounds instead of flat colors
- **"More Info" button**: Replace with a chevron-right arrow icon for cleaner look
- **Overall spacing**: Tighter vertical rhythm, cards closer together

### Files to edit
1. `src/data/events_2026.csv` — replace with new 55-event CSV
2. `src/data/events.ts` — update normalizer for new categories
3. `src/components/dashboard/EventsTab.tsx` — modern redesign

