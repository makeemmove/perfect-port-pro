type TickerItem = { text: string; category: 'breaking' | 'event' | 'community' | 'education' };

const TICKER_ITEMS: TickerItem[] = [
  { text: "Fall River Public Library — Spring 2026 programs now open", category: "education" },
  { text: "David Nail Live — March 6 · Narrows Center · $51", category: "event" },
  { text: "Day of Portugal Festival — June 5-7 · Waterfront Park · Free", category: "event" },
  { text: "Battleship Cove Homeschool Day — March 20 · $15", category: "education" },
  { text: "AARP Free Tax Prep daily through April 15 · 9 AM–Noon at the Library", category: "community" },
  { text: "Great Feast of the Holy Ghost — August 20-25 · Kennedy Park · Free", category: "event" },
  { text: "Easter Scavenger Hunt — April 4 · Battleship Cove · $15", category: "event" },
];

const categoryColors: Record<TickerItem['category'], string> = {
  breaking: 'text-destructive',
  event: 'text-secondary',
  community: 'text-blue-500',
  education: 'text-emerald-500',
};

const Ticker = () => {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="h-9 overflow-hidden flex items-center flex-shrink-0 relative bg-card border-b border-border">
      <div className="absolute top-0 bottom-0 left-0 w-12 z-[2] pointer-events-none bg-gradient-to-r from-background to-transparent" />
      <div className="absolute top-0 bottom-0 right-0 w-12 z-[2] pointer-events-none bg-gradient-to-l from-background to-transparent" />

      <div className="flex-shrink-0 px-3 text-[10px] font-semibold tracking-widest uppercase whitespace-nowrap z-[3] text-primary">
        ● Live
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex whitespace-nowrap text-[11px] text-muted-foreground px-4"
             style={{ animation: 'ticker 50s linear infinite' }}>
          {doubled.map((item, i) => (
            <span key={i} className="mr-12 text-foreground/70">
              <span className={`${categoryColors[item.category]} mr-1.5`}>▸</span>{item.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Ticker;
