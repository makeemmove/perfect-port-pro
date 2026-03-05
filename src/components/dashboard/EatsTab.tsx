import { useState } from 'react';
import { RESTAURANTS } from '@/data/restaurants';
import type { Restaurant } from '@/data/restaurants';
import QuickViewModal from './QuickViewModal';

const CATEGORIES = [
  { label: 'All', cat: 'All' },
  { label: '🇵🇹 Portuguese', cat: 'Portuguese' },
  { label: '☕ Bakery', cat: 'Bakery/Coffee' },
  { label: '🍝 Italian', cat: 'Italian' },
  { label: '🦞 Seafood', cat: 'Seafood' },
  { label: '🍕 Pizza', cat: 'Pizza' },
  { label: '🌭 Hot Dogs', cat: 'Hot Dogs' },
  { label: '🍔 Casual', cat: 'Casual Dining' },
  { label: '🥢 Asian', cat: 'Asian' },
  { label: '🥩 Steakhouse', cat: 'Steakhouse' },
  { label: '🍳 Breakfast', cat: 'Breakfast' },
  { label: '🍗 Chicken', cat: 'Chicken/Wings' },
  { label: '🍦 Desserts', cat: 'Ice Cream/Desserts' },
  { label: '🥤 Juice', cat: 'Juice/Healthy' },
  { label: '✨ Specialty', cat: 'Specialty' },
  { label: '🛒 Market', cat: 'Market/Specialty' },
];

const tagStyles: Record<string, string> = {
  Portuguese: 'bg-red-50 text-red-600',
  'Bakery/Coffee': 'bg-amber-50 text-amber-600',
  Italian: 'bg-emerald-50 text-emerald-600',
  Seafood: 'bg-cyan-50 text-cyan-600',
  Pizza: 'bg-yellow-50 text-yellow-600',
  'Hot Dogs': 'bg-rose-50 text-rose-600',
  Asian: 'bg-violet-50 text-violet-600',
  'Casual Dining': 'bg-orange-50 text-orange-600',
  Specialty: 'bg-pink-50 text-pink-600',
  'Market/Specialty': 'bg-lime-50 text-lime-600',
  Steakhouse: 'bg-stone-100 text-stone-700',
  Breakfast: 'bg-sky-50 text-sky-600',
  'Chicken/Wings': 'bg-red-50 text-red-500',
  'Ice Cream/Desserts': 'bg-fuchsia-50 text-fuchsia-600',
  'Juice/Healthy': 'bg-green-50 text-green-600',
};

const leftBarColors: Record<string, string> = {
  Portuguese: '#dc2626',
  'Bakery/Coffee': '#d97706',
  Italian: '#059669',
  Seafood: '#0891b2',
  Pizza: '#ca8a04',
  'Hot Dogs': '#e11d48',
  Asian: '#7c3aed',
  'Casual Dining': '#ea580c',
  Specialty: '#db2777',
  'Market/Specialty': '#65a30d',
  Steakhouse: '#78716c',
  Breakfast: '#0284c7',
  'Chicken/Wings': '#ef4444',
  'Ice Cream/Desserts': '#c026d3',
  'Juice/Healthy': '#16a34a',
};

const EatsTab = () => {
  const [activeCat, setActiveCat] = useState('All');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const filtered = activeCat === 'All' ? RESTAURANTS : RESTAURANTS.filter(r => r.sub === activeCat);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Eats</h1>
          <div className="text-xs text-muted-foreground">Restaurants &amp; Cafés</div>
        </div>
        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-accent">
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <path d="M13 7v4c0 .8-.7 1.5-1.5 1.5S10 11.8 10 11V7" />
            <path d="M11.5 7v4" />
            <path d="M11.5 12.5v4.5" />
          </svg>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map(c => (
          <button key={c.cat} onClick={() => setActiveCat(c.cat)}
            className={`flex-shrink-0 py-2 px-4 rounded-full text-[11px] font-semibold tracking-wide uppercase cursor-pointer transition-all duration-300 ease-in-out active:scale-[0.98] ${
              activeCat === c.cat
                ? 'bg-foreground text-background shadow-glass'
                : 'bg-card text-muted-foreground shadow-pill hover:shadow-glass'
            }`}>
            {c.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="text-muted-foreground text-center py-8 text-sm">No restaurants found</div>
        ) : filtered.map((r, i) => (
          <div key={i} className="flex gap-4 glass-card p-6 relative overflow-hidden active:scale-[0.98] transition-all duration-300 ease-in-out">
            <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[20px]" style={{ background: leftBarColors[r.sub] || '#3b82f6' }} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold mb-1.5 text-foreground">{r.name}</div>
              {r.loc && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.loc + (r.loc.includes(',') ? '' : ', Fall River, MA'))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(ev) => ev.stopPropagation()}
                  className="text-xs text-muted-foreground leading-relaxed mb-1 inline-block hover:text-primary hover:underline transition-colors"
                >
                  📍 {r.loc}
                </a>
              )}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className={`text-[10px] font-semibold tracking-wide uppercase py-1 px-2.5 rounded-full ${tagStyles[r.sub] || 'bg-muted text-muted-foreground'}`}>
                  {r.sub}
                </span>
                {r.url && (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(ev) => ev.stopPropagation()}
                    className="text-[10px] font-semibold tracking-wide uppercase py-1 px-3 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-300"
                  >
                    🌐 Website
                  </a>
                )}
                <button
                  onClick={(ev) => { ev.stopPropagation(); setSelectedRestaurant(r); }}
                  className="ml-auto text-[10px] font-semibold tracking-wide uppercase py-1 px-3 rounded-full bg-muted text-primary hover:bg-muted/80 active:scale-[0.98] transition-all duration-300 ease-in-out"
                >
                  More Info
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <QuickViewModal
        open={!!selectedRestaurant}
        onOpenChange={(open) => { if (!open) setSelectedRestaurant(null); }}
        title={selectedRestaurant?.name || ''}
        description={selectedRestaurant?.loc}
        location={selectedRestaurant?.loc}
        category={selectedRestaurant?.sub}
        url={selectedRestaurant?.url}
      />
    </div>
  );
};

export default EatsTab;
