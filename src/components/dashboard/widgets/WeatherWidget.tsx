import type { WeatherData } from '@/data/weather';

const WeatherWidget = ({ weather }: {weather: WeatherData | null;}) =>
<div className="p-4 bg-card border-border/40 shadow-card-hover border-0 rounded-sm opacity-100 py-[11px] px-[16px]">
    <div className="flex justify-between items-start">
      <div>
        <div className="text-[10px] font-semibold tracking-widest uppercase text-primary">📍 Fall River, MA</div>
        <div className="mono text-4xl font-light leading-none text-foreground mt-1">
          {weather ? weather.temp : '--'}<sup className="text-base align-super font-normal">°F</sup>
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          {weather ? weather.label : 'Fetching weather…'}
        </div>
      </div>
      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-[32px] leading-none">
        {weather ? weather.icon : '🌤'}
      </div>
    </div>

    <div className="flex gap-4 flex-wrap mt-2 pt-2 border-t border-border/30">
      <DetailItem label="Precip" value={weather ? weather.precip + '"' : '--'} />
      <DetailItem label="Wind" value={weather ? weather.wind + ' mph' : '--'} />
      <DetailItem label="Rain" value={weather ? weather.rainProb + '%' : '--%'} />
    </div>
    <div className="flex gap-4 flex-wrap mt-1.5 pt-1.5 border-t border-border/30">
      <span className="text-[11px] text-amber-600 font-medium">☀ Rise: {weather?.sunrise ?? '--'}</span>
      <span className="text-[11px] text-orange font-medium">☀ Set: {weather?.sunset ?? '--'}</span>
      <span className="text-[11px] text-muted-foreground">{weather?.daylight ?? '--'} daylight</span>
    </div>

    {/* Hourly */}
    <div className="mt-2 pt-2 border-t border-border/30">
      <div className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">Next 6 Hours</div>
      <div className="flex gap-1.5 overflow-x-auto snap-x snap-mandatory" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        {weather?.hourly.length ? weather.hourly.map((h, i) =>
      <div key={i} className={`flex-shrink-0 snap-start flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-2xl min-w-[46px] transition-colors ${
      h.isNow ?
      'bg-primary/[0.06] shadow-soft' :
      'bg-muted/50'}`
      }>
            <div className="mono text-[10px] text-muted-foreground">{h.time}</div>
            <div className="text-base leading-none">{h.icon}</div>
            <div className="mono text-[13px] font-semibold text-foreground">{h.temp}°</div>
            <div className="text-[10px] text-primary font-medium">{h.rainProb}%</div>
          </div>
      ) :
      <div className="text-[11px] text-muted-foreground py-2">Loading…</div>
      }
      </div>
    </div>
  </div>;


const DetailItem = ({ label, value }: {label: string;value: string;}) =>
<div className="flex items-center gap-1 text-[11px] text-muted-foreground">
    {label}: <strong className="text-foreground font-medium">{value}</strong>
  </div>;


export default WeatherWidget;