

# Plan: Tab Colors, Gear Icon, Info Buttons, Weather Sunrise/Sunset

## 1. Active Tab Orange Color (`src/components/dashboard/BottomNav.tsx`)
- Change the active tab color from `text-primary` (navy) to `text-secondary` (amber-orange, HSL 25 90% 50%) so the selected tab matches the logo's orange
- Only the active tab gets the orange; inactive tabs remain `text-muted-foreground`

## 2. Gear Icon Styling (`src/components/dashboard/HomeTab.tsx`)
- Remove the background from the gear button (no `bg-muted/60` class)
- Make the gear icon navy blue by using `text-primary` instead of `text-muted-foreground`
- Keep the edit-mode checkmark button styled as-is (it's a save action)

## 3. Info Button Restyling (`src/components/dashboard/widgets/SortableEventItem.tsx`)
- Change the Info button from `bg-primary/10 text-primary` to `bg-primary text-white` (navy background, white text)

## 4. Fix Sunrise/Sunset in Weather (`supabase/functions/fetch-weather/index.ts`)
- The AccuWeather current conditions v1 endpoint does not return `Sun.Rise`/`Sun.Set` even with `details=true`
- Add a daily forecast API call: `forecasts/v1/daily/1day/{LOCATION_KEY}?apikey={API_KEY}&details=true`
- Extract `Sun.Rise` and `Sun.Set` from `DailyForecasts[0].Sun`
- This provides accurate sunrise/sunset and daylight hours

### Files to Edit
1. `src/components/dashboard/BottomNav.tsx` — active tab color to orange
2. `src/components/dashboard/HomeTab.tsx` — gear icon: no background, navy color
3. `src/components/dashboard/widgets/SortableEventItem.tsx` — Info button: navy bg, white text
4. `supabase/functions/fetch-weather/index.ts` — add daily forecast call for sunrise/sunset

