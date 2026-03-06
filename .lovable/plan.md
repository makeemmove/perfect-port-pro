

# Plan: Clickable GPS Addresses + Event Color Coordination

## 1. Eats Addresses — GPS Navigation Links

The addresses are already clickable Google Maps links, but they use the **search** endpoint. To enable actual GPS navigation on mobile, change them to use Google Maps **directions** URL (`https://www.google.com/maps/dir/?api=1&destination=...`). This opens turn-by-turn navigation on mobile devices.

**File:** `src/components/dashboard/EatsTab.tsx` (line 107)
- Change from `maps/search/?api=1&query=` to `maps/dir/?api=1&destination=`
- This triggers navigation mode on mobile (Google Maps app opens with directions)

## 2. Event Date Badge Colors — Full Coverage

The `dateBadgeColors` map only has 6 entries (arts, music, kids, family, festival, holiday) and relies on an indirect `evClassMap` lookup. Some categories map correctly but the indirection is fragile. Fix: add explicit entries for **every** category so all events get proper color-coordinated date badges.

**File:** `src/components/dashboard/EventsTab.tsx` (lines 19-26)
- Add missing `dateBadgeColors` entries: `community`, `education`, `theater`
- Map them to distinct colors:
  - `community` → orange (currently mapped via `evClassMap` → `family` but `family` key missing)
  - `education` → teal
  - `theater` → pink

Also update `evClassMap` in `src/data/events.ts` to use direct category keys that match `dateBadgeColors`:
- Education → `'education'` (was `'kids'`)
- Theater → `'theater'` (was `'arts'`)
- Community → `'community'` (was `'family'`)

## Files to Edit
1. `src/components/dashboard/EatsTab.tsx` — change Maps search to Maps directions URL
2. `src/components/dashboard/EventsTab.tsx` — add missing `dateBadgeColors` entries
3. `src/data/events.ts` — fix `evClassMap` to use direct category keys

