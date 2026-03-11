-- Add richer obituary fields (from sheet/scrape)
ALTER TABLE public.local_obituaries
  ADD COLUMN IF NOT EXISTS birth_date date,
  ADD COLUMN IF NOT EXISTS article_bio text;

-- Daily refresh: call Edge Function `fetch-obituaries` once per day.
-- `verify_jwt=false` for this function, so we can call it without auth headers.
CREATE OR REPLACE FUNCTION public.refresh_obituaries_daily()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM
    net.http_post(
      url := 'https://qjyvkqvxzdbclytcdfdj.supabase.co/functions/v1/fetch-obituaries',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := '{}'::jsonb
    );
END;
$$;

-- Schedule to run daily at 6:05 AM UTC (adjust cron as desired).
-- Safe to re-run migration: unschedule if exists, then schedule.
DO $$
BEGIN
  PERFORM cron.unschedule('refresh-obituaries-daily');
EXCEPTION WHEN undefined_function THEN
  -- cron extension may not be available in local dev
  NULL;
WHEN others THEN
  NULL;
END $$;

DO $$
BEGIN
  PERFORM cron.schedule(
    'refresh-obituaries-daily',
    '5 6 * * *',
    $$SELECT public.refresh_obituaries_daily();$$
  );
EXCEPTION WHEN undefined_function THEN
  NULL;
WHEN others THEN
  NULL;
END $$;

