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

export async function fetchWeather(): Promise<WeatherData | null> {
  try {
    const { data, error } = await supabase.functions.invoke('fetch-weather');
    if (error) {
      console.error('Weather invoke error:', error);
      throw error;
    }
    if (data?.error) {
      console.error('Weather data error:', data.error);
      throw new Error(data.error);
    }
    console.log('Weather data received:', data?.temp, data?.label);
    return data as WeatherData;
  } catch (e) {
    console.error('Weather fetch failed, trying direct fetch:', e);
    // Fallback: direct fetch
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/fetch-weather`, {
        headers: { 'apikey': anonKey },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      console.log('Weather fallback data received:', json?.temp, json?.label);
      return json as WeatherData;
    } catch (e2) {
      console.error('Weather fallback also failed:', e2);
      return null;
    }
  }
}
