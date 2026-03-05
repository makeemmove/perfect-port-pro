

# Plan: Ticker Speed, Weather Fix, MBTA Status Badge, Nav Colors

## 1. Ticker Speed — Double It
**File:** `src/components/dashboard/Ticker.tsx` (line 121)

Change the animation duration formula from `items.length * 8` to `items.length * 4` (halves the time, doubles the speed).

## 2. Weather — Switch to Open-Meteo (Free, No Key Required)
**File:** `supabase/functions/fetch-weather/index.ts`

The AccuWeather free tier has strict rate limits (50 calls/day) which may cause stale/missing data. Replace with **Open-Meteo API** which is completely free, unlimited, and highly accurate:
- Use `https://api.open-meteo.com/v1/forecast` with Fall River coords (41.7015, -71.1551)
- Request: `current=temperature_2m,weather_code,wind_speed_10m,precipitation` + `hourly=temperature_2m,precipitation_probability,weather_code` + `daily=sunrise,sunset`
- Set `temperature_unit=fahrenheit`, `wind_speed_unit=mph`, `precipitation_unit=inch`, `timezone=America/New_York`
- Keep NWS alerts from `api.weather.gov`
- Map WMO weather codes to emoji icons (similar to current `accuIcon` function)
- This eliminates the AccuWeather API key dependency entirely

## 3. MBTA Status Badge in Top-Right of Card
**File:** `src/components/dashboard/widgets/MbtaWidget.tsx`

Add a prominent color-coded status badge in the top-right corner of the MBTA card (next to the LIVE indicator area):
- **On Time** — green background, white text
- **X min Late** — red background, white text
- **X min Early** — blue background, white text
- **CANCELLED** — dark red background, white text

Position it using `ml-auto` in the existing header flex row so it sits at the far right.

## 4. Bottom Nav — Navy Blue Default, Orange Active
**File:** `src/components/dashboard/BottomNav.tsx` (line 64)

Change inactive tab color from `text-muted-foreground` to `text-primary` (navy blue). Active tab stays `text-secondary` (orange). Remove `hover:text-foreground` since inactive is already a strong color.

## Files to Edit
1. `src/components/dashboard/Ticker.tsx` — halve animation duration
2. `supabase/functions/fetch-weather/index.ts` — replace AccuWeather with Open-Meteo
3. `src/components/dashboard/widgets/MbtaWidget.tsx` — top-right status badge with colors
4. `src/components/dashboard/BottomNav.tsx` — navy blue inactive tabs

