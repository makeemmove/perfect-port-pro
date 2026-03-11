import { supabase } from "@/integrations/supabase/client";

export interface WeatherAlert {
  event: string;
  severity: string;
  headline: string;
  description: string;
}

export interface WeatherData {
  temp: number;
  precip: number;
  wind: number;
  rainProb: number;
  label: string;
  icon: string;
  sunrise: string;
  sunset: string;
  daylight: string;
  hourly?: { time: string; temp: number; rainProb: number; icon: string; isNow: boolean }[];
  daily: { day: string; high: number; low: number; icon: string }[];
  alerts: WeatherAlert[];
}

const LOCATION_ID = "fall_river";

/**
 * Reads cached weather from DB (updated hourly for current, daily at midnight for weekly forecast).
 * Falls back to calling the fetch-weather edge function if cache is empty.
 */
export async function fetchWeather(): Promise<WeatherData | null> {
  try {
    const [currentRes, forecastRes] = await Promise.all([
      supabase.from("weather_current").select("*").eq("id", LOCATION_ID).maybeSingle(),
      supabase.from("weather_forecast").select("forecast_date, day_name, high, low, icon").eq("location_id", LOCATION_ID).order("forecast_date", { ascending: true }),
    ]);

    const current = currentRes.data;
    const forecastRows = forecastRes.data ?? [];

    if (current && forecastRows.length > 0) {
      const alerts = (current.alerts ?? []) as WeatherAlert[];
      const daily = forecastRows.map((r) => ({
        day: r.day_name,
        high: r.high,
        low: r.low,
        icon: r.icon,
      }));
      const weather: WeatherData = {
        temp: current.temp,
        precip: Number(current.precip),
        wind: current.wind,
        rainProb: current.rain_prob,
        label: current.label,
        icon: current.icon,
        sunrise: current.sunrise,
        sunset: current.sunset,
        daylight: current.daylight,
        daily,
        alerts,
      };
      return weather;
    }
  } catch (e) {
    console.error("Weather DB read failed:", e);
  }

  try {
    const { data, error } = await supabase.functions.invoke("fetch-weather");
    if (error) {
      console.error("Weather invoke error:", error);
      throw error;
    }
    if (data?.error) {
      console.error("Weather data error:", data.error);
      throw new Error(data.error);
    }
    return data as WeatherData;
  } catch (e) {
    console.error("Weather fetch failed, trying direct fetch:", e);
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/fetch-weather`, {
        headers: { apikey: anonKey },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json as WeatherData;
    } catch (e2) {
      console.error("Weather fallback also failed:", e2);
      return null;
    }
  }
}
