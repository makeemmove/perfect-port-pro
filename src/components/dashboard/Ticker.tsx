const TICKER_ITEMS = [
  "Fall River Public Library — Spring 2026 programs now open",
  "SRTA Bus 101/102/103 — $1.50 cash · $1.25 CharlieCard",
  "MBTA Commuter Rail · Fall River/New Bedford Line · Zone 7 · $13.25 one-way",
  "Read Across America Night — March 24 · 6 PM · Free",
  "Voices Unheard Concert — March 26 · 8 PM · Free",
  "Battleship Cove Homeschool Day — March 20 · $10-$15",
  "AARP Free Tax Prep daily through April 15 · 9 AM–Noon at the Library",
  "Heritage State Park Spring Programs begin March 15 — Free",
];

const Ticker = () => {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="h-9 overflow-hidden flex items-center flex-shrink-0 relative"
         style={{
           background: 'linear-gradient(90deg, hsla(211,100%,50%,0.15), hsla(270,91%,62%,0.10))',
           borderBottom: '1px solid hsla(211,100%,50%,0.25)',
         }}>
      {/* Fade edges */}
      <div className="absolute top-0 bottom-0 left-0 w-[60px] z-[2] pointer-events-none"
           style={{ background: 'linear-gradient(to right, hsl(228,33%,6%), transparent)' }} />
      <div className="absolute top-0 bottom-0 right-0 w-[60px] z-[2] pointer-events-none"
           style={{ background: 'linear-gradient(to left, hsl(228,33%,6%), transparent)' }} />

      <div className="flex-shrink-0 px-3.5 text-[10px] font-bold tracking-[0.12em] uppercase whitespace-nowrap z-[3] text-primary"
           style={{ borderRight: '1px solid hsla(211,100%,50%,0.25)' }}>
        ⬤ Live
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex whitespace-nowrap text-xs text-muted-foreground px-4"
             style={{ animation: 'ticker 50s linear infinite' }}>
          {doubled.map((item, i) => (
            <span key={i} className="mr-14 text-foreground before:content-['▸_'] before:text-primary">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Ticker;
