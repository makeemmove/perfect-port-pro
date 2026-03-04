

## Plan: Weather Overhaul, Remove Reorder, Match Transit Cards, Fix Eats Icon, Update News Summaries

### 1. Remove three-dot reorder buttons completely

**`src/components/dashboard/DraggableWidget.tsx`** — Simplify to a plain wrapper div. Remove all imports (DropdownMenu, ChevronUp/Down, MoreVertical). Remove `onMoveUp`/`onMoveDown` props. Just render `<div className="mb-2">{children}</div>`.

**`src/components/dashboard/HomeTab.tsx`** — Remove `moveWidget` callback and stop passing `onMoveUp`/`onMoveDown` to DraggableWidget. Keep widget order from localStorage (read-only, no reordering UI).

### 2. Fix weather — use edge function to fetch real weather data

Replace the client-side OpenWeatherMap fetch with a backend edge function that fetches weather + NWS alerts for Fall River every call. The frontend will call this every 5 minutes.

**`supabase/functions/fetch-weather/index.ts`** — New edge function:
- Fetches OpenWeatherMap current + forecast (using the existing API key `c07bd9dae1e05e6549146b718568329b`)
- Fetches NWS alerts for Fall River from `https://api.weather.gov/alerts/active?point=41.7015,-71.1551`
- Returns combined weather data + active alerts array
- Add to `supabase/config.toml` with `verify_jwt = false`

**`src/data/weather.ts`** — Update `fetchWeather()` to call the edge function via `supabase.functions.invoke('fetch-weather')` instead of direct API calls. Add `alerts` field to `WeatherData` interface.

**`src/components/dashboard/widgets/WeatherWidget.tsx`** — Add alerts display section: if alerts exist, show them as colored banners (yellow/orange/red depending on severity) below the weather info.

### 3. Match MBTA and SRTA cards — same layout and size

**`src/components/dashboard/widgets/SrtaWidget.tsx`** — Restructure to match MbtaWidget exactly:
- Use `py-[15px]` padding like MBTA (currently just `p-6`)
- Move route selector below the header row (separate flex-wrap row with Select dropdowns, matching MBTA's two-dropdown layout)
- Remove the redundant popover route picker (lines 49-69) — the Select dropdown is sufficient
- Keep direction text, countdown, departs-at, and "tap countdown" hint in the same positions as MBTA

### 4. Update Local Eats icon to match bottom nav (fork in square)

**`src/components/dashboard/widgets/StatsWidget.tsx`** — Replace the current fork SVG (lines 32-36) with the same fork-in-square SVG used in BottomNav's Eats tab:
```
<rect x="3" y="3" width="18" height="18" rx="4" />
<path d="M13 7v4c0 .8-.7 1.5-1.5 1.5S10 11.8 10 11V7" />
<path d="M11.5 7v4" />
<path d="M11.5 12.5v4.5" />
```

### 5. Update news summary prompt to 150 characters

**`supabase/functions/fetch-news/index.ts`** — Change the SYSTEM_PROMPT summary constraint from "Maximum 100 characters" to "Maximum 150 characters". Also update the tool parameter description for `summary` to say "MAX 150 characters". Tighten Fall River geofencing in Google News search query.

### Files to edit
1. `src/components/dashboard/DraggableWidget.tsx` — strip to plain wrapper
2. `src/components/dashboard/HomeTab.tsx` — remove moveWidget and reorder props
3. `supabase/functions/fetch-weather/index.ts` — new edge function
4. `supabase/config.toml` — add fetch-weather function entry
5. `src/data/weather.ts` — call edge function, add alerts type
6. `src/components/dashboard/widgets/WeatherWidget.tsx` — add alerts UI
7. `src/components/dashboard/widgets/SrtaWidget.tsx` — match MBTA layout
8. `src/components/dashboard/widgets/StatsWidget.tsx` — fork-in-square icon
9. `supabase/functions/fetch-news/index.ts` — 150 char summaries + Fall River geofence

