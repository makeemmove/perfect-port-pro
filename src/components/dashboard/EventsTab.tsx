import { useState } from 'react';
import { EVENTS, evTagMap, evClassMap } from '@/data/events';
import type { CityEvent } from '@/data/events';
import QuickViewModal from './QuickViewModal';

const FILTERS = [
  { label: 'All', sub: 'All' },
  { label: '🎵 Music', sub: 'Music' },
  { label: '🎨 Arts', sub: 'Arts' },
  { label: '👶 Kids', sub: 'Kids' },
  { label: '🎉 Festival', sub: 'Festival' },
  { label: '🎄 Holiday', sub: 'Holiday' },
  { label: '👨‍👩‍👧 Family', sub: 'Family' },
  { label: '🏘 Community', sub: 'Community' },
  { label: '🎭 Theater', sub: 'Theater' },
  { label: '📚 Education', sub: 'Education' },
  { label: '🍔 Food', sub: 'Food' },
  { label: '⚽ Sports', sub: 'Sports' },
  { label: '🏛 Civic', sub: 'Civic' },
];

const tagStyles: Record<string, string> = {
  purple: 'bg-secondary/10 text-secondary',
  blue: 'bg-blue-50 text-blue-600',
  gold: 'bg-amber-50 text-amber-600',
  green: 'bg-emerald-50 text-emerald-600',
  orange: 'bg-orange-50 text-orange-600',
  red: 'bg-red-50 text-red-600',
};

const leftBarColors: Record<string, string> = {
  arts: '#8b5cf6',
  music: '#3b82f6',
  kids: '#10b981',
  family: '#f97316',
  festival: '#d97706',
  holiday: '#dc2626',
};

// Group events by month
function groupByMonth(events: CityEvent[]): { month: string; events: CityEvent[] }[] {
  const groups: Record<string, CityEvent[]> = {};
  for (const e of events) {
    const d = new Date(e.date);
    const key = isNaN(d.getTime()) ? 'Other' : d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  }
  return Object.entries(groups).map(([month, events]) => ({ month, events }));
}

const EventsTab = () => {
  const [activeSub, setActiveSub] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState<CityEvent | null>(null);
  const filtered = activeSub === 'All'
    ? EVENTS
    : EVENTS.filter(e => e.sub === activeSub || (activeSub === 'Kids' && e.sub === 'Kids/Education'));

  const grouped = groupByMonth(filtered);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Events</h1>
          <div className="text-xs text-muted-foreground">Fall River 2026</div>
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
            className={`flex-shrink-0 py-1.5 px-3.5 rounded-full text-[11px] font-semibold tracking-wide uppercase cursor-pointer transition-all duration-150 active:scale-[0.98] ${
              activeSub === f.sub
                ? 'bg-foreground text-background shadow-soft'
                : 'bg-card text-muted-foreground shadow-card hover:shadow-card-hover'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {grouped.length === 0 ? (
        <div className="text-muted-foreground text-center py-8 text-sm">No events found</div>
      ) : grouped.map(group => (
        <div key={group.month}>
          <div className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-2 mt-3 flex items-center gap-2
                          before:flex-1 before:h-px before:bg-border
                          after:flex-1 after:h-px after:bg-border">
            {group.month}
          </div>
          <div className="flex flex-col gap-2.5">
            {group.events.map((e, i) => {
              const d = new Date(e.date);
              const mo = isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
              const dy = isNaN(d.getTime()) ? '' : d.getDate();
              const [cls, lbl] = evTagMap[e.sub] || ['purple', e.sub || 'Event'];
              const cc = evClassMap[e.sub] || 'arts';

              return (
                <div key={`${group.month}-${i}`} className="flex gap-3.5 p-5 rounded-[24px] relative overflow-hidden bg-card shadow-card hover:shadow-card-hover active:scale-[0.98] hover:scale-[1.01] transition-all duration-150">
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[24px]" style={{ background: leftBarColors[cc] || '#8b5cf6' }} />
                  <div className="flex-shrink-0 w-[50px] text-center flex flex-col items-center justify-center rounded-lg py-2 px-1 bg-muted/60">
                    <div className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">{mo}</div>
                    <div className="mono text-2xl font-light text-foreground leading-none">{dy}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold mb-1 text-foreground">{e.name}</div>
                    {e.location && (
                      <div className="text-xs text-muted-foreground leading-relaxed">
                        📍 {e.location}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`text-[10px] font-semibold tracking-wide uppercase py-[3px] px-2.5 rounded-full ${tagStyles[cls] || tagStyles.purple}`}>
                        {lbl}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{e.cost}</span>
                      <button
                        onClick={(ev) => { ev.stopPropagation(); setSelectedEvent(e); }}
                        className="ml-auto text-[10px] font-semibold tracking-wide uppercase py-[3px] px-2.5 rounded-full bg-muted text-primary hover:bg-muted/80 active:scale-[0.98] transition-all duration-150"
                      >
                        More Info
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <QuickViewModal
        open={!!selectedEvent}
        onOpenChange={(open) => { if (!open) setSelectedEvent(null); }}
        title={selectedEvent?.name || ''}
        description={selectedEvent?.desc}
        location={selectedEvent?.location}
        cost={selectedEvent?.cost}
        url={selectedEvent?.url}
        category={selectedEvent?.sub}
      />
    </div>
  );
};

export default EventsTab;
