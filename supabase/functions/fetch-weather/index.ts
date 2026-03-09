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
    const FORECAST_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=imperial&cnt=40`;
    const ALERTS_URL = `https://api.weather.gov/alerts/active?point=${LAT},${LON}`;
    const SUNRISESUNSET_URL = `https://api.sunrise-sunset.org/json?lat=${LAT}&lng=${LON}&formatted=0`;

    const [currentRes, forecastRes, alertsRes, sunRes] = await Promise.all([
      fetch(CURRENT_URL),
      fetch(FORECAST_URL),
      fetch(ALERTS_URL, {
        headers: { "User-Agent": "FallRiverConnect/1.0 (contact@fallriverconnect.app)" },
      }),
      fetch(SUNRISESUNSET_URL),
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

    const iconCode = current.weather?.[0]?.icon || "01d";
    const icon = owmIcon(iconCode);
    const label = current.weather?.[0]?.description
      ? current.weather[0].description.charAt(0).toUpperCase() + current.weather[0].description.slice(1)
      : "Clear";

    // Use sunrise-sunset.org for accurate times, fallback to OWM
    let sunrise = fmtTime(current.sys?.sunrise || 0);
    let sunset = fmtTime(current.sys?.sunset || 0);
    let daylightHrs = "";

    if (sunRes.ok) {
      try {
        const sunData = await sunRes.json();
        if (sunData.status === "OK" && sunData.results) {
          const srDate = new Date(sunData.results.sunrise);
          const ssDate = new Date(sunData.results.sunset);
          sunrise = srDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "America/New_York" });
          sunset = ssDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "America/New_York" });
          const diffSec = (ssDate.getTime() - srDate.getTime()) / 1000 / 3600;
          daylightHrs = diffSec.toFixed(1) + "h";
        }
      } catch {
        console.error("Failed to parse sunrise-sunset.org data");
      }
    }

    if (!daylightHrs && current.sys?.sunrise && current.sys?.sunset) {
      const diff = (current.sys.sunset - current.sys.sunrise) / 3600;
      daylightHrs = diff.toFixed(1) + "h";
    }

    // Build 5-day forecast from 3-hour intervals
    const daily: { day: string; high: number; low: number; icon: string }[] = [];
    if (forecast?.list) {
      const dayMap: Record<string, { dayName: string; temps: number[]; icons: string[] }> = {};
      for (const entry of forecast.list) {
        const date = new Date(entry.dt * 1000);
        const dateKey = date.toLocaleDateString("en-US", { timeZone: "America/New_York" });
        const dayName = date.toLocaleDateString("en-US", { weekday: "short", timeZone: "America/New_York" });
        if (!dayMap[dateKey]) dayMap[dateKey] = { dayName, temps: [], icons: [] };
        dayMap[dateKey].temps.push(entry.main?.temp ?? 0);
        dayMap[dateKey].icons.push(entry.weather?.[0]?.icon || "01d");
      }
      for (const [, val] of Object.entries(dayMap)) {
        if (daily.length >= 7) break;
        const high = Math.round(Math.max(...val.temps));
        const low = Math.round(Math.min(...val.temps));
        const iconCounts: Record<string, number> = {};
        for (const ic of val.icons) { iconCounts[ic] = (iconCounts[ic] || 0) + 1; }
        const topIcon = Object.entries(iconCounts).sort((a, b) => b[1] - a[1])[0][0];
        daily.push({ day: val.dayName, high, low, icon: owmIcon(topIcon) });
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
      daily,
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
