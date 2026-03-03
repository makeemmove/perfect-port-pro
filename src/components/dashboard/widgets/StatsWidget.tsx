interface StatsWidgetProps {
  eventsThisWeek: number;
  restaurantCount: number;
  onNavigate?: (tab: 'eats' | 'events') => void;
}

const StatsWidget = ({ eventsThisWeek, restaurantCount, onNavigate }: StatsWidgetProps) => (
  <div className="grid grid-cols-2 gap-3">
    <div
      className="p-5 rounded-[24px] bg-card shadow-card cursor-pointer active:scale-[0.98] transition-transform duration-150"
      onClick={() => onNavigate?.('events')}
    >
      <div className="mb-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-5 h-5 text-primary p-0.5 rounded-md bg-primary/10">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
          <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
        </svg>
      </div>
      <div className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">Events This Week</div>
      <div className="mono text-2xl font-light text-foreground">{eventsThisWeek}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">Library &amp; Community</div>
    </div>
    <div
      className="p-5 rounded-[24px] bg-card shadow-card cursor-pointer active:scale-[0.98] transition-transform duration-150"
      onClick={() => onNavigate?.('eats')}
    >
      <div className="mb-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-5 h-5 text-primary p-0.5 rounded-md bg-primary/10">
          <circle cx="12" cy="13" r="7" />
          <path d="M7 7V4M7 4L6 2M7 4L8 2" />
          <path d="M17 7V3M17 3L16.5 2M17 3L17.5 2M17 3V2" />
        </svg>
      </div>
      <div className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">Local Eats</div>
      <div className="mono text-2xl font-light text-foreground">{restaurantCount}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">Restaurants &amp; Cafés</div>
    </div>
  </div>
);

export default StatsWidget;
