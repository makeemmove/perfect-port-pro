

## Plan: Fix Early Status Colors + Add Lottery Results Section

### Part 1: Fix "Early" Status — Green Colors

The "early" status pills in the MBTA widget use Tailwind classes like `bg-emerald-500/15 text-emerald-600` which get purged by Tailwind's JIT compiler (same issue as the Events tab date badges). The fix is switching to inline styles.

#### `src/components/dashboard/widgets/MbtaWidget.tsx`
- **StatusPill**: Replace Tailwind color classes for "early" and "late" with inline `style` attributes using hex colors
  - Early: green background `#dcfce7`, green text `#16a34a`
  - Late: red background `#fee2e2`, red text `#dc2626`
  - On Time: keep as-is (uses foreground which resolves correctly)
- **TopStatusBadge**: Same fix for the top badge — use inline styles for early (green bg `#16a34a`, white text) and late (red)
- **Timeline dots** (line 234): Convert dot colors from Tailwind to inline styles

### Part 2: Lottery Results Feature

#### Database: `lottery_results` table
```sql
CREATE TABLE public.lottery_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_name text NOT NULL,
  draw_date timestamptz NOT NULL,
  numbers jsonb NOT NULL,        -- e.g. [5, 12, 33, 44, 55]
  special_number jsonb,          -- e.g. [22] for Powerball/Mega Ball
  multiplier text,               -- e.g. "2x"
  jackpot text,                  -- e.g. "$350 Million"
  official_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(game_name, draw_date)
);

ALTER TABLE public.lottery_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read lottery results" ON public.lottery_results FOR SELECT TO public USING (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.lottery_results;
```

#### Edge Function: `supabase/functions/fetch-lottery/index.ts`
- Runs on invocation (scheduled via pg_cron every hour)
- Fetches from Massachusetts State Lottery RSS feed and public lottery data APIs
- Parses results for: Mega Millions, Powerball, Mass Cash, Lucky for Life, Numbers Game (Midday/Evening)
- Upserts into `lottery_results` table (keyed on game_name + draw_date)
- Config: `verify_jwt = false`

#### pg_cron schedule
- Schedule hourly invocation of the edge function

#### Widget: `src/components/dashboard/widgets/LotteryWidget.tsx`
- Card grid showing latest result per game
- White background, 16px rounded corners, soft shadow (matches existing glass-card style)
- Each card shows:
  - Game title (bold Inter)
  - Draw date (subtle gray)
  - Winning numbers in white circles with 1px gray border
  - Special ball (Powerball/Mega Ball) with distinct styling — slightly darker bg or colored border
  - Multiplier if available
- Click → opens official URL in new tab with `active:scale-[0.98]` press animation
- Realtime subscription: `supabase.channel('lottery').on('postgres_changes', ...)` to auto-update

#### Integration: `src/components/dashboard/HomeTab.tsx`
- Add `'lottery'` to `DEFAULT_ORDER` array
- Add `LotteryWidget` to the widget map
- Import and render alongside existing widgets

#### `src/pages/Index.tsx` — No changes needed
HomeTab handles its own widget rendering.

### Files to create/modify
1. **Modify** `src/components/dashboard/widgets/MbtaWidget.tsx` — inline styles for early/late colors
2. **Create** DB migration — `lottery_results` table + RLS + realtime
3. **Create** `supabase/functions/fetch-lottery/index.ts` — data fetcher
4. **Update** `supabase/config.toml` — add function config
5. **Create** `src/components/dashboard/widgets/LotteryWidget.tsx` — UI component
6. **Modify** `src/components/dashboard/HomeTab.tsx` — integrate lottery widget
7. **Schedule** pg_cron job for hourly fetches

