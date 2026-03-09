import { useState } from 'react';
import { EVENTS, evTagMap, evClassMap } from '@/data/events';
import type { CityEvent } from '@/data/events';
import QuickViewModal from './QuickViewModal';
import { ChevronRight } from 'lucide-react';

const FILTERS = [
  { label: 'All', sub: 'All' },
  { label: '🎵 Music', sub: 'Music' },
  { label: '🎨 Arts', sub: 'Arts' },
  { label: '👶 Kids', sub: 'Kids' },
  { label: '🎭 Theater', sub: 'Theater' },
  { label: '📚 Education', sub: 'Education' },
  { label: '🎉 Festival', sub: 'Festival' },
  { label: '🎄 Holiday', sub: 'Holiday' },
  { label: '🏘 Community', sub: 'Community' },
];

const dateBadgeColors: Record<string, { bg: string; text: string }> = {
  arts:      { bg: 'bg-pink-200',    text: 'text-pink-800' },
  music:     { bg: 'bg-indigo-200',  text: 'text-indigo-800' },
  kids:      { bg: 'bg-emerald-200', text: 'text-emerald-800' },
  family:    { bg: 'bg-orange-200',  text: 'text-orange-800' },
  festival:  { bg: 'bg-amber-200',   text: 'text-amber-800' },
  holiday:   { bg: 'bg-red-200',     text: 'text-red-800' },
  community: { bg: 'bg-orange-200',  text: 'text-orange-800' },
  education: { bg: 'bg-teal-200',    text: 'text-teal-800' },
  theater:   { bg: 'bg-purple-200',  text: 'text-purple-800' },
};

const tagStyles: Record<string, string> = {
  purple: 'bg-purple-50 text-purple-600 border border-purple-200/60',
  blue: 'bg-blue-50 text-blue-600 border border-blue-200/60',
  gold: 'bg-amber-50 text-amber-600 border border-amber-200/60',
  green: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
  orange: 'bg-orange-50 text-orange-600 border border-orange-200/60',
  red: 'bg-red-50 text-red-600 border border-red-200/60',
  teal: 'bg-teal-50 text-teal-600 border border-teal-200/60',
  pink: 'bg-pink-50 text-pink-600 border border-pink-200/60',
};

function groupByMonth(events: CityEvent[]): { month: string; events: CityEvent[] }[] {
  const groups: Record<string, CityEvent[]> = {};
  for (const e of events) {
    const d = new Date(e.date);
    const key = isNaN(d.getTime()) ? 'Other' : d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  }
  return Object.entries(groups).map(([month, evts]) => ({
    month,
    events: evts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
  }));
}

const EventsTab = () => {
  const [activeSub, setActiveSub] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState<CityEvent | null>(null);
  const filtered = activeSub === 'All'
    ? EVENTS
    : EVENTS.filter(e => e.sub === activeSub);

  const grouped = groupByMonth(filtered);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Events</h1>
          <div className="text-xs text-muted-foreground mt-0.5">Fall River 2026 · {filtered.length} upcoming</div>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 text-primary">
            <rect x="3" y="4" width="18" height="18" rx="3" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
        {FILTERS.map(f => (
          <button key={f.sub} onClick={() => setActiveSub(f.sub)}
            className={`flex-shrink-0 py-2 px-4 rounded-2xl text-[11px] font-semibold tracking-wide cursor-pointer transition-all duration-300 ease-in-out active:scale-[0.97] ${
              activeSub === f.sub
                ? 'bg-foreground text-background shadow-lg'
                : 'bg-card text-muted-foreground border border-border/50 hover:border-border hover:shadow-sm'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Events list */}
      {grouped.length === 0 ? (
        <div className="text-muted-foreground text-center py-12 text-sm">No upcoming events found</div>
      ) : grouped.map(group => (
        <div key={group.month}>
          {/* Month header */}
          <div className="sticky top-0 z-10 py-2 mb-2 mt-3">
            <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground/70">
              {group.month}
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {group.events.map((e, i) => {
              const d = new Date(e.date);
              const mo = isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
              const dy = isNaN(d.getTime()) ? '' : String(d.getDate());
              const [cls, lbl] = evTagMap[e.sub] || ['purple', e.sub || 'Event'];
              const cc = evClassMap[e.sub] || 'arts';
              const badge = dateBadgeColors[cc] || dateBadgeColors.arts;

              return (
                <button
                  key={`${group.month}-${i}`}
                  onClick={() => setSelectedEvent(e)}
                  className="flex items-center gap-3.5 bg-card rounded-2xl p-4 border border-border/40 
                             hover:shadow-soft hover:border-border/80 hover:-translate-y-[1px]
                             active:scale-[0.98] transition-all duration-300 ease-in-out text-left w-full group"
                >
                  {/* Date badge */}
                  <div className={`flex-shrink-0 w-[52px] h-[56px] rounded-xl flex flex-col items-center justify-center ${badge.bg}`}>
                    <div className={`text-[9px] font-bold uppercase tracking-widest ${badge.text} opacity-70`}>{mo}</div>
                    <div className={`text-xl font-semibold leading-none ${badge.text}`}>{dy}</div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-foreground leading-snug truncate">{e.name}</div>
                    {e.location && (
                      <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        📍 {e.location}
                      </div>
                    )}
                    <div className="mt-2">
                      <span className={`text-[9px] font-semibold tracking-wider uppercase py-0.5 px-2 rounded-full ${tagStyles[cls] || tagStyles.purple}`}>
                        {lbl}
                      </span>
                    </div>
                  </div>

                  {/* Chevron */}
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0 group-hover:text-muted-foreground transition-colors" />
                </button>
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
