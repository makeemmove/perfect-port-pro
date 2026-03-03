import { useState, useEffect, useCallback, useMemo } from 'react';
import type { NewsArticle } from '@/hooks/useNews';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { MBTA_ROUTES, MBTA_STATIONS, SRTA_ROUTES, t2m, nowSec, fmtCD } from '@/data/transit';
import { RESTAURANTS } from '@/data/restaurants';
import { EVENTS } from '@/data/events';
import type { CityEvent } from '@/data/events';
import { fetchWeather, WeatherData } from '@/data/weather';
import DraggableWidget from './DraggableWidget';
import WeatherWidget from './widgets/WeatherWidget';
import MbtaWidget from './widgets/MbtaWidget';
import SrtaWidget from './widgets/SrtaWidget';
import StatsWidget from './widgets/StatsWidget';
import ComingUpWidget from './widgets/ComingUpWidget';
import NewsPreviewWidget from './widgets/NewsPreviewWidget';
import QuickViewModal from './QuickViewModal';

const DEFAULT_ORDER = ['stats', 'coming-up', 'weather', 'srta', 'mbta', 'news'];
const STORAGE_KEY = 'fr-widget-order';

function loadOrder(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as string[];
      if (DEFAULT_ORDER.every(id => parsed.includes(id)) && parsed.length === DEFAULT_ORDER.length) {
        return parsed;
      }
    }
  } catch { /* ignore */ }
  return DEFAULT_ORDER;
}

const HomeTab = ({ onNavigate, newsArticles, onNewsClick }: { onNavigate?: (tab: 'eats' | 'events') => void; newsArticles?: NewsArticle[]; onNewsClick?: () => void }) => {
  const [clock, setClock] = useState('Loading…');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [widgetOrder, setWidgetOrder] = useState(loadOrder);
  const [selectedEvent, setSelectedEvent] = useState<CityEvent | null>(null);
  const upcomingCount = useMemo(() => EVENTS.filter(e => new Date(e.date) >= new Date()).length, []);
  const [eventOrder, setEventOrder] = useState<number[]>(() => Array.from({ length: Math.min(upcomingCount, 6) }, (_, i) => i));

  /* Route & station selection state */
  const isWeekend = useMemo(() => [0, 6].includes(new Date().getDay()), []);
  const [selectedTrainId, setSelectedTrainId] = useState(isWeekend ? 'weekend-inbound' : 'weekday-inbound');
  const [selectedStation, setSelectedStation] = useState<string>(MBTA_STATIONS[0]);
  const [selectedBusId, setSelectedBusId] = useState(SRTA_ROUTES[0].id);

  const trainRoute = useMemo(() => MBTA_ROUTES.find(r => r.id === selectedTrainId) ?? MBTA_ROUTES[0], [selectedTrainId]);
  const busRoute = useMemo(() => SRTA_ROUTES.find(r => r.id === selectedBusId) ?? SRTA_ROUTES[0], [selectedBusId]);

  /* Transit countdown state */
  const [trainCountdown, setTrainCountdown] = useState('--:--');
  const [trainUrgent, setTrainUrgent] = useState(false);
  const [trainDir, setTrainDir] = useState('Calculating…');
  const [trainDepTime, setTrainDepTime] = useState('--');
  const [trainAfter, setTrainAfter] = useState('Next: --');
  const [busCountdown, setBusCountdown] = useState('--:--');
  const [busDep, setBusDep] = useState('--');
  const [busAfter, setBusAfter] = useState('Next: --');
  const [remainingTrains, setRemainingTrains] = useState<{ time: string; dir: string }[]>([]);
  const [remainingBuses, setRemainingBuses] = useState<string[]>([]);

  const eventsThisWeek = useMemo(() => {
    const now = new Date();
    const wk = new Date(now);
    wk.setDate(wk.getDate() + 7);
    return EVENTS.filter(e => { const d = new Date(e.date); return d >= now && d <= wk; }).length;
  }, []);

  const upcomingEvents = useMemo(() =>
    EVENTS.filter(e => new Date(e.date) >= new Date()).slice(0, 6),
  []);

  const tick = useCallback(() => {
    const n = new Date();
    setClock(
      n.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
      ' · ' +
      n.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );

    const ns = nowSec();

    /* Train — station-specific logic */
    const trainDeps = trainRoute.departures;
    let tn: { time: string; dir: string; ds: number } | null = null;
    let ta: { time: string; dir: string } | null = null;
    const remTrains: { time: string; dir: string }[] = [];
    for (const d of trainDeps) {
      const stationTime = d.stops[selectedStation];
      if (!stationTime) continue;
      const ds = t2m(stationTime) * 60;
      if (ds > ns) {
        remTrains.push({ time: stationTime, dir: d.dir });
        if (!tn) tn = { time: stationTime, dir: d.dir, ds };
        else if (!ta) ta = { time: stationTime, dir: d.dir };
      }
    }
    setRemainingTrains(remTrains);
    if (tn) {
      const diff = tn.ds - ns;
      setTrainCountdown(fmtCD(diff) || '--:--');
      setTrainUrgent(diff < 300);
      setTrainDepTime(tn.time);
      setTrainDir(tn.dir + ' · ' + selectedStation);
      setTrainAfter(ta ? 'Next after: ' + ta.time : 'No more trains today');
    } else {
      setTrainCountdown('Done');
      setTrainUrgent(false);
      setTrainDepTime('—');
      setTrainDir('No departures remaining');
      setTrainAfter('Service resumes tomorrow');
    }

    /* Bus */
    const busDeps = busRoute.departures;
    let bn: { time: string; ds: number } | null = null;
    let ba: { time: string } | null = null;
    const remBuses: string[] = [];
    for (const t of busDeps) {
      const ds = t2m(t) * 60;
      if (ds > ns) {
        remBuses.push(t);
        if (!bn) bn = { time: t, ds };
        else if (!ba) ba = { time: t };
      }
    }
    setRemainingBuses(remBuses);
    if (bn) {
      const diff = bn.ds - ns;
      setBusCountdown(fmtCD(diff) || '--:--');
      setBusDep(bn.time);
      setBusAfter(ba ? 'Next: ' + ba.time : 'Last trip');
    } else {
      setBusCountdown('Done');
      setBusDep('—');
      setBusAfter('Resumes tomorrow');
    }
  }, [trainRoute, busRoute, selectedStation]);

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

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setWidgetOrder(prev => {
        const oldIndex = prev.indexOf(active.id as string);
        const newIndex = prev.indexOf(over.id as string);
        const next = arrayMove(prev, oldIndex, newIndex);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    }
  }, []);

  const widgetMap: Record<string, React.ReactNode> = {
    weather: <WeatherWidget weather={weather} />,
    mbta: (
      <MbtaWidget
        selectedTrainId={selectedTrainId}
        setSelectedTrainId={setSelectedTrainId}
        selectedStation={selectedStation}
        setSelectedStation={setSelectedStation}
        trainRoute={trainRoute}
        trainCountdown={trainCountdown}
        trainUrgent={trainUrgent}
        trainDir={trainDir}
        trainDepTime={trainDepTime}
        trainAfter={trainAfter}
        remainingTrains={remainingTrains}
      />
    ),
    stats: <StatsWidget eventsThisWeek={eventsThisWeek} restaurantCount={RESTAURANTS.length} onNavigate={onNavigate} />,
    srta: (
      <SrtaWidget
        selectedBusId={selectedBusId}
        setSelectedBusId={setSelectedBusId}
        busRoute={busRoute}
        busCountdown={busCountdown}
        busDep={busDep}
        busAfter={busAfter}
        remainingBuses={remainingBuses}
      />
    ),
    'coming-up': <ComingUpWidget upcomingEvents={upcomingEvents} onEventClick={setSelectedEvent} eventOrder={eventOrder} onReorderEvents={setEventOrder} />,
    news: <NewsPreviewWidget articles={newsArticles || []} onNewsClick={onNewsClick} />,
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Fall River</h1>
        <div className="mono text-[11px] text-muted-foreground mt-0.5">{clock}</div>
      </div>

      {/* Draggable widgets */}
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={widgetOrder} strategy={verticalListSortingStrategy}>
          {widgetOrder.map(id => (
            <DraggableWidget key={id} id={id}>
              {widgetMap[id]}
            </DraggableWidget>
          ))}
        </SortableContext>
      </DndContext>

      <QuickViewModal
        open={!!selectedEvent}
        onOpenChange={(open) => { if (!open) setSelectedEvent(null); }}
        title={selectedEvent?.name || ''}
        description={selectedEvent?.desc}
        location={selectedEvent?.location}
        cost={selectedEvent?.cost}
        url={selectedEvent?.url}
        category={selectedEvent?.sub}
      />
    </div>
  );
};

export default HomeTab;
