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
  remainingTrains: {time: string;dir: string;}[];
}

const MbtaWidget = ({
  selectedTrainId, setSelectedTrainId,
  selectedStation, setSelectedStation,
  trainRoute,
  trainCountdown, trainUrgent, trainDir, trainDepTime, trainAfter,
  remainingTrains
}: MbtaWidgetProps) =>
<div className="p-4 bg-card border-0 opacity-100 shadow-card-hover rounded-sm">
    <div className="flex items-center gap-2 mb-2 flex-wrap">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-7 h-7 text-primary p-1 rounded-full bg-primary/10 flex-shrink-0">
        <rect x="4" y="3" width="16" height="16" rx="2" />
        <path d="M4 11h16M12 3v8" />
        <circle cx="8.5" cy="14.5" r="1" />
        <circle cx="15.5" cy="14.5" r="1" />
        <path d="M8 19l-2 2M16 19l2 2" />
      </svg>
      <span className="text-[9px] font-semibold tracking-widest uppercase px-2 py-1 rounded-full bg-primary/[0.08] text-primary">
        MBTA Commuter Rail
      </span>
    </div>

    {/* Route + Station selectors */}
    <div className="flex flex-wrap gap-2 mb-2">
      <Select value={selectedTrainId} onValueChange={setSelectedTrainId}>
        <SelectTrigger className="h-7 w-auto min-w-[180px] text-[11px] bg-muted/50 rounded-full px-3 gap-1.5 border-none">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MBTA_ROUTES.map((r) =>
        <SelectItem key={r.id} value={r.id} className="text-[12px]">{r.name}</SelectItem>
        )}
        </SelectContent>
      </Select>
      <Select value={selectedStation} onValueChange={setSelectedStation}>
        <SelectTrigger className="h-7 w-auto min-w-[140px] text-[11px] bg-muted/50 rounded-full px-3 gap-1.5 border-none">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {trainRoute.stations.map((s) =>
        <SelectItem key={s} value={s} className="text-[12px]">📍 {s}</SelectItem>
        )}
        </SelectContent>
      </Select>
    </div>

    {/* Clickable route name */}
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-sm font-bold text-foreground hover:text-primary transition-colors cursor-pointer text-left">
          {trainRoute.name} <span className="text-[10px] text-muted-foreground">▾</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-2 px-2">Select Route</div>
        {MBTA_ROUTES.map((r) =>
      <button
        key={r.id}
        onClick={() => setSelectedTrainId(r.id)}
        className={`w-full text-left text-[12px] py-2 px-2 rounded-lg transition-colors ${
        r.id === selectedTrainId ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50 text-foreground'}`
        }>
        
            {r.name}
          </button>
      )}
      </PopoverContent>
    </Popover>
    <div className="text-[11px] text-muted-foreground">{trainDir}</div>

    <div className="flex justify-between items-center mt-2">
      <Popover>
        <PopoverTrigger asChild>
          <button
          className={`mono text-3xl font-semibold tracking-tight cursor-pointer hover:opacity-80 transition-opacity ${trainUrgent ? 'text-amber-500' : 'text-primary'}`}
          style={trainUrgent ? { animation: 'urgent-pulse 1s ease infinite' } : {}}>
          
            {trainCountdown}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0 max-h-72 overflow-auto" align="start">
          <div className="p-3 border-b border-muted/60">
            <div className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
              Remaining at {selectedStation} · {trainRoute.name}
            </div>
          </div>
          <div className="p-2">
            {remainingTrains.length === 0 ?
          <div className="text-[12px] text-muted-foreground p-2">No more departures today</div> :
          remainingTrains.map((d, i) =>
          <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-muted/50 transition-colors">
                <span className="mono text-[13px] font-medium text-foreground">{d.time}</span>
                <span className="text-[11px] text-muted-foreground">{d.dir}</span>
              </div>
          )}
          </div>
        </PopoverContent>
      </Popover>
      <div className="text-right">
        <div className="text-[10px] text-muted-foreground font-medium">Departs at</div>
        <div className="mono text-base text-foreground">{trainDepTime}</div>
      </div>
    </div>
    <div className="text-[11px] text-muted-foreground mt-2">{trainAfter}</div>
    <div className="text-[10px] text-muted-foreground/60 mt-1">Tap countdown for full schedule</div>
  </div>;


export default MbtaWidget;