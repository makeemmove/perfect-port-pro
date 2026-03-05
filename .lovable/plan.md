

## Plan: Fix Weather, Remove Reorder, News Summaries Only, Events Chronological + Expire, Eats Icon

### 1. Weather — verify edge function is working

The weather edge function (`supabase/functions/fetch-weather/index.ts`) already exists and fetches from OpenWeatherMap + NWS alerts. The frontend (`src/data/weather.ts`) already calls it every 5 minutes. The code looks correct — the API key, lat/lon for Fall River are set. I'll test the edge function to confirm it returns data. If there's an issue, I'll debug and fix.

**No code changes expected** unless the edge function is returning errors. Will test first.

### 2. Remove three-dot / reorder buttons completely

`DraggableWidget.tsx` is already stripped to a plain wrapper — no buttons remain. **No changes needed.**

### 3. News — summaries only, no full articles (plagiarism concern)

The current system prompt tells Gemini to write full 400-800 word articles AND a 150-char summary. The full articles are stored in the `content` column and displayed in the modal via `dangerouslySetInnerHTML`.

**Changes:**

**`supabase/functions/fetch-news/index.ts`:**
- Remove the instruction to write full articles from the system prompt
- Change the tool schema: remove `content` field, keep only `title` and `summary`
- Store the summary in both `content` and `summary` columns (so the modal still has something to show)
- Summary stays at max 150 characters

**`src/components/dashboard/NewsTab.tsx`:**
- In the article modal, remove the `dangerouslySetInnerHTML` full article rendering
- Show only the summary text and the "View Original Source" link
- This keeps things short and avoids plagiarism

### 4. Events — chronological order, remove past events

**`src/data/events.ts`:**
- After parsing and sorting, filter out events where the date is before today: `events.filter(e => new Date(e.date) >= new Date(new Date().toDateString()))`
- Events are already sorted chronologically by `parseEvents()`, so ordering is fine
- The `groupByMonth` function in `EventsTab.tsx` also sorts within groups — no change needed there

### 5. Eats icon — fork with square (match bottom nav)

**`src/components/dashboard/EatsTab.tsx`** (line 51-53):
- Replace the current fork SVG path with the fork-in-square SVG used in `BottomNav.tsx`:
```
<rect x="3" y="3" width="18" height="18" rx="4" />
<path d="M13 7v4c0 .8-.7 1.5-1.5 1.5S10 11.8 10 11V7" />
<path d="M11.5 7v4" />
<path d="M11.5 12.5v4.5" />
```

### Files to edit
1. `supabase/functions/fetch-news/index.ts` — remove full article generation, summary only
2. `src/components/dashboard/NewsTab.tsx` — show summary in modal instead of full article
3. `src/data/events.ts` — filter out past events
4. `src/components/dashboard/EatsTab.tsx` — replace fork icon with fork-in-square

