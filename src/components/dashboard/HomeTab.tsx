import { useState, useEffect, useCallback } from 'react';
import { TRAIN_DEPS, BUS_DEPS, t2m, nowSec, fmtCD } from '@/data/transit';
import { RESTAURANTS } from '@/data/restaurants';
import { EVENTS } from '@/data/events';
import { fetchWeather, WeatherData } from '@/data/weather';

const HomeTab = () => {
  const [clock, setClock] = useState('Loading…');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [trainCountdown, setTrainCountdown] = useState('--:--');
  const [trainUrgent, setTrainUrgent] = useState(false);
  const [trainDir, setTrainDir] = useState('Calculating…');
  const [trainDepTime, setTrainDepTime] = useState('--');
  const [trainAfter, setTrainAfter] = useState('Next: --');
  const [busCountdown, setBusCountdown] = useState('--:--');
  const [busDep, setBusDep] = useState('--');
  const [busAfter, setBusAfter] = useState('Next: --');

  const eventsThisWeek = (() => {
    const now = new Date();
    const wk = new Date(now);
    wk.setDate(wk.getDate() + 7);
    return EVENTS.filter(e => { const d = new Date(e.date); return d >= now && d <= wk; }).length;
  })();

  const upcomingEvents = EVENTS.filter(e => new Date(e.date) >= new Date()).slice(0, 6);

  const tick = useCallback(() => {
    const n = new Date();
    setClock(
      n.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
      ' · ' +
      n.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );

    const ns = nowSec();

    // Train
    let tn: { time: string; dir: string; ds: number } | null = null;
    let ta: { time: string; dir: string } | null = null;
    for (const d of TRAIN_DEPS) {
      const ds = t2m(d.time) * 60;
      if (ds > ns) {
        if (!tn) tn = { ...d, ds };
        else if (!ta) { ta = { ...d }; break; }
      }
    }
    if (tn) {
      const diff = tn.ds - ns;
      setTrainCountdown(fmtCD(diff) || '--:--');
      setTrainUrgent(diff < 300);
      setTrainDepTime(tn.time);
      setTrainDir(tn.dir);
      setTrainAfter(ta ? 'Next after: ' + ta.time + ' · ' + ta.dir : 'No more trains today');
    } else {
      setTrainCountdown('Done');
      setTrainUrgent(false);
      setTrainDepTime('—');
      setTrainAfter('Service resumes tomorrow');
    }

    // Bus
    let bn: { time: string; ds: number } | null = null;
    let ba: { time: string } | null = null;
    for (const t of BUS_DEPS) {
      const ds = t2m(t) * 60;
      if (ds > ns) {
        if (!bn) bn = { time: t, ds };
        else if (!ba) { ba = { time: t }; break; }
      }
    }
    if (bn) {
      const diff = bn.ds - ns;
      setBusCountdown(fmtCD(diff) || '--:--');
      setBusDep(bn.time);
      setBusAfter(ba ? 'Next: ' + ba.time : 'Last trip');
    } else {
      setBusCountdown('Done');
      setBusDep('—');
      setBusAfter('Resumes 6:10 AM');
    }
  }, []);

  useEffect(() => {
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  useEffect(() => {
    fetchWeather().then(setWeather);
    const interval = setInterval(() => fetchWeather().then(setWeather), 600000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-[18px]">
        <div>
          <div className="text-2xl font-extrabold text-white">Fall River</div>
          <div className="mono text-xs text-muted-foreground mt-0.5">{clock}</div>
        </div>
        <div className="inline-flex items-center gap-[5px] text-[10px] font-bold tracking-[0.10em] uppercase"
             style={{ color: '#34d399' }}>
          <span className="w-[7px] h-[7px] rounded-full inline-block"
                style={{ background: '#34d399', animation: 'live-pulse 2s ease infinite' }} />
          Live
        </div>
      </div>

      {/* Weather Card */}
      <div className="p-5 rounded-[20px] backdrop-blur-[12px]"
           style={{
             background: 'linear-gradient(135deg, hsla(211,100%,50%,0.13), hsla(211,100%,50%,0.03))',
             border: '1px solid hsla(211,100%,50%,0.22)',
           }}>
        <div className="flex justify-between items-start">
          <div>
            <div className="text-[11px] font-bold tracking-[0.15em] uppercase text-primary">📍 Fall River, MA</div>
            <div className="mono text-[52px] font-light leading-none text-white">
              {weather ? weather.temp : '--'}<sup className="text-xl align-super">°F</sup>
            </div>
            <div className="text-[13px] text-muted-foreground mt-[3px]">
              {weather ? weather.label : 'Fetching weather…'}
            </div>
          </div>
          <div className="flex-shrink-0 w-[52px] h-[52px] flex items-center justify-center text-[42px] leading-none">
            {weather ? weather.icon : '🌤'}
          </div>
        </div>

        {/* Detail rows */}
        <div className="flex gap-3.5 flex-wrap mt-3 pt-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <DetailItem icon="precip" label="Precip" value={weather ? weather.precip + '"' : '--'} />
          <DetailItem icon="wind" label="Wind" value={weather ? weather.wind + ' mph' : '--'} />
          <DetailItem icon="rain" label="Rain" value={weather ? weather.rainProb + '%' : '--%'} />
        </div>
        <div className="flex gap-3.5 flex-wrap mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-[5px] text-[11px]" style={{ color: '#FFD700' }}>
            Rise: <strong className="font-semibold">{weather?.sunrise ?? '--'}</strong>
          </div>
          <div className="flex items-center gap-[5px] text-[11px]" style={{ color: '#f97316' }}>
            Set: <strong className="font-semibold">{weather?.sunset ?? '--'}</strong>
          </div>
          <div className="flex items-center gap-[5px] text-[11px] text-muted-foreground">
            {weather?.daylight ?? '--'} daylight
          </div>
        </div>

        {/* Hourly */}
        <div className="mt-3 pt-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground mb-2">Next 6 Hours</div>
          <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {weather?.hourly.length ? weather.hourly.map((h, i) => (
              <div key={i} className={`flex-shrink-0 flex flex-col items-center gap-1 py-2 px-2.5 rounded-xl min-w-[52px] ${
                h.isNow
                  ? 'bg-[hsla(211,100%,50%,0.12)] border border-[hsla(211,100%,50%,0.30)]'
                  : 'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)]'
              }`}>
                <div className="mono text-[10px] text-muted-foreground">{h.time}</div>
                <div className="text-base leading-none">{h.icon}</div>
                <div className="mono text-[13px] font-semibold text-white">{h.temp}°</div>
                <div className="text-[10px] text-primary">{h.rainProb}%</div>
              </div>
            )) : (
              <div className="text-[11px] text-muted-foreground py-2">Loading…</div>
            )}
          </div>
        </div>
      </div>

      {/* Transit Card */}
      <div className="mt-3 p-[18px_22px] rounded-[20px] backdrop-blur-[12px]"
           style={{
             background: 'linear-gradient(135deg, hsla(211,100%,50%,0.09), hsla(211,50%,20%,0.08))',
             border: '1px solid hsla(211,100%,50%,0.20)',
           }}>
        <div className="flex items-center gap-2 mb-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth={1.8} className="w-[18px] h-[18px]">
            <rect x="4" y="3" width="16" height="16" rx="2" />
            <path d="M4 11h16M12 3v8" />
            <circle cx="8.5" cy="14.5" r="1" />
            <circle cx="15.5" cy="14.5" r="1" />
            <path d="M8 19l-2 2M16 19l2 2" />
          </svg>
          <span className="text-[9px] font-bold tracking-[0.12em] uppercase px-2.5 py-[3px] rounded-[20px]"
                style={{ background: 'hsla(211,100%,50%,0.20)', color: 'hsl(var(--primary))', border: '1px solid hsla(211,100%,50%,0.30)' }}>
            MBTA Commuter Rail · Next Departure
          </span>
        </div>
        <div className="text-[13px] font-bold text-white">Fall River / New Bedford Line</div>
        <div className="text-[11px] text-muted-foreground">{trainDir}</div>
        <div className="flex justify-between items-center mt-2.5">
          <div className={`mono text-[38px] font-semibold tracking-[0.02em] text-primary ${trainUrgent ? 'text-accent' : ''}`}
               style={trainUrgent ? { animation: 'urgent-pulse 1s ease infinite', color: '#FFD700' } : {}}>
            {trainCountdown}
          </div>
          <div className="text-right">
            <div className="text-[10px] text-muted-foreground">Departs at</div>
            <div className="mono text-[17px] text-foreground font-normal">{trainDepTime}</div>
          </div>
        </div>
        <div className="text-[11px] text-muted-foreground mt-2">{trainAfter}</div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="p-4 rounded-[20px] backdrop-blur-[12px]"
             style={{ background: 'hsl(var(--glass))', border: '1px solid hsl(var(--glass-border))' }}>
          <div className="mb-2 opacity-80">
            <svg viewBox="0 0 24 24" fill="none" stroke="hsl(var(--secondary))" strokeWidth={1.8} className="w-[22px] h-[22px]">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
              <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
            </svg>
          </div>
          <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground mb-1">Events This Week</div>
          <div className="mono text-2xl font-light text-white">{eventsThisWeek}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Library &amp; Community</div>
        </div>
        <div className="p-4 rounded-[20px] backdrop-blur-[12px]"
             style={{ background: 'hsl(var(--glass))', border: '1px solid hsl(var(--glass-border))' }}>
          <div className="mb-2 opacity-80">
            <svg viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth={1.8} className="w-[22px] h-[22px]">
              <path d="M3 2l1.5 14.5M7.5 2v6.5a3 3 0 0 0 6 0V2M21 2c0 7-3 10-3 10v9" />
            </svg>
          </div>
          <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground mb-1">Local Eats</div>
          <div className="mono text-2xl font-light text-white">{RESTAURANTS.length}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Restaurants &amp; Cafés</div>
        </div>
      </div>

      {/* Bus Card */}
      <div className="mt-3 p-4 rounded-[20px] backdrop-blur-[12px]"
           style={{ background: 'rgba(5,7,15,0.65)', border: '1px solid hsl(var(--glass-border))' }}>
        <div className="flex items-center gap-2 mb-2.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth={1.8} className="w-4 h-4">
            <rect x="2" y="7" width="20" height="13" rx="2" />
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M6 20v1M18 20v1" />
            <circle cx="7" cy="13" r="1" />
            <circle cx="17" cy="13" r="1" />
          </svg>
          <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-primary">SRTA · Route 101 – South Main</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs text-muted-foreground">Outbound</div>
            <div className="mono text-[30px] font-light text-primary">{busCountdown}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-muted-foreground">Departs</div>
            <div className="mono text-base">{busDep}</div>
            <div className="text-[10px] text-muted-foreground mt-1">{busAfter}</div>
          </div>
        </div>
      </div>

      {/* Coming Up */}
      <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase text-muted-foreground my-4 mx-0
                      before:flex-1 before:h-px before:bg-[hsl(var(--glass-border))]
                      after:flex-1 after:h-px after:bg-[hsl(var(--glass-border))]">
        <svg viewBox="0 0 24 24" fill="none" stroke="hsl(var(--secondary))" strokeWidth={2} className="w-3 h-3">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
        Coming Up
      </div>
      <div className="flex flex-col gap-2">
        {upcomingEvents.map((e, i) => {
          const d = new Date(e.date);
          return (
            <div key={i} className="flex items-center gap-3 py-[11px] px-3.5 rounded-[14px]"
                 style={{ background: 'hsl(var(--glass))', border: '1px solid hsl(var(--glass-border))' }}>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'hsl(var(--secondary))' }} />
              <div className="text-[13px] font-semibold flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{e.name}</div>
              <div className="mono text-[10px] text-muted-foreground flex-shrink-0">
                {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

const DetailItem = ({ label, value }: { icon: string; label: string; value: string }) => (
  <div className="flex items-center gap-[5px] text-[11px] text-muted-foreground">
    <span>{label}: <strong className="text-foreground font-semibold">{value}</strong></span>
  </div>
);

export default HomeTab;
