import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const API_KEY = "zpka_3a0024ebac7a459c8c90c5c510b17e98_b2a96850";
const LOCATION_KEY = "329505"; // Fall River, MA
const LAT = 41.7015;
const LON = -71.1551;

function accuIcon(iconNum: number): [string, string] {
  const map: Record<number, [string, string]> = {
    1: ["☀️", "Sunny"], 2: ["☀️", "Mostly Sunny"], 3: ["🌤", "Partly Sunny"],
    4: ["🌤", "Intermittent Clouds"], 5: ["🌤", "Hazy Sunshine"],
    6: ["⛅", "Mostly Cloudy"], 7: ["☁️", "Cloudy"], 8: ["☁️", "Overcast"],
    11: ["🌫", "Fog"], 12: ["🌧", "Showers"], 13: ["🌦", "Mostly Cloudy w/ Showers"],
    14: ["🌦", "Partly Sunny w/ Showers"], 15: ["⛈", "Thunderstorms"],
    16: ["⛈", "Mostly Cloudy w/ T-Storms"], 17: ["⛈", "Partly Sunny w/ T-Storms"],
    18: ["🌧", "Rain"], 19: ["🌨", "Flurries"], 20: ["🌨", "Mostly Cloudy w/ Flurries"],
    21: ["🌨", "Partly Sunny w/ Flurries"], 22: ["❄️", "Snow"],
    23: ["❄️", "Mostly Cloudy w/ Snow"], 24: ["🌨", "Ice"], 25: ["🌧", "Sleet"],
    26: ["🌨", "Freezing Rain"], 29: ["🌨", "Rain and Snow"],
    30: ["🥵", "Hot"], 31: ["🥶", "Cold"], 32: ["💨", "Windy"],
    33: ["🌙", "Clear"], 34: ["🌙", "Mostly Clear"], 35: ["🌙", "Partly Cloudy"],
    36: ["🌙", "Intermittent Clouds"], 37: ["🌙", "Hazy Moonlight"],
    38: ["☁️", "Mostly Cloudy"], 39: ["🌧", "Partly Cloudy w/ Showers"],
    40: ["🌧", "Mostly Cloudy w/ Showers"], 41: ["⛈", "Partly Cloudy w/ T-Storms"],
    42: ["⛈", "Mostly Cloudy w/ T-Storms"], 43: ["🌨", "Mostly Cloudy w/ Flurries"],
    44: ["❄️", "Mostly Cloudy w/ Snow"],
  };
  return map[iconNum] || ["🌤", "Variable"];
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
    const CURRENT_URL = `https://dataservice.accuweather.com/currentconditions/v1/${LOCATION_KEY}?apikey=${API_KEY}&details=true`;
    const HOURLY_URL = `https://dataservice.accuweather.com/forecasts/v1/hourly/12hour/${LOCATION_KEY}?apikey=${API_KEY}&details=true`;
    const DAILY_URL = `https://dataservice.accuweather.com/forecasts/v1/daily/1day/${LOCATION_KEY}?apikey=${API_KEY}&details=true`;
    const ALERTS_URL = `https://api.weather.gov/alerts/active?point=${LAT},${LON}`;

    const [curRes, hourlyRes, dailyRes, alertsRes] = await Promise.all([
      fetch(CURRENT_URL),
      fetch(HOURLY_URL),
      fetch(DAILY_URL),
      fetch(ALERTS_URL, {
        headers: { "User-Agent": "FallRiverConnect/1.0 (contact@fallriverconnect.app)" },
      }),
    ]);

    if (!curRes.ok) {
      const errText = await curRes.text();
      console.error("AccuWeather current error:", curRes.status, errText);
      throw new Error(`AccuWeather current conditions error: ${curRes.status}`);
    }
    if (!hourlyRes.ok) {
      const errText = await hourlyRes.text();
      console.error("AccuWeather hourly error:", hourlyRes.status, errText);
      throw new Error(`AccuWeather hourly forecast error: ${hourlyRes.status}`);
    }

    let dailyData: any = null;
    if (dailyRes.ok) {
      dailyData = await dailyRes.json();
    } else {
      console.error("AccuWeather daily error:", dailyRes.status, await dailyRes.text());
    }

    const curData = await curRes.json();
    const hourlyData = await hourlyRes.json();

    const cur = Array.isArray(curData) ? curData[0] : curData;

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

    const [icon, label] = accuIcon(cur.WeatherIcon ?? 1);

    // Sunrise/sunset from cur.Sun if available (detailed response)
    const sunrise = cur.Sun?.Rise ? fmtTime(cur.Sun.Rise) : "";
    const sunset = cur.Sun?.Set ? fmtTime(cur.Sun.Set) : "";
    let daylightHrs = "";
    if (cur.Sun?.Rise && cur.Sun?.Set) {
      const riseMs = new Date(cur.Sun.Rise).getTime();
      const setMs = new Date(cur.Sun.Set).getTime();
      daylightHrs = ((setMs - riseMs) / 3600000).toFixed(1) + "h";
    }

    // Build hourly
    const now = Date.now();
    const hourly = hourlyData.slice(0, 8).map((item: any, i: number) => {
      const t = new Date(item.DateTime);
      const lbl = t.toLocaleTimeString("en-US", { hour: "numeric", hour12: true, timeZone: "America/New_York" });
      const [hi] = accuIcon(item.WeatherIcon ?? 1);
      const isNow = i === 0 && Math.abs(t.getTime() - now) < 3 * 3600 * 1000;
      return {
        time: isNow ? "Now" : lbl,
        temp: Math.round(item.Temperature?.Value ?? 0),
        rainProb: item.PrecipitationProbability ?? 0,
        icon: hi,
        isNow,
      };
    });

    const weather = {
      temp: Math.round(cur.Temperature?.Imperial?.Value ?? 0),
      precip: cur.PrecipitationSummary?.Past12Hours?.Imperial?.Value ?? 0,
      wind: Math.round(cur.Wind?.Speed?.Imperial?.Value ?? 0),
      rainProb: hourlyData[0]?.PrecipitationProbability ?? 0,
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
