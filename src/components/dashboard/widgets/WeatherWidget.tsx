import type { WeatherData } from '@/data/weather';

const WeatherWidget = ({ weather }: { weather: WeatherData | null }) => (
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
);

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
    {label}: <strong className="text-foreground font-medium">{value}</strong>
  </div>
);

export default WeatherWidget;
