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

const tagStyles: Record<string, string> = {
  purple: 'bg-secondary/10 text-secondary border border-secondary/20',
  gold: 'bg-amber-50 text-amber-600 border border-amber-200',
  green: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
  orange: 'bg-orange-50 text-orange-600 border border-orange-200',
};

const leftBarColors: Record<string, string> = {
  lib: '#8b5cf6',
  museum: '#d97706',
  comm: '#10b981',
  park: '#22c55e',
  arts: '#f97316',
};

const EventsTab = () => {
  const [activeSub, setActiveSub] = useState('All');
  const filtered = activeSub === 'All' ? EVENTS : EVENTS.filter(e => e.sub === activeSub);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Events</h1>
          <div className="text-xs text-muted-foreground">Library, Community &amp; City</div>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-6 h-6 text-secondary">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
          <path d="M8 14h.01M12 14h.01M16 14h.01" />
        </svg>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
        {FILTERS.map(f => (
          <button key={f.sub} onClick={() => setActiveSub(f.sub)}
            className={`flex-shrink-0 py-1.5 px-3.5 rounded-full text-[11px] font-semibold tracking-wide uppercase cursor-pointer transition-all duration-200 border ${
              activeSub === f.sub
                ? 'bg-foreground text-background border-foreground'
                : 'bg-card text-muted-foreground border-border hover:border-foreground/20'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2.5">
        {filtered.length === 0 ? (
          <div className="text-muted-foreground text-center py-8 text-sm">No events found</div>
        ) : filtered.map((e, i) => {
          const d = new Date(e.date);
          const mo = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
          const dy = d.getDate();
          const [cls, lbl] = evTagMap[e.sub] || ['purple', e.sub || 'Event'];
          const cc = evClassMap[e.sub] || 'lib';

          return (
            <div key={i} className="flex gap-3.5 p-4 rounded-xl relative overflow-hidden bg-card border border-border shadow-card hover:shadow-card-hover transition-shadow">
              <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl" style={{ background: leftBarColors[cc] || '#8b5cf6' }} />
              <div className="flex-shrink-0 w-[50px] text-center flex flex-col items-center justify-center rounded-lg py-2 px-1 bg-muted/60">
                <div className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">{mo}</div>
                <div className="mono text-2xl font-light text-foreground leading-none">{dy}</div>
                <div className="mono text-[9px] text-muted-foreground mt-0.5">{e.time}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold mb-1 text-foreground">{e.name}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">
                  {e.desc.length > 90 ? e.desc.slice(0, 90) + '…' : e.desc}
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`text-[10px] font-semibold tracking-wide uppercase py-[3px] px-2.5 rounded-full ${tagStyles[cls] || tagStyles.purple}`}>
                    {lbl}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{e.cost}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventsTab;
