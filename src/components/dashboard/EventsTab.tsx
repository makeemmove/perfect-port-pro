import { useState } from 'react';
import { EVENTS, evTagMap, evClassMap } from '@/data/events';

const FILTERS = [
  { label: 'All', sub: 'All' },
  { label: '📚 Library', sub: 'Library' },
  { label: '⚓ Museum', sub: 'Museum/Attraction' },
  { label: '🏙 Community', sub: 'Community' },
  { label: '🎨 Arts', sub: 'Arts & Culture' },
  { label: '🌿 Parks', sub: 'Park/Nature' },
];

const tagStyles: Record<string, React.CSSProperties> = {
  purple: { background: 'rgba(168,85,247,0.15)', color: '#A855F7', border: '1px solid rgba(168,85,247,0.30)' },
  gold: { background: 'rgba(255,215,0,0.12)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.25)' },
  green: { background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)' },
  orange: { background: 'rgba(249,115,22,0.12)', color: '#f97316', border: '1px solid rgba(249,115,22,0.25)' },
};

const leftBarColors: Record<string, string> = {
  lib: '#A855F7',
  museum: '#FFD700',
  comm: '#34d399',
  park: '#22c55e',
  arts: '#f97316',
};

const EventsTab = () => {
  const [activeSub, setActiveSub] = useState('All');
  const filtered = activeSub === 'All' ? EVENTS : EVENTS.filter(e => e.sub === activeSub);

  return (
    <>
      <div className="flex items-center justify-between mb-[18px]">
        <div>
          <div className="text-2xl font-extrabold text-white">Events</div>
          <div className="text-xs text-muted-foreground">Library, Community &amp; City</div>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="hsl(var(--secondary))" strokeWidth={1.8} className="w-7 h-7">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
          <path d="M8 14h.01M12 14h.01M16 14h.01" />
        </svg>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
        {FILTERS.map(f => (
          <button key={f.sub} onClick={() => setActiveSub(f.sub)}
            className="flex-shrink-0 py-1.5 px-3.5 rounded-[20px] text-[11px] font-bold tracking-[0.08em] uppercase cursor-pointer transition-all duration-200 border bg-transparent"
            style={activeSub === f.sub
              ? { background: 'rgba(168,85,247,0.15)', borderColor: '#A855F7', color: '#A855F7' }
              : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.10)', color: 'hsl(var(--muted))' }
            }>
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="text-muted-foreground text-center py-8 text-[13px]">No events found</div>
        ) : filtered.map((e, i) => {
          const d = new Date(e.date);
          const mo = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
          const dy = d.getDate();
          const [cls, lbl] = evTagMap[e.sub] || ['purple', e.sub || 'Event'];
          const cc = evClassMap[e.sub] || 'lib';

          return (
            <div key={i} className="flex gap-3.5 p-[15px] rounded-[18px] relative overflow-hidden"
                 style={{ background: 'hsl(var(--glass))', border: '1px solid hsl(var(--glass-border))' }}>
              <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: leftBarColors[cc] || '#A855F7' }} />
              <div className="flex-shrink-0 w-[50px] text-center flex flex-col items-center justify-center rounded-xl py-2 px-1"
                   style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{mo}</div>
                <div className="mono text-2xl font-light text-white leading-none">{dy}</div>
                <div className="mono text-[9px] text-muted-foreground mt-0.5">{e.time}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold mb-[3px]">{e.name}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">
                  {e.desc.length > 90 ? e.desc.slice(0, 90) + '…' : e.desc}
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-[10px] font-bold tracking-[0.08em] uppercase py-[3px] px-2.5 rounded-[20px]"
                        style={tagStyles[cls] || tagStyles.purple}>
                    {lbl}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{e.cost}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default EventsTab;
