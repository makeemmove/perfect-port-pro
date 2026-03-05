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
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data as WeatherData;
  } catch (e) {
    console.error('Weather fetch error:', e);
    return null;
  }
}
