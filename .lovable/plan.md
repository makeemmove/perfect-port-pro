

## Plan: Real-Time MBTA Delay Calculations

### Overview
Create a backend function that fetches live MBTA predictions and schedules, calculates delays, and surface delay status in the MBTA widget. The countdown will use predicted arrival times instead of static schedule times.

### 1. Create edge function `fetch-mbta`

**`supabase/functions/fetch-mbta/index.ts`** — New edge function:
- Accepts `stop` and `direction_id` as query params
- Calls MBTA V3 API: `https://api-v3.mbta.com/predictions?filter[route]=CR-Fall+River&filter[stop]={stop}&include=schedule`
- Uses header `x-api-key: fe3a3623d0524813a4c47c16828bf84a`
- For each prediction, compares `prediction.attributes.arrival_time` vs the included `schedule.attributes.arrival_time`
- Returns array of departures with: `scheduledTime`, `predictedTime`, `delayMinutes`, `status` (On Time / X min Late / CANCELLED)
- Handles `attributes.schedule_relationship === "CANCELLED"` for cancelled trains

**`supabase/config.toml`** — Add:
```toml
[functions.fetch-mbta]
verify_jwt = false
```

### 2. Map station names to MBTA stop IDs

Need a mapping from display names (e.g. "Fall River Depot") to MBTA stop IDs (e.g. "place-FR-0064"). This mapping will live in the edge function. The MBTA V3 API uses stop IDs like:
- Fall River Depot → `place-FR-0064`
- Freetown → `place-FR-0137`  
- And so on for each station on the Fall River line

### 3. Add real-time data hook

**`src/hooks/useMbtaRealtime.ts`** — New hook:
- Calls the `fetch-mbta` edge function every 30 seconds
- Accepts `station` and `routeId` (to determine direction)
- Returns: `predictions` array with `{ scheduledTime, predictedTime, delayMinutes, status }`, `loading`, `error`
- Merges with static schedule data: if API returns predictions, use those; otherwise fall back to static times

### 4. Update HomeTab to use real-time data

**`src/components/dashboard/HomeTab.tsx`**:
- Import and call `useMbtaRealtime` hook with current station/route
- In the `tick` callback, use predicted times (when available) instead of static schedule times for countdown calculation
- Pass new `status` field to `remainingTrains` items

### 5. Update MbtaWidget UI

**`src/components/dashboard/widgets/MbtaWidget.tsx`**:
- Add `status` to the `remainingTrains` type: `{time: string; dir: string; status?: string; delayMin?: number}`
- Next to the main "Departs at" time, add a **Status** label:
  - **"On Time"** in green (`text-green-500 font-semibold`)
  - **"X min Late"** in bold red (`text-red-500 font-bold`)
  - **"CANCELLED"** in bright red (`text-red-600 font-black uppercase`)
- In the popover schedule list, add status badge next to each departure time
- Main countdown uses predicted time, not scheduled

### Files to create/edit
1. `supabase/functions/fetch-mbta/index.ts` — new edge function
2. `supabase/config.toml` — add fetch-mbta entry (won't edit directly, just note the need)
3. `src/hooks/useMbtaRealtime.ts` — new hook for polling MBTA data
4. `src/components/dashboard/HomeTab.tsx` — integrate real-time hook, pass data down
5. `src/components/dashboard/widgets/MbtaWidget.tsx` — add status column/labels to UI

### Technical notes
- The MBTA API key (`fe3a3623d0524813a4c47c16828bf84a`) is a public API key — safe to include in code
- Edge function proxies the MBTA API to avoid CORS issues from the browser
- 30-second polling interval balances freshness vs rate limits
- Falls back to static schedule when API is unavailable

