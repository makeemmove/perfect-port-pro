interface StatsWidgetProps {
  eventsThisWeek: number;
  restaurantCount: number;
  onNavigate?: (tab: 'eats' | 'events') => void;
}

const StatsWidget = ({ eventsThisWeek, restaurantCount, onNavigate }: StatsWidgetProps) => (
  <div className="grid grid-cols-2 gap-3">
    <div
      className="p-4 rounded-2xl bg-card border border-border shadow-card cursor-pointer hover:shadow-card-hover transition-shadow active:scale-[0.98]"
      onClick={() => onNavigate?.('events')}
    >
      <div className="mb-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-5 h-5 text-secondary">
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
      className="p-4 rounded-2xl bg-card border border-border shadow-card cursor-pointer hover:shadow-card-hover transition-shadow active:scale-[0.98]"
      onClick={() => onNavigate?.('eats')}
    >
      <div className="mb-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-5 h-5 text-gold">
          <path d="M3 2l1.5 14.5M7.5 2v6.5a3 3 0 0 0 6 0V2M21 2c0 7-3 10-3 10v9" />
        </svg>
      </div>
      <div className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">Local Eats</div>
      <div className="mono text-2xl font-light text-foreground">{restaurantCount}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">Restaurants &amp; Cafés</div>
    </div>
  </div>
);

export default StatsWidget;
