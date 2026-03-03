

## Multiple UI and Backend Updates

### 1. Remove Source Labels from News

**NewsTab.tsx** -- Remove the `source_name` badge from both the `NewsCard` component and the article detail modal. Remove the `sourceColors` constant since it's no longer needed.

**NewsPreviewWidget.tsx** -- Remove the `source_name` line from the home page preview cards.

### 2. AI Summary Length: 250 Characters Max

**supabase/functions/fetch-news/index.ts** -- Update the `SYSTEM_PROMPT` and the `write_article` tool schema to instruct the AI to produce summaries of 250 characters or fewer. Also update the `summary` tool parameter description to enforce this limit.

### 3. Hourly Weather: Swipeable/Slideable

The hourly section in **WeatherWidget.tsx** already uses `overflow-x-auto` with `scrollbarWidth: 'none'`, which supports touch swiping. To make it more obviously swipeable on all devices, add `-webkit-overflow-scrolling: touch` and `scroll-snap` behavior to the container and child items, giving a smooth snap-to-card sliding feel.

### 4. Events Filter Buttons: Horizontally Scrollable

**EventsTab.tsx** -- The filter buttons row (line 69) already has `overflow-x-auto` and `scrollbarWidth: 'none'`. Add more filter categories so they overflow and become slideable. Currently there are 7 filters. Add additional ones from the CSV data (e.g., Community, Sports, Civic, Education, Theater, Food) to make the row naturally overflow and require sliding.

### 5. Switch Weather API to OpenWeatherMap

**src/data/weather.ts** -- Replace the Open-Meteo API URL with the OpenWeatherMap API using the provided key `c07bd9dae1e05e6549146b718568329b`. Update `fetchWeather()` to parse OpenWeatherMap's JSON response format (which differs from Open-Meteo). The `WeatherData` interface stays the same -- only the fetch logic and response parsing change. The OWM "One Call" or "Current + Forecast" endpoints will be used with `lat=41.7015&lon=-71.1551&units=imperial&appid=c07bd9dae1e05e6549146b718568329b`.

### 6. Rename Header: "Fall River Connect" with Blue "Connect"

**HomeTab.tsx** line 205 -- Change `<h1>Fall River</h1>` to render "Fall River " in the current foreground color and "Connect" in blue (`text-primary` or `text-blue-500`).

---

### Files Changed

| File | Action | What Changes |
|------|--------|-------------|
| `src/components/dashboard/HomeTab.tsx` | Modify | Header text: "Fall River Connect" with blue "Connect" |
| `src/components/dashboard/NewsTab.tsx` | Modify | Remove source_name badges from cards and modal |
| `src/components/dashboard/widgets/NewsPreviewWidget.tsx` | Modify | Remove source_name from preview cards |
| `src/components/dashboard/widgets/WeatherWidget.tsx` | Modify | Add scroll-snap for smooth hourly sliding |
| `src/components/dashboard/EventsTab.tsx` | Modify | Add more filter categories so buttons overflow and slide |
| `src/data/weather.ts` | Modify | Switch from Open-Meteo to OpenWeatherMap API with provided key |
| `supabase/functions/fetch-news/index.ts` | Modify | Update AI prompt to cap summaries at 250 chars |
