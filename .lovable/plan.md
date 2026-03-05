

# Plan: MBTA Status Display, Updated Eats CSV, OpenWeather API

## 1. MBTA Widget — Replace "LIVE" with Status Badge
**File:** `src/components/dashboard/widgets/MbtaWidget.tsx`

- Remove the "LIVE" indicator (lines 74-79) — the user doesn't want a "LIVE" label
- The `TopStatusBadge` already shows On Time/Late/Early in the top-right (line 81) — keep this as the primary indicator
- Remove the `isLive` prop since it's no longer displayed

**File:** `src/components/dashboard/HomeTab.tsx`
- Remove `isLive` prop passed to MbtaWidget

## 2. Update Eats with New CSV
**Files:**
- Copy `user-uploads://eatss_2.csv` → `src/data/eats.csv` (replaces old CSV)
- Update `src/data/restaurants.ts` to parse new CSV columns: `Name, Address, Category, Website` (was `Name, Type, Address, Neighborhood`)
  - Map column index 1 → `loc` (Address), column 2 → `sub` (Category via `normalizeType`), column 3 → `url` (Website)
  - Add new categories to `normalizeType`: `steakhouse`, `breakfast/brunch`, `ice cream`, `chicken`, `juice`, `wings`, `irish`, `brazilian`, `thai`, `bar/tacos`
- Update `src/components/dashboard/EatsTab.tsx`:
  - Add new category filters: Breakfast, Steakhouse, Ice Cream/Desserts
  - Show website link on cards when available

## 3. Weather — Switch to OpenWeatherMap API
**File:** `supabase/functions/fetch-weather/index.ts`

Replace Open-Meteo with OpenWeatherMap using the provided API key (`c07bd9dae1e05e6549146b718568329b`). Since this is a public/free API key, store it directly in the edge function code.

- Use **One Call API 3.0** or **Current + Forecast endpoints**:
  - Current: `https://api.openweathermap.org/data/2.5/weather?lat=41.7015&lon=-71.1550&appid={key}&units=imperial`
  - Forecast: `https://api.openweathermap.org/data/2.5/forecast?lat=41.7015&lon=-71.1550&appid={key}&units=imperial&cnt=8` (3-hour intervals, 8 entries = 24h)
- Extract: temp, weather description, wind, humidity, rain probability, sunrise/sunset from current endpoint
- Build 6-hour hourly forecast from the forecast endpoint
- Keep NWS alerts integration
- Map OpenWeatherMap icon codes to emoji icons

**File:** `src/data/weather.ts` — no changes needed (interface stays the same)

## Files to Edit
1. `src/data/eats.csv` — replace with new CSV
2. `src/data/restaurants.ts` — update column parsing for new format + new categories
3. `src/components/dashboard/EatsTab.tsx` — add new category filters, show website links
4. `src/components/dashboard/widgets/MbtaWidget.tsx` — remove LIVE indicator
5. `src/components/dashboard/HomeTab.tsx` — remove isLive prop
6. `supabase/functions/fetch-weather/index.ts` — switch to OpenWeatherMap API

