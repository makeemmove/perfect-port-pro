import { SRTA_ROUTES } from '@/data/transit';
import type { BusRoute } from '@/data/transit';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

interface SrtaWidgetProps {
  selectedBusId: string;
  setSelectedBusId: (id: string) => void;
  busRoute: BusRoute;
  busCountdown: string;
  busDep: string;
  busAfter: string;
  remainingBuses: string[];
}

const SrtaWidget = ({
  selectedBusId, setSelectedBusId,
  busRoute,
  busCountdown, busDep, busAfter,
  remainingBuses
}: SrtaWidgetProps) => (
  <div className="glass-card p-6">
    <div className="flex items-center gap-2 mb-3 flex-wrap">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-primary">
          <rect x="2" y="7" width="20" height="13" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M6 20v1M18 20v1" />
          <circle cx="7" cy="13" r="1" />
          <circle cx="17" cy="13" r="1" />
        </svg>
      </div>
      <span className="text-[9px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full bg-primary/[0.06] text-primary">
        SRTA
      </span>
      <Select value={selectedBusId} onValueChange={setSelectedBusId}>
        <SelectTrigger className="h-8 w-auto min-w-[180px] text-[11px] bg-muted/50 rounded-full px-3 gap-1.5 border-none">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SRTA_ROUTES.map((r) => (
            <SelectItem key={r.id} value={r.id} className="text-[12px]">{r.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <Popover>
      <PopoverTrigger asChild>
        <button className="text-sm font-bold text-foreground hover:text-primary transition-colors duration-300 cursor-pointer text-left">
          {busRoute.name} <span className="text-[10px] text-muted-foreground">▾</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2 max-h-80 overflow-auto rounded-2xl" align="start">
        <div className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-2 px-2">Select Route</div>
        {SRTA_ROUTES.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedBusId(r.id)}
            className={`w-full text-left text-[12px] py-2 px-2 rounded-xl transition-colors duration-300 ${
              r.id === selectedBusId ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50 text-foreground'
            }`}
          >
            {r.name}
          </button>
        ))}
      </PopoverContent>
    </Popover>
    <div className="text-[11px] text-muted-foreground mt-0.5">{busRoute.direction}</div>

    <div className="flex justify-between items-center mt-4">
      <Popover>
        <PopoverTrigger asChild>
          <button className="mono text-3xl font-semibold tracking-tight text-primary cursor-pointer hover:opacity-80 transition-all duration-300">
            {busCountdown}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0 max-h-72 overflow-auto rounded-2xl" align="start">
          <div className="p-3 border-b border-border/40">
            <div className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
              Remaining Departures · {busRoute.name}
            </div>
          </div>
          <div className="p-2">
            {remainingBuses.length === 0 ? (
              <div className="text-[12px] text-muted-foreground p-2">No more departures today</div>
            ) : (
              remainingBuses.map((t, i) => (
                <div key={i} className="flex items-center py-2 px-2 rounded-xl hover:bg-muted/50 transition-colors duration-300">
                  <span className="mono text-[13px] font-medium text-foreground">{t}</span>
                  <span className="text-[11px] text-muted-foreground ml-auto">{busRoute.direction}</span>
                </div>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
      <div className="text-right">
        <div className="text-[10px] text-muted-foreground font-medium">Departs at</div>
        <div className="mono text-base text-foreground">{busDep}</div>
      </div>
    </div>
    <div className="text-[11px] text-muted-foreground mt-2">{busAfter}</div>
    <div className="text-[10px] text-muted-foreground/50 mt-1">Tap countdown for full schedule</div>
  </div>
);

export default SrtaWidget;
