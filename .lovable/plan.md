

## Plan: Switch to OpenWeatherMap API, Add Downward Shadows, Change Eats Icon

### 1. Switch weather data source to OpenWeatherMap

**File: `src/data/weather.ts`**

Replace the Open-Meteo API with OpenWeatherMap using the provided API key `c07bd9dae1e05e6549146b718568329b`. The key is publishable (free-tier OWM key), so it's safe to store in the codebase.

- Use the OpenWeatherMap "One Call" style or "Current + Forecast" endpoints for Fall River coordinates (41.7015, -71.1551)
- Specifically use:
  - Current weather: `https://api.openweathermap.org/data/2.5/weather?lat=41.7015&lon=-71.1551&units=imperial&appid=KEY`
  - Hourly forecast: `https://api.openweathermap.org/data/2.5/forecast?lat=41.7015&lon=-71.1551&units=imperial&appid=KEY`
- Map OWM weather condition codes to emoji icons (similar to existing WC mapping but using OWM IDs: 2xx thunderstorm, 3xx drizzle, 5xx rain, 6xx snow, 7xx atmosphere, 800 clear, 80x clouds)
- Parse sunrise/sunset from the current weather response (`sys.sunrise`, `sys.sunset` as Unix timestamps)
- Build the same `WeatherData` interface output so no widget changes are needed
- Keep the same 8-hour hourly forecast display

**File: `src/components/dashboard/HomeTab.tsx`**

- Change the weather refresh interval from 600000ms (10 min) to 300000ms (5 min)

### 2. Add downward shadow to Weather, SRTA, and MBTA cards

All three widget containers currently use `shadow-card`. The shadow defined in Tailwind config is already a downward shadow, but the Weather widget has `border border-border/40` while MBTA and SRTA have `border-0`. To make them all consistent with a visible downward shadow:

**File: `tailwind.config.ts`**
- Increase the `shadow-card` values to be more pronounced downward: `0 8px 24px -4px rgba(0,0,0,0.12), 0 4px 10px -2px rgba(0,0,0,0.06)`

This will apply to all cards uniformly (Weather, MBTA, SRTA, Stats, Coming Up, News).

### 3. Change eats icon to just a fork

**File: `src/components/dashboard/widgets/StatsWidget.tsx`**

Replace the current plate-with-utensils SVG icon (lines 32-36) with a simple fork SVG:
```
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-5 h-5 text-primary">
  <path d="M11 2v6.5c0 1.38-1.12 2.5-2.5 2.5S6 9.88 6 8.5V2" />
  <path d="M8.5 2v6.5" />
  <path d="M8.5 11v11" />
</svg>
```

---

### Technical Summary

| Change | File(s) | Detail |
|--------|---------|--------|
| Switch to OpenWeatherMap | `src/data/weather.ts` | New API URL, OWM condition code mapping, parse different JSON structure |
| 5-min refresh | `src/components/dashboard/HomeTab.tsx` | `600000` to `300000` |
| Stronger downward shadow | `tailwind.config.ts` | Update `shadow-card` values |
| Fork icon | `src/components/dashboard/widgets/StatsWidget.tsx` | Replace plate SVG with fork SVG |

