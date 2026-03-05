import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const API_KEY = "c07bd9dae1e05e6549146b718568329b";
const LAT = 41.7015;
const LON = -71.1550;

function owmIcon(code: string): string {
  const map: Record<string, string> = {
    "01d": "☀️", "01n": "🌙",
    "02d": "🌤", "02n": "☁️",
    "03d": "⛅", "03n": "☁️",
    "04d": "☁️", "04n": "☁️",
    "09d": "🌧", "09n": "🌧",
    "10d": "🌦", "10n": "🌧",
    "11d": "⛈", "11n": "⛈",
    "13d": "❄️", "13n": "❄️",
    "50d": "🌫", "50n": "🌫",
  };
  return map[code] || "🌤";
}

function fmtTime(unix: number): string {
  const d = new Date(unix * 1000);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "America/New_York" });
}

function fmtHour(unix: number): string {
  const d = new Date(unix * 1000);
  return d.toLocaleTimeString("en-US", { hour: "numeric", hour12: true, timeZone: "America/New_York" });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const CURRENT_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=imperial`;
    const FORECAST_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=imperial&cnt=3`;
    const ALERTS_URL = `https://api.weather.gov/alerts/active?point=${LAT},${LON}`;

    const [currentRes, forecastRes, alertsRes] = await Promise.all([
      fetch(CURRENT_URL),
      fetch(FORECAST_URL),
      fetch(ALERTS_URL, {
        headers: { "User-Agent": "FallRiverConnect/1.0 (contact@fallriverconnect.app)" },
      }),
    ]);

    if (!currentRes.ok) {
      const errText = await currentRes.text();
      console.error("OpenWeather current error:", currentRes.status, errText);
      throw new Error(`OpenWeather error: ${currentRes.status}`);
    }

    const current = await currentRes.json();
    const forecast = forecastRes.ok ? await forecastRes.json() : null;

    // Parse NWS alerts
    let alerts: { event: string; severity: string; headline: string; description: string }[] = [];
    if (alertsRes.ok) {
      try {
        const alertData = await alertsRes.json();
        alerts = (alertData.features || []).map((f: any) => ({
          event: f.properties?.event || "Alert",
          severity: f.properties?.severity || "Unknown",
          headline: f.properties?.headline || "",
          description: (f.properties?.description || "").slice(0, 300),
        }));
      } catch {
        console.error("Failed to parse NWS alerts");
      }
    }

    const icon = owmIcon(current.weather?.[0]?.icon || "01d");
    const label = current.weather?.[0]?.description
      ? current.weather[0].description.charAt(0).toUpperCase() + current.weather[0].description.slice(1)
      : "Clear";

    const sunrise = fmtTime(current.sys?.sunrise || 0);
    const sunset = fmtTime(current.sys?.sunset || 0);

    // Daylight calculation
    let daylightHrs = "";
    if (current.sys?.sunrise && current.sys?.sunset) {
      const diff = (current.sys.sunset - current.sys.sunrise) / 3600;
      daylightHrs = diff.toFixed(1) + "h";
    }

    // Build hourly forecast from 3-hour intervals (OpenWeather free gives 3h intervals)
    // We get up to 3 entries = 9 hours of forecast
    const hourly: { time: string; temp: number; rainProb: number; icon: string; isNow: boolean }[] = [];
    
    // First entry is "Now" with current conditions
    hourly.push({
      time: "Now",
      temp: Math.round(current.main?.temp ?? 0),
      rainProb: current.clouds?.all ?? 0,
      icon,
      isNow: true,
    });

    // Add forecast entries
    if (forecast?.list) {
      for (let i = 0; i < forecast.list.length && hourly.length < 7; i++) {
        const entry = forecast.list[i];
        hourly.push({
          time: fmtHour(entry.dt),
          temp: Math.round(entry.main?.temp ?? 0),
          rainProb: Math.round((entry.pop ?? 0) * 100),
          icon: owmIcon(entry.weather?.[0]?.icon || "01d"),
          isNow: false,
        });
      }
    }

    const rainProb = forecast?.list?.[0] ? Math.round((forecast.list[0].pop ?? 0) * 100) : 0;

    const weather = {
      temp: Math.round(current.main?.temp ?? 0),
      precip: current.rain?.["1h"] ?? 0,
      wind: Math.round(current.wind?.speed ?? 0),
      rainProb,
      label,
      icon,
      sunrise,
      sunset,
      daylight: daylightHrs,
      hourly,
      alerts,
    };

    return new Response(JSON.stringify(weather), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fetch-weather error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
