interface StatsWidgetProps {
  eventsThisWeek: number;
  restaurantCount: number;
  onNavigate?: (tab: 'eats' | 'events') => void;
}

const StatsWidget = ({ eventsThisWeek, restaurantCount, onNavigate }: StatsWidgetProps) => (
  <div className="grid grid-cols-2 gap-4">
    <div
      className="glass-card p-6 cursor-pointer active:scale-[0.98] transition-all duration-300 ease-in-out"
      onClick={() => onNavigate?.('events')}
    >
      <div className="mb-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-primary">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
            <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
          </svg>
        </div>
      </div>
      <div className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">Events This Week</div>
      <div className="text-3xl font-extrabold text-foreground leading-none">{eventsThisWeek}</div>
      <div className="text-[11px] text-muted-foreground mt-1.5">Library &amp; Community</div>
    </div>
    <div
      className="glass-card p-6 cursor-pointer active:scale-[0.98] transition-all duration-300 ease-in-out"
      onClick={() => onNavigate?.('eats')}
    >
      <div className="mb-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-primary">
            <path d="M11 2v6.5c0 1.38-1.12 2.5-2.5 2.5S6 9.88 6 8.5V2" />
            <path d="M8.5 2v6.5" />
            <path d="M8.5 11v11" />
          </svg>
        </div>
      </div>
      <div className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">Local Eats</div>
      <div className="text-3xl font-extrabold text-foreground leading-none">{restaurantCount}</div>
      <div className="text-[11px] text-muted-foreground mt-1.5">Restaurants &amp; Cafés</div>
    </div>
  </div>
);

export default StatsWidget;
