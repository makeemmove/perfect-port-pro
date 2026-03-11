-- Run fetch-lottery only at draw times (no API polling at other times).
-- Times below are UTC; MA draws are Eastern (2:02 PM, 9:02 PM, ~11:00–11:17 PM).
-- We run a few minutes after each draw window so results are posted.

CREATE OR REPLACE FUNCTION public.refresh_lottery_at_draw_times()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM
    net.http_post(
      url := 'https://qjyvkqvxzdbclytcdfdj.supabase.co/functions/v1/fetch-lottery',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := '{}'::jsonb
    );
END;
$$;

-- Unschedule if already present (safe re-run)
DO $$
BEGIN
  PERFORM cron.unschedule('lottery-midday');
EXCEPTION WHEN undefined_function THEN NULL; WHEN others THEN NULL;
END $$;
DO $$
BEGIN
  PERFORM cron.unschedule('lottery-evening');
EXCEPTION WHEN undefined_function THEN NULL; WHEN others THEN NULL;
END $$;
DO $$
BEGIN
  PERFORM cron.unschedule('lottery-late-evening');
EXCEPTION WHEN undefined_function THEN NULL; WHEN others THEN NULL;
END $$;

-- Midday: Numbers Game & Mass Cash (2:02 PM ET) → run at 19:05 UTC (2:05 PM ET)
DO $$
BEGIN
  PERFORM cron.schedule(
    'lottery-midday',
    '5 19 * * *',
    $$SELECT public.refresh_lottery_at_draw_times();$$
  );
EXCEPTION WHEN undefined_function THEN NULL; WHEN others THEN NULL;
END $$;

-- Evening: Numbers Game, Mass Cash, Megabucks (9:02 PM ET) → run at 02:05 UTC (9:05 PM ET)
DO $$
BEGIN
  PERFORM cron.schedule(
    'lottery-evening',
    '5 2 * * *',
    $$SELECT public.refresh_lottery_at_draw_times();$$
  );
EXCEPTION WHEN undefined_function THEN NULL; WHEN others THEN NULL;
END $$;

-- Late evening: Powerball, Mega Millions, Millionaire for Life (~11:00–11:17 PM ET) → run at 04:05 UTC (11:05 PM ET)
DO $$
BEGIN
  PERFORM cron.schedule(
    'lottery-late-evening',
    '5 4 * * *',
    $$SELECT public.refresh_lottery_at_draw_times();$$
  );
EXCEPTION WHEN undefined_function THEN NULL; WHEN others THEN NULL;
END $$;
