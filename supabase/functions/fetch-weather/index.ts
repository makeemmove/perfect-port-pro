import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LAT = 41.7015;
const LON = -71.1551;

function wmoIcon(code: number, isDay: boolean): [string, string] {
  const map: Record<number, [string, string, string]> = {
    0: ["☀️", "🌙", "Clear"],
    1: ["🌤", "🌙", "Mostly Clear"],
    2: ["⛅", "☁️", "Partly Cloudy"],
    3: ["☁️", "☁️", "Overcast"],
    45: ["🌫", "🌫", "Fog"],
    48: ["🌫", "🌫", "Freezing Fog"],
    51: ["🌦", "🌧", "Light Drizzle"],
    53: ["🌦", "🌧", "Drizzle"],
    55: ["🌧", "🌧", "Heavy Drizzle"],
    56: ["🌨", "🌨", "Freezing Drizzle"],
    57: ["🌨", "🌨", "Heavy Freezing Drizzle"],
    61: ["🌧", "🌧", "Light Rain"],
    63: ["🌧", "🌧", "Rain"],
    65: ["🌧", "🌧", "Heavy Rain"],
    66: ["🌨", "🌨", "Freezing Rain"],
    67: ["🌨", "🌨", "Heavy Freezing Rain"],
    71: ["🌨", "🌨", "Light Snow"],
    73: ["❄️", "❄️", "Snow"],
    75: ["❄️", "❄️", "Heavy Snow"],
    77: ["🌨", "🌨", "Snow Grains"],
    80: ["🌦", "🌧", "Light Showers"],
    81: ["🌧", "🌧", "Showers"],
    82: ["🌧", "🌧", "Heavy Showers"],
    85: ["🌨", "🌨", "Light Snow Showers"],
    86: ["❄️", "❄️", "Heavy Snow Showers"],
    95: ["⛈", "⛈", "Thunderstorm"],
    96: ["⛈", "⛈", "Thunderstorm w/ Hail"],
    99: ["⛈", "⛈", "Thunderstorm w/ Heavy Hail"],
  };
  const entry = map[code] || ["🌤", "🌙", "Variable"];
  return [isDay ? entry[0] : entry[1], entry[2]];
}

function fmtTime(isoStr: string): string {
  return new Date(isoStr).toLocaleTimeString("en-US", {
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
    const METEO_URL = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,weather_code,wind_speed_10m,precipitation,is_day&hourly=temperature_2m,precipitation_probability,weather_code,is_day&daily=sunrise,sunset&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America/New_York&forecast_days=1`;
    const ALERTS_URL = `https://api.weather.gov/alerts/active?point=${LAT},${LON}`;

    const [meteoRes, alertsRes] = await Promise.all([
      fetch(METEO_URL),
      fetch(ALERTS_URL, {
        headers: { "User-Agent": "FallRiverConnect/1.0 (contact@fallriverconnect.app)" },
      }),
    ]);

    if (!meteoRes.ok) {
      const errText = await meteoRes.text();
      console.error("Open-Meteo error:", meteoRes.status, errText);
      throw new Error(`Open-Meteo error: ${meteoRes.status}`);
    }

    const meteo = await meteoRes.json();
    const cur = meteo.current;
    const hourlyData = meteo.hourly;
    const dailyData = meteo.daily;

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

    const isDay = cur.is_day === 1;
    const [icon, label] = wmoIcon(cur.weather_code ?? 0, isDay);

    // Sunrise/sunset
    const sunRise = dailyData?.sunrise?.[0];
    const sunSet = dailyData?.sunset?.[0];
    const sunrise = sunRise ? fmtTime(sunRise) : "";
    const sunset = sunSet ? fmtTime(sunSet) : "";
    let daylightHrs = "";
    if (sunRise && sunSet) {
      const riseMs = new Date(sunRise).getTime();
      const setMs = new Date(sunSet).getTime();
      daylightHrs = ((setMs - riseMs) / 3600000).toFixed(1) + "h";
    }

    // Build hourly (next 8 hours)
    const now = Date.now();
    const hourlyTimes: string[] = hourlyData.time || [];
    const hourly = [];
    let started = false;
    for (let i = 0; i < hourlyTimes.length && hourly.length < 8; i++) {
      const t = new Date(hourlyTimes[i]);
      if (!started && t.getTime() < now - 3600000) continue;
      started = true;
      const lbl = t.toLocaleTimeString("en-US", { hour: "numeric", hour12: true, timeZone: "America/New_York" });
      const hIsDay = (hourlyData.is_day?.[i] ?? 1) === 1;
      const [hi] = wmoIcon(hourlyData.weather_code?.[i] ?? 0, hIsDay);
      const isNow = hourly.length === 0;
      hourly.push({
        time: isNow ? "Now" : lbl,
        temp: Math.round(hourlyData.temperature_2m?.[i] ?? 0),
        rainProb: hourlyData.precipitation_probability?.[i] ?? 0,
        icon: hi,
        isNow,
      });
    }

    // Rain probability from first hourly entry
    const rainProb = hourly.length > 0 ? hourly[0].rainProb : 0;

    const weather = {
      temp: Math.round(cur.temperature_2m ?? 0),
      precip: cur.precipitation ?? 0,
      wind: Math.round(cur.wind_speed_10m ?? 0),
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
