import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const API_KEY = "c07bd9dae1e05e6549146b718568329b";
const LAT = 41.7015;
const LON = -71.1551;

function owmIcon(id: number): [string, string] {
  if (id >= 200 && id < 300) return ["⛈", "Thunderstorm"];
  if (id >= 300 && id < 400) return ["🌦", "Drizzle"];
  if (id >= 500 && id < 511) return ["🌧", "Rain"];
  if (id === 511) return ["🌨", "Freezing Rain"];
  if (id >= 520 && id < 600) return ["🌧", "Showers"];
  if (id >= 600 && id < 700) return ["❄️", "Snow"];
  if (id >= 700 && id < 800) return ["🌫", "Hazy"];
  if (id === 800) return ["☀️", "Clear"];
  if (id === 801) return ["🌤", "Mostly Clear"];
  if (id === 802) return ["⛅", "Partly Cloudy"];
  if (id >= 803) return ["☁️", "Overcast"];
  return ["🌤", "Variable"];
}

function fmtUnix(ts: number): string {
  return new Date(ts * 1000).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York",
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const CURRENT_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=imperial&appid=${API_KEY}`;
    const FORECAST_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&units=imperial&appid=${API_KEY}`;
    const ALERTS_URL = `https://api.weather.gov/alerts/active?point=${LAT},${LON}`;

    const [curRes, fcRes, alertsRes] = await Promise.all([
      fetch(CURRENT_URL),
      fetch(FORECAST_URL),
      fetch(ALERTS_URL, {
        headers: { "User-Agent": "FallRiverConnect/1.0 (contact@fallriverconnect.app)" },
      }),
    ]);

    if (!curRes.ok || !fcRes.ok) throw new Error("Weather API error");

    const cur = await curRes.json();
    const fc = await fcRes.json();

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

    const [icon, label] = owmIcon(cur.weather?.[0]?.id ?? 800);
    const sunrise = fmtUnix(cur.sys.sunrise);
    const sunset = fmtUnix(cur.sys.sunset);
    const daylightHrs = ((cur.sys.sunset - cur.sys.sunrise) / 3600).toFixed(1) + "h";

    // Build hourly from 3-hour forecast
    const hourly: any[] = [];
    const now = Date.now();
    for (let i = 0; i < Math.min(8, fc.list.length); i++) {
      const item = fc.list[i];
      const t = new Date(item.dt * 1000);
      const lbl = t.toLocaleTimeString("en-US", { hour: "numeric", hour12: true, timeZone: "America/New_York" });
      const [hi] = owmIcon(item.weather?.[0]?.id ?? 800);
      const isNow = i === 0 && Math.abs(item.dt * 1000 - now) < 3 * 3600 * 1000;
      hourly.push({
        time: isNow ? "Now" : lbl,
        temp: Math.round(item.main.temp),
        rainProb: Math.round((item.pop ?? 0) * 100),
        icon: hi,
        isNow,
      });
    }

    const weather = {
      temp: Math.round(cur.main.temp),
      precip: cur.rain?.["1h"] ?? cur.snow?.["1h"] ?? 0,
      wind: Math.round(cur.wind.speed),
      rainProb: Math.round((fc.list[0]?.pop ?? 0) * 100),
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
