

# Plan: Fix Weather Duplicates, Remove Boneheads, Fix Event Date Filter

## 1. Weather — Fix Duplicate Days + Show 7 Days

**Problem:** The `dateKey` uses `toISOString()` which is UTC-based, so a 3-hour interval at 11pm ET on Saturday becomes Sunday in UTC. This creates duplicate day entries (two "Sat", two "Sun"). Also, OpenWeatherMap free tier only returns 40 entries (5 days of 3-hour data), so we can only show up to 5-6 unique days.

**Fix in `supabase/functions/fetch-weather/index.ts`:**
- Use `toLocaleDateString("en-US", { timeZone: "America/New_York" })` for the `dateKey` instead of `toISOString()` — this groups by ET date, eliminating duplicates
- Keep `cnt=40` (max for free tier) — this gives ~5-6 days which is the max available
- Update the limit from 5 to 7 (in case we get more entries)
- Update the widget label from "5-Day" to match actual count

## 2. Remove Boneheads from Eats

**File:** `src/data/eats.csv` (line 166)
- Delete the `Boneheads,S Main St,Wings/Burgers,` row

## 3. Events — Include Today's Events

**Problem:** `new Date(new Date().toDateString())` creates midnight of today, but `new Date(e.date)` for a date like "Mar 7, 2026" also creates midnight. The `>=` comparison should work, but the issue is likely timezone — `new Date("Mar 7, 2026")` is parsed as UTC midnight, which is 7pm ET on Mar 6. So events for "today" in ET appear as "yesterday" in the comparison.

**Fix in `src/data/events.ts` (line 79-81):**
- Parse event dates in local timezone by using a consistent comparison: compare date strings or normalize both to date-only strings in local time
- Change filter to: get today's date as `YYYY-MM-DD` string in local time, compare against event date normalized the same way, ensuring `>=` includes today

## Files to Edit
1. `supabase/functions/fetch-weather/index.ts` — fix dateKey to use ET timezone, allow up to 7 days
2. `src/data/eats.csv` — remove Boneheads row
3. `src/data/events.ts` — fix today filter to include same-day events
4. `src/components/dashboard/widgets/WeatherWidget.tsx` — update label if needed

