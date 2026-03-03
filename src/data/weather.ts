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
  hourly: { time: string; temp: number; rainProb: number; icon: string; isNow: boolean }[];
}

const API_KEY = 'c07bd9dae1e05e6549146b718568329b';
const LAT = 41.7015;
const LON = -71.1551;

const CURRENT_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=imperial&appid=${API_KEY}`;
const FORECAST_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&units=imperial&appid=${API_KEY}`;

function owmIcon(id: number): [string, string] {
  if (id >= 200 && id < 300) return ['⛈', 'Thunderstorm'];
  if (id >= 300 && id < 400) return ['🌦', 'Drizzle'];
  if (id >= 500 && id < 511) return ['🌧', 'Rain'];
  if (id === 511) return ['🌨', 'Freezing Rain'];
  if (id >= 520 && id < 600) return ['🌧', 'Showers'];
  if (id >= 600 && id < 700) return ['❄️', 'Snow'];
  if (id >= 700 && id < 800) return ['🌫', 'Hazy'];
  if (id === 800) return ['☀️', 'Clear'];
  if (id === 801) return ['🌤', 'Mostly Clear'];
  if (id === 802) return ['⛅', 'Partly Cloudy'];
  if (id >= 803) return ['☁️', 'Overcast'];
  return ['🌤', 'Variable'];
}

function fmtUnix(ts: number): string {
  return new Date(ts * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export async function fetchWeather(): Promise<WeatherData | null> {
  try {
    const [curRes, fcRes] = await Promise.all([fetch(CURRENT_URL), fetch(FORECAST_URL)]);
    if (!curRes.ok || !fcRes.ok) throw new Error('HTTP error');
    const cur = await curRes.json();
    const fc = await fcRes.json();

    const [icon, label] = owmIcon(cur.weather?.[0]?.id ?? 800);
    const sunrise = fmtUnix(cur.sys.sunrise);
    const sunset = fmtUnix(cur.sys.sunset);
    const daylightHrs = ((cur.sys.sunset - cur.sys.sunrise) / 3600).toFixed(1) + 'h';

    // Build hourly from 3-hour forecast (take first 8 entries)
    const hourly: WeatherData['hourly'] = [];
    const now = Date.now();
    for (let i = 0; i < Math.min(8, fc.list.length); i++) {
      const item = fc.list[i];
      const t = new Date(item.dt * 1000);
      const lbl = t.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
      const [hi] = owmIcon(item.weather?.[0]?.id ?? 800);
      const isNow = i === 0 && Math.abs(item.dt * 1000 - now) < 3 * 3600 * 1000;
      hourly.push({
        time: isNow ? 'Now' : lbl,
        temp: Math.round(item.main.temp),
        rainProb: Math.round((item.pop ?? 0) * 100),
        icon: hi,
        isNow,
      });
    }

    return {
      temp: Math.round(cur.main.temp),
      precip: cur.rain?.['1h'] ?? cur.snow?.['1h'] ?? 0,
      wind: Math.round(cur.wind.speed),
      rainProb: Math.round((fc.list[0]?.pop ?? 0) * 100),
      label,
      icon,
      sunrise,
      sunset,
      daylight: daylightHrs,
      hourly,
    };
  } catch {
    return null;
  }
}
