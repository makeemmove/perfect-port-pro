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

const WC: Record<number, [string, string]> = {
  0:['☀️','Clear'],1:['🌤','Mostly Clear'],2:['⛅','Partly Cloudy'],3:['☁️','Overcast'],
  45:['🌫','Foggy'],48:['🌫','Freezing Fog'],
  51:['🌦','Light Drizzle'],53:['🌦','Drizzle'],55:['🌧','Dense Drizzle'],
  56:['🌨','Freezing Drizzle'],57:['🌨','Heavy Freezing Drizzle'],
  61:['🌧','Light Rain'],63:['🌧','Rain'],65:['🌧','Heavy Rain'],
  66:['🌨','Freezing Rain'],67:['🌨','Heavy Freezing Rain'],
  71:['🌨','Light Snow'],73:['❄️','Snow'],75:['❄️','Heavy Snow'],77:['🌨','Snow Grains'],
  80:['🌦','Light Showers'],81:['🌧','Showers'],82:['⛈','Heavy Showers'],
  85:['🌨','Snow Showers'],86:['❄️','Heavy Snow Showers'],
  95:['⛈','Thunderstorm'],96:['⛈','Thunderstorm w/Hail'],99:['⛈','Heavy Thunderstorm'],
};

function wcInfo(code: number): [string, string] {
  const keys = Object.keys(WC).map(Number).sort((a, b) => a - b);
  const found = keys.filter(k => k <= code).pop();
  return found !== undefined ? WC[found] : ['🌤', 'Variable'];
}

function fmtTime12(isoStr: string): string {
  const d = new Date(isoStr);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast?latitude=41.7015&longitude=-71.1551&daily=sunrise,sunset&hourly=temperature_2m,wind_speed_10m,precipitation,precipitation_probability,weather_code&current=temperature_2m,precipitation,weather_code&timezone=America/New_York&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch';

export async function fetchWeather(): Promise<WeatherData | null> {
  try {
    const res = await fetch(WEATHER_URL);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const d = await res.json();
    const c = d.current;
    const now = new Date();

    const times: string[] = d.hourly.time;
    let hIdx = 0;
    const nowMs = now.getTime();
    for (let i = 0; i < times.length; i++) {
      const tMs = new Date(times[i]).getTime();
      if (tMs <= nowMs) hIdx = i; else break;
    }

    const windNow = d.hourly.wind_speed_10m[hIdx];
    const rainProb = d.hourly.precipitation_probability[hIdx] ?? 0;
    const [icon, label] = wcInfo(c.weather_code ?? 0);

    let sunrise = '--', sunset = '--', daylight = '--';
    if (d.daily?.sunrise?.[0]) {
      sunrise = fmtTime12(d.daily.sunrise[0]);
      sunset = fmtTime12(d.daily.sunset[0]);
      const rise = new Date(d.daily.sunrise[0]);
      const set = new Date(d.daily.sunset[0]);
      daylight = ((set.getTime() - rise.getTime()) / 3600000).toFixed(1) + 'h';
    }

    const hourly: WeatherData['hourly'] = [];
    for (let i = 0; i < 8; i++) {
      const idx = hIdx + i;
      if (idx >= times.length) break;
      const localT = new Date(times[idx]);
      const lbl = localT.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
      const temp = Math.round(d.hourly.temperature_2m[idx]);
      const rp = d.hourly.precipitation_probability[idx] ?? 0;
      const wc = d.hourly.weather_code?.[idx] ?? 0;
      const [hi] = wcInfo(wc);
      hourly.push({ time: i === 0 ? 'Now' : lbl, temp, rainProb: rp, icon: hi, isNow: i === 0 });
    }

    return {
      temp: Math.round(c.temperature_2m),
      precip: c.precipitation,
      wind: Math.round(windNow),
      rainProb,
      label,
      icon,
      sunrise, sunset, daylight,
      hourly,
    };
  } catch {
    return null;
  }
}
