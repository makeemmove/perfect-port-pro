

# Plan: 5-Day Weather Forecast, MBTA Status Badge Fix, Faster Ticker

## Issues Found

1. **MBTA badge not showing**: The `TopStatusBadge` component exists but the MBTA API returns `status: "Scheduled"` (schedule fallback, no real-time predictions available). The badge component doesn't handle "Scheduled" status — it only handles "On Time", "Late", "Early", "CANCELLED". When predictions ARE available, it works correctly. Fix: add "Scheduled" as a visible state (yellow/amber badge).

2. **Ticker speed**: Currently `items.length * 4` seconds — halve to `items.length * 2` for 2x speed.

3. **Weather hourly → 5-day**: OpenWeatherMap free tier provides 5-day/3-hour forecast. Fetch `cnt=40` entries, group by day, extract high/low temps and dominant weather icon per day.

## Changes

### 1. Ticker — 2x Faster (`src/components/dashboard/Ticker.tsx`)
- Change animation duration from `items.length * 4` to `items.length * 2` (line 121)

### 2. Weather — 5-Day Forecast (`supabase/functions/fetch-weather/index.ts`)
- Change forecast request from `cnt=3` to `cnt=40` (full 5 days)
- Instead of building `hourly[]`, build a new `daily[]` array: group forecast entries by date, compute high/low temp per day, pick the most common weather icon, include rain probability
- Return `daily: { day: string, high: number, low: number, icon: string }[]` instead of `hourly`
- Keep current conditions, sunrise/sunset, alerts as-is

### 3. Weather Widget — Show 5-Day (`src/components/dashboard/widgets/WeatherWidget.tsx`)
- Replace the "Next 6 Hours" section (lines 72-89) with a "5-Day Forecast" section
- Each day shows: day name (Mon, Tue...), weather emoji icon, high°/low° temps
- Horizontal row layout similar to current hourly cards

### 4. Weather Type — Update Interface (`src/data/weather.ts`)
- Add `daily` field: `{ day: string; high: number; low: number; icon: string }[]`
- Keep `hourly` as optional for backward compat (or remove)

### 5. MBTA Badge — Handle All Statuses (`src/components/dashboard/widgets/MbtaWidget.tsx`)
- Update `TopStatusBadge`: add handling for `"Scheduled"` status — show amber/yellow badge saying "Scheduled"
- This ensures the badge always displays something when there's data from the API
- When real-time predictions are available (during active service hours), "On Time" / "Late" / "Early" will show with their respective colors

### Files to Edit
1. `src/components/dashboard/Ticker.tsx` — halve animation duration
2. `supabase/functions/fetch-weather/index.ts` — 5-day forecast aggregation
3. `src/data/weather.ts` — add `daily` to interface
4. `src/components/dashboard/widgets/WeatherWidget.tsx` — replace hourly with 5-day
5. `src/components/dashboard/widgets/MbtaWidget.tsx` — handle "Scheduled" status in badge

