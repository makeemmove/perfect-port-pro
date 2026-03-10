

## Plan: Community Tab + Lottery Jackpots + Obituary AI Enrichment + See All Buttons

### Overview
Four interconnected changes: (1) new "Community" bottom nav tab with lottery and obituaries, (2) fix missing "See All" on lottery widget, (3) add jackpot amounts to lottery data, (4) use AI to extract age/date from obituary pages, (5) "See All" on obituaries in home page showing first 3 with expand.

---

### 1. New "Community" Tab

#### `src/components/dashboard/BottomNav.tsx`
- Add `'community'` to the tab type union: `'home' | 'eats' | 'events' | 'news' | 'community'`
- Add a Community tab entry with a people/heart icon

#### `src/pages/Index.tsx`
- Update `activeTab` type to include `'community'`
- Add `CommunityTab` to the tab rendering loop
- Import new `CommunityTab` component

#### `src/components/dashboard/CommunityTab.tsx` (new)
- Renders `LotteryWidget` and `ObituariesWidget` (full versions, no truncation)
- Both widgets show all data by default (no "See All" needed here since this is the dedicated tab)

#### `src/components/dashboard/HomeTab.tsx`
- Remove `'lottery'` and `'obituaries'` from `DEFAULT_ORDER`
- Instead, add a compact preview: `LotteryPreview` showing just Powerball + Mega Millions with a "See All in Community" link, and `ObituariesPreview` showing first 3 obituaries with "See All" button
- Bump `STORAGE_KEY` to `fr-widget-order-v5`

### 2. Fix Lottery "See All" Button + Show Jackpots

The "See All" button exists in the code already (lines 213-231 of LotteryWidget.tsx) but may not be rendering because `otherResults` is empty if no MA games have data. The button logic is correct.

**Jackpot data**: The fetch-lottery edge function currently sets `jackpot: null` for Powerball and Mega Millions. Need to scrape jackpot amounts.

#### `supabase/functions/fetch-lottery/index.ts`
- For Powerball: fetch current jackpot from `https://www.powerball.com` or use the Powerball API jackpot endpoint
- For Mega Millions: similar approach
- Alternative: scrape `https://www.masslottery.com/tools/past-results/powerball` for jackpot info
- Store jackpot string (e.g., "$350 Million") in the `jackpot` column

### 3. AI-Enriched Obituaries

#### `supabase/functions/fetch-obituaries/index.ts`
- After fetching RSS entries, for each obituary that has `age: null` or `date_of_passing: null`:
  - Fetch the obituary URL page content
  - Use Lovable AI (`google/gemini-2.5-flash-lite`) via tool calling to extract `{ age, date_of_passing }` from the page text
  - Update the entry with extracted data before upserting
- Rate limit: process max 5 pages per run to avoid timeouts
- Use `LOVABLE_API_KEY` (already available)

### 4. Obituaries "See All" on Home Page

#### `src/components/dashboard/widgets/ObituariesWidget.tsx`
- Accept an optional `compact` prop
- When `compact=true`: show only first 3 obituaries + "See All" button that navigates to Community tab
- When `compact=false` (default in Community tab): show all 10

### 5. Lottery Widget Modes

#### `src/components/dashboard/widgets/LotteryWidget.tsx`
- Accept optional `compact` prop
- `compact=true` (home page): show only Powerball + Mega Millions, with "See All in Community" button
- `compact=false` (community tab): show all games expanded

---

### Files to create/modify
1. **Create** `src/components/dashboard/CommunityTab.tsx`
2. **Modify** `src/components/dashboard/BottomNav.tsx` — add Community tab
3. **Modify** `src/pages/Index.tsx` — add community tab routing
4. **Modify** `src/components/dashboard/HomeTab.tsx` — remove lottery/obituaries from widget order, add compact versions
5. **Modify** `src/components/dashboard/widgets/LotteryWidget.tsx` — add `compact` prop
6. **Modify** `src/components/dashboard/widgets/ObituariesWidget.tsx` — add `compact` prop + "See All"
7. **Modify** `supabase/functions/fetch-lottery/index.ts` — add jackpot fetching
8. **Modify** `supabase/functions/fetch-obituaries/index.ts` — add AI extraction for age/date

