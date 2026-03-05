

## Plan: Switch to AccuWeather API + Modernize Color Palette

### 1. Switch Weather to AccuWeather API

**`supabase/functions/fetch-weather/index.ts`** — Complete rewrite to use AccuWeather endpoints:

- **Location Key**: Fall River, MA location key = `329505` (AccuWeather's key for Fall River)
- **API Key**: `zpka_3a0024ebac7a459c8c90c5c510b17e98_b2a96850`
- **Endpoints**:
  - Current conditions: `https://dataservice.accuweather.com/currentconditions/v1/329505?apikey=...&details=true`
  - 12-hour hourly forecast: `https://dataservice.accuweather.com/forecasts/v1/hourly/12hour/329505?apikey=...&details=true`
  - NWS alerts stay the same (free, no key needed)
- **Data mapping**: Map AccuWeather's `WeatherIcon` numbers to emoji icons, extract temp, wind, precip, rain probability, sunrise/sunset from the detailed response
- **Output shape**: Keep the same `WeatherData` interface so no frontend changes needed for data structure

**No changes to `src/data/weather.ts`** — the interface and fetch function stay identical.

### 2. Modernize Color Palette — "Billion Dollar" Feel

**`src/index.css`** — Update CSS custom properties for a more premium, modern aesthetic:

- **Background**: Shift from flat gray `0 0% 96%` to a warmer, softer off-white `220 14% 96%`
- **Primary**: Move from pure dark navy `210 100% 20%` to a richer, deeper charcoal-blue `222 47% 11%` (near-black with blue undertone — think Linear/Vercel)
- **Secondary/Accent**: Replace teal `170 100% 37%` with a modern electric indigo-violet `245 58% 51%` for pops of color
- **Muted foreground**: Soften from `0 0% 40%` to `220 9% 46%` for warmer grays
- **Border**: Shift to `220 13% 91%` for subtler card edges
- **Gold accent**: Keep as warm amber `39 100% 50%`
- **Glass surface**: Increase blur to 20px, add subtle gradient tint
- **Shadows**: More diffused, layered shadows for depth

**`tailwind.config.ts`** — No structural changes needed (it reads from CSS vars).

### Files to edit
1. `supabase/functions/fetch-weather/index.ts` — Rewrite for AccuWeather API
2. `src/index.css` — Modern color palette refresh

