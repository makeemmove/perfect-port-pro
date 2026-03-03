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

const OWM_KEY = 'c07bd9dae1e05e6549146b718568329b';
const OWM_URL = `https://api.openweathermap.org/data/3.0/onecall?lat=41.7015&lon=-71.1551&units=imperial&appid=${OWM_KEY}&exclude=minutely,alerts`;

// Fallback to free endpoints if One Call 3.0 isn't available
const OWM_CURRENT = `https://api.openweathermap.org/data/2.5/weather?lat=41.7015&lon=-71.1551&units=imperial&appid=${OWM_KEY}`;
const OWM_FORECAST = `https://api.openweathermap.org/data/2.5/forecast?lat=41.7015&lon=-71.1551&units=imperial&appid=${OWM_KEY}`;

function owmIcon(iconCode: string): string {
  const map: Record<string, string> = {
    '01d': '☀️', '01n': '🌙',
    '02d': '🌤', '02n': '☁️',
    '03d': '⛅', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧', '09n': '🌧',
    '10d': '🌦', '10n': '🌧',
    '11d': '⛈', '11n': '⛈',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫', '50n': '🌫',
  };
  return map[iconCode] || '🌤';
}

function fmtTime12(unix: number): string {
  return new Date(unix * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export async function fetchWeather(): Promise<WeatherData | null> {
  try {
    // Try One Call 3.0 first
    let useOneCall = true;
    let data: any;

    const res = await fetch(OWM_URL);
    if (res.ok) {
      data = await res.json();
    } else {
      useOneCall = false;
    }

    if (useOneCall && data) {
      const current = data.current;
      const sunrise = fmtTime12(current.sunrise);
      const sunset = fmtTime12(current.sunset);
      const daylightHrs = ((current.sunset - current.sunrise) / 3600).toFixed(1) + 'h';

      const hourly: WeatherData['hourly'] = [];
      for (let i = 0; i < 6 && i < (data.hourly?.length ?? 0); i++) {
        const h = data.hourly[i];
        const lbl = i === 0 ? 'Now' : new Date(h.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
        hourly.push({
          time: lbl,
          temp: Math.round(h.temp),
          rainProb: Math.round((h.pop ?? 0) * 100),
          icon: owmIcon(h.weather?.[0]?.icon || '01d'),
          isNow: i === 0,
        });
      }

      return {
        temp: Math.round(current.temp),
        precip: current.rain?.['1h'] ?? 0,
        wind: Math.round(current.wind_speed),
        rainProb: Math.round((data.hourly?.[0]?.pop ?? 0) * 100),
        label: current.weather?.[0]?.description ?? 'Variable',
        icon: owmIcon(current.weather?.[0]?.icon || '01d'),
        sunrise, sunset, daylight: daylightHrs,
        hourly,
      };
    }

    // Fallback: use free current + forecast endpoints
    const [curRes, fcRes] = await Promise.all([fetch(OWM_CURRENT), fetch(OWM_FORECAST)]);
    if (!curRes.ok) throw new Error('HTTP ' + curRes.status);
    const cur = await curRes.json();
    const fc = fcRes.ok ? await fcRes.json() : null;

    const sunrise = fmtTime12(cur.sys.sunrise);
    const sunset = fmtTime12(cur.sys.sunset);
    const daylightHrs = ((cur.sys.sunset - cur.sys.sunrise) / 3600).toFixed(1) + 'h';

    const hourly: WeatherData['hourly'] = [];
    if (fc?.list) {
      for (let i = 0; i < 6 && i < fc.list.length; i++) {
        const h = fc.list[i];
        const lbl = i === 0 ? 'Now' : new Date(h.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
        hourly.push({
          time: lbl,
          temp: Math.round(h.main.temp),
          rainProb: Math.round((h.pop ?? 0) * 100),
          icon: owmIcon(h.weather?.[0]?.icon || '01d'),
          isNow: i === 0,
        });
      }
    }

    return {
      temp: Math.round(cur.main.temp),
      precip: cur.rain?.['1h'] ?? 0,
      wind: Math.round(cur.wind.speed),
      rainProb: hourly[0]?.rainProb ?? 0,
      label: cur.weather?.[0]?.description ?? 'Variable',
      icon: owmIcon(cur.weather?.[0]?.icon || '01d'),
      sunrise, sunset, daylight: daylightHrs,
      hourly,
    };
  } catch (e) {
    console.error('Weather fetch error:', e);
    return null;
  }
}
