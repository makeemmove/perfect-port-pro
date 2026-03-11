-- Weather cache: current conditions (updated hourly) and weekly forecast (updated daily at midnight).
-- Edge function fetch-weather writes here; app reads from here for accurate, up-to-date weather.

CREATE TABLE public.weather_current (
  id text PRIMARY KEY DEFAULT 'fall_river',
  temp integer NOT NULL,
  precip numeric NOT NULL DEFAULT 0,
  wind integer NOT NULL DEFAULT 0,
  rain_prob integer NOT NULL DEFAULT 0,
  label text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT '🌤',
  sunrise text NOT NULL DEFAULT '',
  sunset text NOT NULL DEFAULT '',
  daylight text NOT NULL DEFAULT '',
  alerts jsonb NOT NULL DEFAULT '[]',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.weather_forecast (
  location_id text NOT NULL DEFAULT 'fall_river',
  forecast_date date NOT NULL,
  day_name text NOT NULL,
  high integer NOT NULL,
  low integer NOT NULL,
  icon text NOT NULL DEFAULT '🌤',
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (location_id, forecast_date)
);

ALTER TABLE public.weather_current ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_forecast ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read weather_current"
  ON public.weather_current FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can read weather_forecast"
  ON public.weather_forecast FOR SELECT TO public USING (true);

-- Service role writes via Edge Function; no insert/update policy for anon/authenticated needed.

-- Refresh current weather (call every hour).
CREATE OR REPLACE FUNCTION public.refresh_weather_current()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM
    net.http_post(
      url := 'https://qjyvkqvxzdbclytcdfdj.supabase.co/functions/v1/fetch-weather?type=current',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := '{}'::jsonb
    );
END;
$$;

-- Refresh weekly forecast (call daily at 12:00 AM Eastern ≈ 05:00 UTC).
CREATE OR REPLACE FUNCTION public.refresh_weather_forecast()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM
    net.http_post(
      url := 'https://qjyvkqvxzdbclytcdfdj.supabase.co/functions/v1/fetch-weather?type=forecast',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := '{}'::jsonb
    );
END;
$$;

-- Hourly: update current weather at :00 past every hour (UTC).
DO $$
BEGIN
  PERFORM cron.unschedule('weather-current-hourly');
EXCEPTION WHEN undefined_function THEN NULL; WHEN others THEN NULL;
END $$;
DO $$
BEGIN
  PERFORM cron.schedule(
    'weather-current-hourly',
    '0 * * * *',
    $$SELECT public.refresh_weather_current();$$
  );
EXCEPTION WHEN undefined_function THEN NULL; WHEN others THEN NULL;
END $$;

-- Daily at 12:00 AM Eastern (05:00 UTC; 04:00 UTC in EDT).
DO $$
BEGIN
  PERFORM cron.unschedule('weather-forecast-daily');
EXCEPTION WHEN undefined_function THEN NULL; WHEN others THEN NULL;
END $$;
DO $$
BEGIN
  PERFORM cron.schedule(
    'weather-forecast-daily',
    '0 5 * * *',
    $$SELECT public.refresh_weather_forecast();$$
  );
EXCEPTION WHEN undefined_function THEN NULL; WHEN others THEN NULL;
END $$;
