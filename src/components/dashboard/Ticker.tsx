import { useMemo } from 'react';
import { EVENTS } from '@/data/events';
import { MBTA_ROUTES, MBTA_STATIONS, SRTA_ROUTES, t2m, nowSec } from '@/data/transit';
import type { WeatherData } from '@/data/weather';

type TickerItem = { text: string; category: 'weather' | 'event' | 'transit' | 'community' };

const categoryColors: Record<TickerItem['category'], string> = {
  weather: 'text-accent',
  event: 'text-secondary',
  transit: 'text-primary',
  community: 'text-primary',
};

const Ticker = ({ weather }: { weather?: WeatherData | null }) => {
  const items = useMemo(() => {
    const result: TickerItem[] = [];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Today's weather
    if (weather) {
      result.push({
        text: `${weather.icon} ${weather.temp}°F — ${weather.label} · Wind ${weather.wind} mph · Rain ${weather.rainProb}%`,
        category: 'weather',
      });
    }

    // Today's events
    const todayEvents = EVENTS.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate.toISOString().split('T')[0] === todayStr;
    });

    for (const ev of todayEvents.slice(0, 4)) {
      const timeStr = ev.time ? ` · ${ev.time}` : '';
      const locStr = ev.location ? ` · ${ev.location}` : '';
      result.push({
        text: `TODAY: ${ev.name}${timeStr}${locStr}`,
        category: 'event',
      });
    }

    if (todayEvents.length === 0) {
      // Show next upcoming event
      const next = EVENTS[0];
      if (next) {
        const d = new Date(next.date);
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        result.push({
          text: `NEXT EVENT: ${next.name} — ${dayLabel}${next.location ? ` · ${next.location}` : ''}`,
          category: 'event',
        });
      }
    }

    // Next train to Boston
    const ns = nowSec();
    const weekday = ![0, 6].includes(today.getDay());
    const inboundRoute = MBTA_ROUTES.find(r => r.id === (weekday ? 'weekday-inbound' : 'weekend-inbound'));
    if (inboundRoute) {
      const station = MBTA_STATIONS[0]; // Fall River Depot
      for (const dep of inboundRoute.departures) {
        const stationTime = dep.stops[station];
        if (!stationTime) continue;
        const ds = t2m(stationTime) * 60;
        if (ds > ns) {
          result.push({
            text: `🚆 Next Train to Boston: ${stationTime} from ${station}`,
            category: 'transit',
          });
          break;
        }
      }
    }

    // Next SRTA bus
    for (const route of SRTA_ROUTES.slice(0, 1)) {
      for (const t of route.departures) {
        const ds = t2m(t) * 60;
        if (ds > ns) {
          result.push({
            text: `🚌 Next ${route.name}: ${t}`,
            category: 'transit',
          });
          break;
        }
      }
    }

    // Weather alerts
    if (weather?.alerts?.length) {
      for (const alert of weather.alerts.slice(0, 2)) {
        result.push({
          text: `⚠ ${alert.event}: ${alert.headline || alert.description.slice(0, 80)}`,
          category: 'weather',
        });
      }
    }

    // Fallback if nothing
    if (result.length === 0) {
      result.push({ text: 'Fall River Connect — Your daily city dashboard', category: 'community' });
    }

    return result;
  }, [weather]);

  const doubled = [...items, ...items];

  return (
    <div className="h-10 overflow-hidden flex items-center flex-shrink-0 relative glass-card rounded-none border-x-0 border-t-0">
      <div className="absolute top-0 bottom-0 left-0 w-16 z-[2] pointer-events-none bg-gradient-to-r from-background to-transparent" />
      <div className="absolute top-0 bottom-0 right-0 w-16 z-[2] pointer-events-none bg-gradient-to-l from-background to-transparent" />

      <div className="flex-shrink-0 px-4 text-[10px] font-semibold tracking-widest uppercase whitespace-nowrap z-[3] text-primary">
        ● Live
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex whitespace-nowrap text-[11px] text-muted-foreground px-4"
             style={{ animation: `ticker ${Math.max(30, items.length * 8)}s linear infinite` }}>
          {doubled.map((item, i) => (
            <span key={i} className="mr-12 text-foreground/70">
              <span className={`${categoryColors[item.category]} mr-1.5`}>▸</span>{item.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Ticker;
