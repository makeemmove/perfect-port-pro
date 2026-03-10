import { useState, useMemo } from 'react';
import { MBTA_ROUTES, MBTA_STATIONS } from '@/data/transit';
import type { TrainRoute } from '@/data/transit';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useMbtaRouteStatus, type StopPrediction } from '@/hooks/useMbtaRouteStatus';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Train, Clock, MapPin } from 'lucide-react';

interface MbtaWidgetProps {
  selectedTrainId: string;
  setSelectedTrainId: (id: string) => void;
  selectedStation: string;
  setSelectedStation: (s: string) => void;
  trainRoute: TrainRoute;
  trainCountdown: string;
  trainUrgent: boolean;
  trainDir: string;
  trainDepTime: string;
  trainAfter: string;
  remainingTrains: { time: string; dir: string; status?: string; delayMin?: number }[];
  nextTrainStatus?: string;
  nextTrainDelayMin?: number;
}

function StatusPill({ status, delayMin }: { status: string; delayMin?: number }) {
  let inlineStyle: React.CSSProperties = {};
  let label = status;

  if (status === 'CANCELLED') {
    inlineStyle = { backgroundColor: '#fee2e2', color: '#dc2626' };
    label = 'CANCELLED';
  } else if (status === 'On Time') {
    inlineStyle = { backgroundColor: 'hsl(var(--foreground) / 0.1)', color: 'hsl(var(--foreground))' };
  } else if (status.includes('late')) {
    inlineStyle = { backgroundColor: '#fee2e2', color: '#dc2626' };
  } else if (status.includes('early')) {
    inlineStyle = { backgroundColor: '#dcfce7', color: '#16a34a' };
  } else {
    inlineStyle = { backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' };
    label = 'Scheduled';
  }

  return (
    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full whitespace-nowrap" style={inlineStyle}>
      {label}
    </span>
  );
}

function TopStatusBadge({ status, delayMin }: { status?: string; delayMin?: number }) {
  const base = "text-[13px] font-bold px-3.5 py-1.5 rounded-full shadow-sm";
  if (status === 'CANCELLED') {
    return <span className={`${base} uppercase`} style={{ backgroundColor: '#dc2626', color: '#ffffff' }}>CANCELLED</span>;
  }
  if (delayMin !== undefined && delayMin > 0) {
    return <span className={`${base}`} style={{ backgroundColor: '#dc2626', color: '#ffffff' }}>{delayMin} min Late</span>;
  }
  if ((delayMin !== undefined && delayMin < 0) || status?.toLowerCase().includes('early')) {
    return <span className={`${base}`} style={{ backgroundColor: '#16a34a', color: '#ffffff' }}>{delayMin ? Math.abs(delayMin) : ''} min Early</span>;
  }
  return <span className={`${base} text-foreground`} style={{ backgroundColor: 'hsl(var(--foreground) / 0.1)', border: '1px solid hsl(var(--foreground) / 0.2)' }}>On Time</span>;
}

// Group predictions by trip to show route-level stop list
function groupByTrip(predictions: StopPrediction[]): Map<string, StopPrediction[]> {
  const map = new Map<string, StopPrediction[]>();
  for (const p of predictions) {
    const existing = map.get(p.tripId) || [];
    existing.push(p);
    map.set(p.tripId, existing);
  }
  return map;
}

const MbtaWidget = ({
  selectedTrainId, setSelectedTrainId,
  selectedStation, setSelectedStation,
  trainRoute,
  trainCountdown, trainUrgent, trainDir, trainDepTime, trainAfter,
  remainingTrains,
  nextTrainStatus,
  nextTrainDelayMin,
}: MbtaWidgetProps) => {
  const [showRouteView, setShowRouteView] = useState(false);
  const directionId = selectedTrainId.includes('inbound') ? '1' : '0';
  const { stopPredictions, isLoading: routeLoading, lastUpdated } = useMbtaRouteStatus(directionId);

  // Group by trip for route view
  const tripGroups = useMemo(() => {
    const grouped = groupByTrip(stopPredictions);
    // Sort trips by first stop's predicted/scheduled time
    return Array.from(grouped.entries()).slice(0, 3); // Show max 3 upcoming trips
  }, [stopPredictions]);

  return (
    <div className="glass-card p-6 py-[15px]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Train className="w-4 h-4 text-primary" />
        </div>
        <span className="text-[9px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full bg-primary/[0.06] text-primary">
          MBTA Commuter Rail
        </span>
        <div className="ml-auto">
          <TopStatusBadge status={nextTrainStatus} delayMin={nextTrainDelayMin} />
        </div>
      </div>

      {/* Route / Station selectors */}
      <div className="flex flex-wrap gap-2 mb-3">
        <Select value={selectedTrainId} onValueChange={setSelectedTrainId}>
          <SelectTrigger className="h-7 w-auto min-w-[140px] text-[11px] bg-muted/50 rounded-full px-3 gap-1.5 border-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MBTA_ROUTES.map((r) =>
              <SelectItem key={r.id} value={r.id} className="text-[12px]">{r.name}</SelectItem>
            )}
          </SelectContent>
        </Select>
        <Select value={selectedStation} onValueChange={setSelectedStation}>
          <SelectTrigger className="h-7 w-auto min-w-[120px] text-[11px] bg-muted/50 rounded-full px-3 gap-1.5 border-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {trainRoute.stations.map((s) =>
              <SelectItem key={s} value={s} className="text-[12px]">📍 {s}</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="text-[11px] text-muted-foreground">{trainDir}</div>

      {/* Countdown + departure */}
      <div className="flex justify-between items-center mt-4">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={`mono text-3xl font-semibold tracking-tight cursor-pointer hover:opacity-80 transition-all duration-300 ${trainUrgent ? 'text-accent' : 'text-primary'}`}
              style={trainUrgent ? { animation: 'urgent-pulse 1s ease infinite' } : {}}>
              {trainCountdown}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 max-h-72 overflow-auto rounded-2xl" align="start">
            <div className="p-3 border-b border-border/40">
              <div className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                Remaining at {selectedStation} · {trainRoute.name}
              </div>
            </div>
            <div className="p-2">
              {remainingTrains.length === 0 ?
                <div className="text-[12px] text-muted-foreground p-2">No more departures today</div> :
                remainingTrains.map((d, i) =>
                  <div key={i} className="flex items-center justify-between py-2 px-2 rounded-xl hover:bg-muted/50 transition-colors duration-300 gap-2">
                    <span className="mono text-[13px] font-medium text-foreground">{d.time}</span>
                    <div className="flex items-center gap-2">
                      <StatusPill status={d.status || 'Scheduled'} delayMin={d.delayMin} />
                      <span className="text-[11px] text-muted-foreground">{d.dir}</span>
                    </div>
                  </div>
                )
              }
            </div>
          </PopoverContent>
        </Popover>
      <div className="text-right space-y-1">
          <div className="text-[10px] text-muted-foreground font-medium">Departs at</div>
          <div className="mono text-base text-foreground">{trainDepTime}</div>
        </div>
      </div>
      <div className="text-[11px] text-muted-foreground mt-2">{trainAfter}</div>

      {/* Toggle route view */}
      <button
        onClick={() => setShowRouteView(!showRouteView)}
        className="mt-3 w-full text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-1.5 py-1.5 rounded-lg hover:bg-primary/5"
      >
        <MapPin className="w-3 h-3" />
        {showRouteView ? 'Hide All Stops' : 'View All Stops Status'}
      </button>

      {/* Per-stop predictions list */}
      {showRouteView && (
        <div className="mt-3 space-y-3 animate-fade-in">
          {/* Last updated */}
          {lastUpdated && (
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
              <RefreshCw className="w-2.5 h-2.5" />
              Updated {lastUpdated.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              <span className="ml-auto text-[9px]">Refreshes every 30s</span>
            </div>
          )}

          {routeLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : tripGroups.length === 0 ? (
            <div className="text-center py-6 text-[12px] text-muted-foreground">
              No predictions available right now
            </div>
          ) : (
            tripGroups.map(([tripId, stops], tripIdx) => (
              <div key={tripId} className="rounded-xl border border-border/40 overflow-hidden">
                {/* Trip header */}
                <div className="bg-muted/30 px-3 py-2 flex items-center justify-between border-b border-border/30">
                  <div className="flex items-center gap-2">
                    <Train className="w-3 h-3 text-primary" />
                    <span className="text-[11px] font-semibold text-foreground">
                      Train {tripIdx + 1}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {stops[0]?.direction}
                    </span>
                  </div>
                </div>

                {/* Stop rows */}
                <div className="divide-y divide-border/20">
                  {stops.map((stop, i) => (
                    <div
                      key={`${stop.stopId}-${i}`}
                      className="px-3 py-2.5 flex items-center gap-3 hover:bg-muted/20 transition-colors"
                    >
                      {/* Timeline dot */}
                      <div className="flex flex-col items-center flex-shrink-0 w-3">
                        <div className={`w-2 h-2 rounded-full ${
                          stop.status === 'On Time' ? 'bg-emerald-500' :
                          stop.status.includes('late') ? 'bg-destructive' :
                          stop.status.includes('early') ? 'bg-blue-500' :
                          stop.status === 'CANCELLED' ? 'bg-destructive' :
                          'bg-muted-foreground/40'
                        }`} />
                        {i < stops.length - 1 && (
                          <div className="w-px h-5 bg-border/50 mt-0.5" />
                        )}
                      </div>

                      {/* Stop info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-semibold text-foreground truncate">
                          {stop.stopName}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Clock className="w-2.5 h-2.5 text-muted-foreground/60" />
                          <span className="text-[10px] text-muted-foreground">
                            {stop.predictedTime || stop.scheduledTime || 'No time available'}
                          </span>
                          {stop.scheduledTime && stop.predictedTime && stop.scheduledTime !== stop.predictedTime && (
                            <span className="text-[9px] text-muted-foreground/50 line-through">
                              {stop.scheduledTime}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status */}
                      <StatusPill status={stop.status} delayMin={stop.delayMinutes} />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="text-[10px] text-muted-foreground/50 mt-1">Tap countdown for full schedule</div>
    </div>
  );
};

export default MbtaWidget;
