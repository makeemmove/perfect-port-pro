import { Skeleton } from '@/components/ui/skeleton';
import type { WeatherData } from '@/data/weather';

const WeatherWidget = ({ weather }: { weather: WeatherData | null }) => {
  if (!weather) {
    return (
      <div className="glass-card p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-3 flex-1">
            <Skeleton className="h-3 w-28 rounded-full" />
            <Skeleton className="h-10 w-20 rounded-lg" />
            <Skeleton className="h-4 w-36 rounded-full" />
          </div>
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
        <div className="flex gap-4 mt-4 pt-4 border-t border-border/30">
          <Skeleton className="h-3 w-16 rounded-full" />
          <Skeleton className="h-3 w-20 rounded-full" />
          <Skeleton className="h-3 w-14 rounded-full" />
        </div>
      </div>
    );
  }

  const severityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'extreme': return 'bg-destructive/15 border-destructive/30 text-destructive';
      case 'severe': return 'bg-destructive/10 border-destructive/20 text-destructive';
      case 'moderate': return 'bg-accent/15 border-accent/30 text-accent';
      default: return 'bg-primary/10 border-primary/20 text-primary';
    }
  };

  return (
    <div className="glass-card p-6">
      {/* Alerts */}
      {weather.alerts && weather.alerts.length > 0 && (
        <div className="mb-4 space-y-2">
          {weather.alerts.map((alert, i) => (
            <div key={i} className={`text-[11px] px-3 py-2 rounded-xl border ${severityColor(alert.severity)}`}>
              <div className="font-semibold">⚠ {alert.event}</div>
              {alert.headline && <div className="mt-0.5 opacity-80">{alert.headline}</div>}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-start">
        <div>
          <div className="text-[10px] font-semibold tracking-widest uppercase text-primary">📍 Fall River, MA</div>
          <div className="mono text-4xl font-light leading-none text-foreground mt-2">
            {weather.temp}<sup className="text-base align-super font-normal">°F</sup>
          </div>
          <div className="text-sm text-muted-foreground mt-1.5">{weather.label}</div>
        </div>
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center text-[36px] leading-none">
          {weather.icon}
        </div>
      </div>

      <div className="flex gap-4 flex-wrap mt-4 pt-4 border-t border-border/30">
        <DetailItem label="Precip" value={weather.precip + '"'} />
        <DetailItem label="Wind" value={weather.wind + ' mph'} />
        <DetailItem label="Rain" value={weather.rainProb + '%'} />
      </div>
      <div className="flex gap-4 flex-wrap mt-2 pt-2 border-t border-border/30">
        <span className="text-[11px] text-accent font-medium">☀ Rise: {weather.sunrise}</span>
        <span className="text-[11px] text-accent font-medium">☀ Set: {weather.sunset}</span>
        <span className="text-[11px] text-muted-foreground">{weather.daylight} daylight</span>
      </div>

      {/* 5-Day Forecast */}
      {weather.daily && weather.daily.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border/30">
          <div className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-2">5-Day Forecast</div>
          <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {weather.daily.map((d, i) => (
              <div key={i} className={`flex-shrink-0 flex flex-col items-center gap-0.5 py-2 px-3 rounded-2xl min-w-[56px] ${
                i === 0 ? 'bg-primary/[0.06] shadow-soft' : 'bg-muted/50'
              }`}>
                <div className="mono text-[10px] text-muted-foreground font-medium">{d.day}</div>
                <div className="text-base leading-none">{d.icon}</div>
                <div className="mono text-[13px] font-semibold text-foreground">{d.high}°</div>
                <div className="mono text-[10px] text-muted-foreground">{d.low}°</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
    {label}: <strong className="text-foreground font-medium">{value}</strong>
  </div>
);

export default WeatherWidget;
