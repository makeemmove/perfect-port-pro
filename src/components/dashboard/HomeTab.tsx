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
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Fall River</h1>
          <div className="mono text-[11px] text-muted-foreground mt-0.5">{clock}</div>
        </div>
        <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-emerald">
          <span className="w-[6px] h-[6px] rounded-full inline-block bg-emerald"
                style={{ animation: 'live-pulse 2s ease infinite' }} />
          Live
        </div>
      </div>

      {/* Weather Card */}
      <div className="p-5 rounded-2xl bg-card border border-border shadow-card">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-[10px] font-semibold tracking-widest uppercase text-primary">📍 Fall River, MA</div>
            <div className="mono text-5xl font-light leading-none text-foreground mt-1">
              {weather ? weather.temp : '--'}<sup className="text-lg align-super font-normal">°F</sup>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {weather ? weather.label : 'Fetching weather…'}
            </div>
          </div>
          <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center text-[42px] leading-none">
            {weather ? weather.icon : '🌤'}
          </div>
        </div>

        <div className="flex gap-4 flex-wrap mt-3 pt-3 border-t border-border">
          <DetailItem label="Precip" value={weather ? weather.precip + '"' : '--'} />
          <DetailItem label="Wind" value={weather ? weather.wind + ' mph' : '--'} />
          <DetailItem label="Rain" value={weather ? weather.rainProb + '%' : '--%'} />
        </div>
        <div className="flex gap-4 flex-wrap mt-2 pt-2 border-t border-border">
          <span className="text-[11px] text-amber-600 font-medium">☀ Rise: {weather?.sunrise ?? '--'}</span>
          <span className="text-[11px] text-orange font-medium">☀ Set: {weather?.sunset ?? '--'}</span>
          <span className="text-[11px] text-muted-foreground">{weather?.daylight ?? '--'} daylight</span>
        </div>

        {/* Hourly */}
        <div className="mt-3 pt-3 border-t border-border">
          <div className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-2">Next 6 Hours</div>
          <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {weather?.hourly.length ? weather.hourly.map((h, i) => (
              <div key={i} className={`flex-shrink-0 flex flex-col items-center gap-1 py-2 px-2.5 rounded-xl min-w-[52px] border transition-colors ${
                h.isNow
                  ? 'bg-primary/[0.06] border-primary/20'
                  : 'bg-muted/50 border-border'
              }`}>
                <div className="mono text-[10px] text-muted-foreground">{h.time}</div>
                <div className="text-base leading-none">{h.icon}</div>
                <div className="mono text-[13px] font-semibold text-foreground">{h.temp}°</div>
                <div className="text-[10px] text-primary font-medium">{h.rainProb}%</div>
              </div>
            )) : (
              <div className="text-[11px] text-muted-foreground py-2">Loading…</div>
            )}
          </div>
        </div>
      </div>

      {/* Transit Card */}
      <div className="p-5 rounded-2xl bg-card border border-border shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-4 h-4 text-primary">
            <rect x="4" y="3" width="16" height="16" rx="2" />
            <path d="M4 11h16M12 3v8" />
            <circle cx="8.5" cy="14.5" r="1" />
            <circle cx="15.5" cy="14.5" r="1" />
            <path d="M8 19l-2 2M16 19l2 2" />
          </svg>
          <span className="text-[9px] font-semibold tracking-widest uppercase px-2 py-1 rounded-full bg-primary/[0.08] text-primary border border-primary/15">
            MBTA Commuter Rail · Next Departure
          </span>
        </div>
        <div className="text-sm font-bold text-foreground">Fall River / New Bedford Line</div>
        <div className="text-[11px] text-muted-foreground">{trainDir}</div>
        <div className="flex justify-between items-center mt-3">
          <div className={`mono text-4xl font-semibold tracking-tight ${trainUrgent ? 'text-amber-500' : 'text-primary'}`}
               style={trainUrgent ? { animation: 'urgent-pulse 1s ease infinite' } : {}}>
            {trainCountdown}
          </div>
          <div className="text-right">
            <div className="text-[10px] text-muted-foreground font-medium">Departs at</div>
            <div className="mono text-base text-foreground">{trainDepTime}</div>
          </div>
        </div>
        <div className="text-[11px] text-muted-foreground mt-2">{trainAfter}</div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-card border border-border shadow-card">
          <div className="mb-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-5 h-5 text-secondary">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
              <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
            </svg>
          </div>
          <div className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">Events This Week</div>
          <div className="mono text-2xl font-light text-foreground">{eventsThisWeek}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Library &amp; Community</div>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border shadow-card">
          <div className="mb-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-5 h-5 text-gold">
              <path d="M3 2l1.5 14.5M7.5 2v6.5a3 3 0 0 0 6 0V2M21 2c0 7-3 10-3 10v9" />
            </svg>
          </div>
          <div className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">Local Eats</div>
          <div className="mono text-2xl font-light text-foreground">{RESTAURANTS.length}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Restaurants &amp; Cafés</div>
        </div>
      </div>

      {/* Bus Card */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-card">
        <div className="flex items-center gap-2 mb-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-4 h-4 text-primary">
            <rect x="2" y="7" width="20" height="13" rx="2" />
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M6 20v1M18 20v1" />
            <circle cx="7" cy="13" r="1" />
            <circle cx="17" cy="13" r="1" />
          </svg>
          <span className="text-[10px] font-semibold tracking-widest uppercase text-primary">SRTA · Route 101 – South Main</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-[11px] text-muted-foreground">Outbound</div>
            <div className="mono text-3xl font-light text-primary">{busCountdown}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-muted-foreground font-medium">Departs</div>
            <div className="mono text-base text-foreground">{busDep}</div>
            <div className="text-[10px] text-muted-foreground mt-1">{busAfter}</div>
          </div>
        </div>
      </div>

      {/* Coming Up */}
      <div className="flex items-center gap-3 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mt-2
                      before:flex-1 before:h-px before:bg-border
                      after:flex-1 after:h-px after:bg-border">
        ⚡ Coming Up
      </div>
      <div className="flex flex-col gap-2 pb-4">
        {upcomingEvents.map((e, i) => {
          const d = new Date(e.date);
          return (
            <div key={i} className="flex items-center gap-3 py-2.5 px-3.5 rounded-xl bg-card border border-border shadow-card hover:shadow-card-hover transition-shadow">
              <div className="w-2 h-2 rounded-full flex-shrink-0 bg-secondary" />
              <div className="text-[13px] font-medium flex-1 whitespace-nowrap overflow-hidden text-ellipsis text-foreground">{e.name}</div>
              <div className="mono text-[10px] text-muted-foreground flex-shrink-0">
                {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
    {label}: <strong className="text-foreground font-medium">{value}</strong>
  </div>
);

export default HomeTab;
