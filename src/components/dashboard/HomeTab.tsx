import { useState, useEffect, useCallback, useMemo } from 'react';
import { DndContext, closestCenter, DragEndEvent, DragStartEvent, TouchSensor, MouseSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import type { NewsArticle } from '@/hooks/useNews';
import { useIsMobile } from '@/hooks/use-mobile';
import { MBTA_ROUTES, MBTA_STATIONS, SRTA_ROUTES, t2m, nowSec, fmtCD } from '@/data/transit';
import { useMbtaRealtime } from '@/hooks/useMbtaRealtime';
import { RESTAURANTS } from '@/data/restaurants';
import { EVENTS } from '@/data/events';
import type { CityEvent } from '@/data/events';
import type { WeatherData } from '@/data/weather';
import SortableWidgetItem from './SortableWidgetItem';
import WeatherWidget from './widgets/WeatherWidget';
import MbtaWidget from './widgets/MbtaWidget';
import SrtaWidget from './widgets/SrtaWidget';
import StatsWidget from './widgets/StatsWidget';
import ComingUpWidget from './widgets/ComingUpWidget';
import NewsPreviewWidget from './widgets/NewsPreviewWidget';
import QuickViewModal from './QuickViewModal';
import LotteryWidget from './widgets/LotteryWidget';
import { Settings, Check } from 'lucide-react';
import logo from '@/assets/logo.png';

const DEFAULT_ORDER = ['stats', 'coming-up', 'news', 'weather', 'srta', 'mbta'];
const STORAGE_KEY = 'fr-widget-order-v2';

function loadOrder(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as string[];
      // Re-validate against current default order
      if (DEFAULT_ORDER.every(id => parsed.includes(id)) && parsed.length === DEFAULT_ORDER.length) {
        return parsed;
      }
    }
  } catch { /* ignore */ }
  // Clear stale order
  localStorage.removeItem(STORAGE_KEY);
  return DEFAULT_ORDER;
}

const HomeTab = ({ onNavigate, newsArticles, onNewsClick, weather }: { onNavigate?: (tab: 'eats' | 'events') => void; newsArticles?: NewsArticle[]; onNewsClick?: () => void; weather?: WeatherData | null }) => {
  const isMobile = useIsMobile();
  const [widgetOrder, setWidgetOrder] = useState(loadOrder);
  const [selectedEvent, setSelectedEvent] = useState<CityEvent | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 0, tolerance: 5 } });
  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 3 } });
  const sensors = useSensors(touchSensor, mouseSensor);

  const upcomingCount = useMemo(() => EVENTS.filter(e => new Date(e.date) >= new Date()).length, []);
  const [eventOrder, setEventOrder] = useState<number[]>(() => Array.from({ length: Math.min(upcomingCount, 6) }, (_, i) => i));

  const isWeekend = useMemo(() => [0, 6].includes(new Date().getDay()), []);
  const [selectedTrainId, setSelectedTrainId] = useState(isWeekend ? 'weekend-inbound' : 'weekday-inbound');
  const [selectedStation, setSelectedStation] = useState<string>(MBTA_STATIONS[0]);
  const [selectedBusId, setSelectedBusId] = useState(SRTA_ROUTES[0].id);

  const trainRoute = useMemo(() => MBTA_ROUTES.find(r => r.id === selectedTrainId) ?? MBTA_ROUTES[0], [selectedTrainId]);
  const busRoute = useMemo(() => SRTA_ROUTES.find(r => r.id === selectedBusId) ?? SRTA_ROUTES[0], [selectedBusId]);

  const { predictions: mbtaPredictions } = useMbtaRealtime(selectedStation, selectedTrainId);

  const [trainCountdown, setTrainCountdown] = useState('--:--');
  const [trainUrgent, setTrainUrgent] = useState(false);
  const [trainDir, setTrainDir] = useState('Calculating…');
  const [trainDepTime, setTrainDepTime] = useState('--');
  const [trainAfter, setTrainAfter] = useState('Next: --');
  const [nextTrainStatus, setNextTrainStatus] = useState<string | undefined>();
  const [nextTrainDelayMin, setNextTrainDelayMin] = useState<number | undefined>();
  const [busCountdown, setBusCountdown] = useState('--:--');
  const [busDep, setBusDep] = useState('--');
  const [busAfter, setBusAfter] = useState('Next: --');
  const [remainingTrains, setRemainingTrains] = useState<{ time: string; dir: string; status?: string; delayMin?: number }[]>([]);
  const [remainingBuses, setRemainingBuses] = useState<string[]>([]);

  const eventsThisWeek = useMemo(() => {
    const now = new Date();
    const wk = new Date(now);
    wk.setDate(wk.getDate() + 7);
    return EVENTS.filter(e => { const d = new Date(e.date); return d >= now && d <= wk; }).length;
  }, []);

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return EVENTS.filter(e => {
      const d = new Date(e.date);
      d.setHours(0, 0, 0, 0);
      return d >= today;
    }).slice(0, 6);
  }, []);

  // Disable scrolling while dragging
  useEffect(() => {
    if (activeId) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [activeId]);

  const tick = useCallback(() => {
    const n = new Date();

    const ns = nowSec();

    const predMap = new Map<string, { predictedTime: string | null; status: string; delayMinutes: number }>();
    for (const p of mbtaPredictions) {
      if (p.scheduledTime) {
        predMap.set(p.scheduledTime, { predictedTime: p.predictedTime, status: p.status, delayMinutes: p.delayMinutes });
      }
    }

    // Determine top badge status directly from the first active real-time prediction
    const firstActivePred = mbtaPredictions.find(p => p.status !== 'CANCELLED');
    const liveStatus = firstActivePred?.status;
    const liveDelayMin = firstActivePred?.delayMinutes;

    const trainDeps = trainRoute.departures;
    let tn: { time: string; dir: string; ds: number; status?: string; delayMin?: number } | null = null;
    let ta: { time: string; dir: string; status?: string } | null = null;
    const remTrains: { time: string; dir: string; status?: string; delayMin?: number }[] = [];
    for (const d of trainDeps) {
      const stationTime = d.stops[selectedStation];
      if (!stationTime) continue;

      const pred = predMap.get(stationTime);
      const effectiveTime = pred?.predictedTime || stationTime;
      const ds = t2m(effectiveTime) * 60;

      if (ds > ns || pred?.status === 'CANCELLED') {
        remTrains.push({ time: stationTime, dir: d.dir, status: pred?.status || liveStatus, delayMin: pred?.delayMinutes ?? liveDelayMin });
        if (!tn && pred?.status !== 'CANCELLED') tn = { time: stationTime, dir: d.dir, ds, status: pred?.status || liveStatus, delayMin: pred?.delayMinutes ?? liveDelayMin };
        else if (!ta && pred?.status !== 'CANCELLED') ta = { time: stationTime, dir: d.dir, status: pred?.status || liveStatus };
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
      // Use direct API status for badge, falling back to matched prediction
      setNextTrainStatus(tn.status || liveStatus);
      setNextTrainDelayMin(tn.delayMin ?? liveDelayMin);
    } else {
      setTrainCountdown('Done');
      setTrainUrgent(false);
      setTrainDepTime('—');
      setTrainDir('No departures remaining');
      setTrainAfter('Service resumes tomorrow');
      setNextTrainStatus(undefined);
      setNextTrainDelayMin(undefined);
    }

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
  }, [trainRoute, busRoute, selectedStation, mbtaPredictions]);

  useEffect(() => {
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);


  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    try { navigator.vibrate?.(40); } catch {}
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (over && active.id !== over.id) {
      try { navigator.vibrate?.(50); } catch {}
      setWidgetOrder(prev => {
        const oldIndex = prev.indexOf(active.id as string);
        const newIndex = prev.indexOf(over.id as string);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(widgetOrder));
    setEditMode(false);
  };

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
        nextTrainStatus={nextTrainStatus}
        nextTrainDelayMin={nextTrainDelayMin}
        
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
    <div className="space-y-3 relative">
      {/* Edit mode overlay */}
      {editMode && (
        <div className="fixed inset-0 edit-overlay z-10 pointer-events-none" />
      )}

      {/* Header */}
      <div className="text-center -mt-4 -mb-12 pb-0 relative z-20">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={editMode ? handleSave : () => setEditMode(true)}
            className={`absolute left-0 top-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
              editMode
                ? 'bg-primary text-primary-foreground shadow-lg scale-110'
                : 'text-primary hover:text-primary/80'
            }`}
            aria-label={editMode ? 'Save layout' : 'Edit layout'}
          >
            {editMode ? <Check size={18} strokeWidth={3} /> : <Settings size={16} />}
          </button>
          <img src={logo} alt="Fall River Connect" className="h-64 w-auto" />
        </div>
        {editMode && (
          <div className="text-[11px] font-semibold text-primary mt-1 animate-fade-in">
            Drag to reorder · Tap ✓ to save
          </div>
        )}
      </div>

      {/* Widgets */}
      <div className="relative z-20">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={widgetOrder} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {widgetOrder.map((id) => (
                <SortableWidgetItem key={id} id={id} isEditMode={editMode}>
                  {widgetMap[id]}
                </SortableWidgetItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

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
