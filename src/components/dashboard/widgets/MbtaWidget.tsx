import { MBTA_ROUTES, MBTA_STATIONS } from '@/data/transit';
import type { TrainRoute } from '@/data/transit';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from
'@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

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
  remainingTrains: {time: string; dir: string; status?: string; delayMin?: number}[];
  nextTrainStatus?: string;
  nextTrainDelayMin?: number;
}

function StatusBadge({ status, delayMin }: { status?: string; delayMin?: number }) {
  if (!status) return null;
  if (status === 'CANCELLED') {
    return <span className="text-[10px] font-black uppercase text-destructive bg-destructive/15 px-1.5 py-0.5 rounded">CANCELLED</span>;
  }
  if (status === 'Scheduled') {
    return <span className="text-[10px] font-semibold text-accent">Scheduled</span>;
  }
  if (status.includes('Late')) {
    return <span className="text-[10px] font-bold text-destructive">{status}</span>;
  }
  return <span className="text-[10px] font-semibold text-primary">On Time</span>;
}

function TopStatusBadge({ status, delayMin }: { status?: string; delayMin?: number }) {
  const base = "text-[13px] font-bold px-3.5 py-1.5 rounded-full shadow-sm";
  if (status === 'CANCELLED') {
    return <span className={`${base} uppercase text-destructive-foreground bg-destructive`}>CANCELLED</span>;
  }
  if (delayMin && delayMin > 0) {
    return <span className={`${base} text-destructive-foreground bg-destructive`}>{delayMin} min Late</span>;
  }
  if (delayMin && delayMin < 0) {
    return <span className={`${base} text-primary-foreground bg-primary`}>{Math.abs(delayMin)} min Early</span>;
  }
  if (status === 'On Time') {
    return <span className={`${base} text-primary-foreground bg-primary`}>On Time</span>;
  }
  return <span className={`${base} text-foreground bg-accent/30`}>Scheduled</span>;
}

const MbtaWidget = ({
  selectedTrainId, setSelectedTrainId,
  selectedStation, setSelectedStation,
  trainRoute,
  trainCountdown, trainUrgent, trainDir, trainDepTime, trainAfter,
  remainingTrains,
  nextTrainStatus,
  nextTrainDelayMin,
}: MbtaWidgetProps) =>
<div className="glass-card p-6 py-[15px]">
    <div className="flex items-center gap-2 mb-3 flex-wrap">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-primary">
          <rect x="4" y="3" width="16" height="16" rx="2" />
          <path d="M4 11h16M12 3v8" />
          <circle cx="8.5" cy="14.5" r="1" />
          <circle cx="15.5" cy="14.5" r="1" />
          <path d="M8 19l-2 2M16 19l2 2" />
        </svg>
      </div>
      <span className="text-[9px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full bg-primary/[0.06] text-primary">
        MBTA Commuter Rail
      </span>
      <div className="ml-auto">
        <TopStatusBadge status={nextTrainStatus} delayMin={nextTrainDelayMin} />
      </div>
    </div>

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
                    <StatusBadge status={d.status} delayMin={d.delayMin} />
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
        <StatusBadge status={nextTrainStatus} delayMin={nextTrainDelayMin} />
      </div>
    </div>
    <div className="text-[11px] text-muted-foreground mt-2">{trainAfter}</div>
    <div className="text-[10px] text-muted-foreground/50 mt-1">Tap countdown for full schedule</div>
  </div>;


export default MbtaWidget;
