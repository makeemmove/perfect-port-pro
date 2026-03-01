import { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import { RESTAURANTS, COORDS, Restaurant } from '@/data/restaurants';

const CATEGORIES = [
  { label: 'All', cat: 'All' },
  { label: '🇵🇹 Portuguese', cat: 'Portuguese' },
  { label: '☕ Bakery', cat: 'Bakery/Coffee' },
  { label: '🍝 Italian', cat: 'Italian' },
  { label: '🦞 Seafood', cat: 'Seafood' },
  { label: '🍔 Casual', cat: 'Casual Dining' },
  { label: '✨ Specialty', cat: 'Specialty' },
  { label: '🥢 Asian', cat: 'Asian' },
];

function catCol(s: string) {
  if (s.includes('Bakery') || s.includes('Coffee')) return '#FFD700';
  if (s === 'Portuguese' || s === 'Seafood' || s === 'Italian') return '#f87171';
  return '#007AFF';
}

function catIco(s: string) {
  if (s.includes('Bakery') || s.includes('Coffee')) return 'gold';
  if (s === 'Portuguese' || s === 'Seafood') return 'crimson';
  return 'def';
}

function catCC(s: string) {
  if (s.includes('Bakery') || s.includes('Coffee')) return 'c-bakery';
  if (s === 'Portuguese' || s === 'Seafood') return 'c-steak';
  return 'c-default';
}

const SVG_BAKERY = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <circle cx="12" cy="8" r="5" /><path d="M3 11h18M7 11v10M17 11v10M5 21h14" />
  </svg>
);
const SVG_STEAK = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <path d="M17 9c0-3.87-5-7-5-7S7 5.13 7 9a5 5 0 0 0 10 0z" /><path d="M7 21h10M12 14v7" />
  </svg>
);
const SVG_UTENSILS = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <path d="M3 2l1.5 14.5M7.5 2v6.5a3 3 0 0 0 6 0V2M21 2c0 7-3 10-3 10v9" />
  </svg>
);

function getIcon(sub: string) {
  if (sub.includes('Bakery') || sub.includes('Coffee')) return SVG_BAKERY;
  if (sub === 'Portuguese' || sub === 'Seafood') return SVG_STEAK;
  return SVG_UTENSILS;
}

const EatsTab = () => {
  const [activeCat, setActiveCat] = useState('All');
  const [selected, setSelected] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  const filtered = activeCat === 'All' ? RESTAURANTS : RESTAURANTS.filter(r => r.sub === activeCat);

  const addMarkers = useCallback((list: Restaurant[]) => {
    const map = leafMapRef.current;
    if (!map) return;
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};
    list.forEach(r => {
      const c = COORDS[r.name] || [41.7015, -71.1551];
      const col = catCol(r.sub);
      const ic = L.divIcon({
        className: '',
        html: `<div style="width:12px;height:12px;border-radius:50%;background:${col};border:2px solid rgba(255,255,255,.5);box-shadow:0 0 8px ${col}88"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });
      markersRef.current[r.name] = L.marker(c as [number, number], { icon: ic })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:'Syne',sans-serif;min-width:180px">
            <div style="font-weight:800;font-size:14px;margin-bottom:4px">${r.name}</div>
            <div style="font-size:11px;color:#7a7f9a;margin-bottom:6px">${r.sub} · ${r.price}</div>
            <div style="font-size:12px;line-height:1.4">${r.desc}</div>
            <div style="font-size:11px;margin-top:8px;color:#007AFF">${r.hours}</div>
          </div>`
        );
    });
  }, []);

  useEffect(() => {
    if (!mapRef.current || leafMapRef.current) return;
    const map = L.map(mapRef.current, { zoomControl: false }).setView([41.7015, -71.1551], 14);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '©OpenStreetMap ©CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);
    L.control.zoom({ position: 'topright' }).addTo(map);
    leafMapRef.current = map;
    addMarkers(RESTAURANTS);
  }, [addMarkers]);

  useEffect(() => {
    addMarkers(filtered);
  }, [activeCat, filtered, addMarkers]);

  const flyTo = (name: string) => {
    setSelected(name);
    const c = COORDS[name] || [41.7015, -71.1551];
    const map = leafMapRef.current;
    if (map) {
      map.flyTo(c as [number, number], 17, { duration: 1.2 });
      setTimeout(() => markersRef.current[name]?.openPopup(), 1300);
    }
  };

  const borderColors: Record<string, string> = {
    'c-bakery': '#FFD700',
    'c-steak': '#B22222',
    'c-default': 'hsl(var(--muted))',
  };

  const icoStyles: Record<string, React.CSSProperties> = {
    gold: { background: 'rgba(255,215,0,0.12)', color: '#FFD700' },
    crimson: { background: 'rgba(178,34,34,0.12)', color: '#f87171' },
    def: { background: 'rgba(255,255,255,0.06)', color: 'hsl(var(--muted))' },
  };

  return (
    <>
      <div ref={mapRef} className="flex-[0_0_40%] min-h-0 relative w-full" />
      <div className="flex-[0_0_60%] overflow-y-auto" style={{ padding: '14px 16px 76px' }}>
        <div className="flex gap-2 mb-3 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map(c => {
            const isActive = activeCat === c.cat;
            let activeStyle: React.CSSProperties = {};
            if (isActive) {
              if (c.cat === 'Bakery/Coffee') activeStyle = { borderColor: '#FFD700', background: 'rgba(255,215,0,0.12)', color: '#FFD700' };
              else if (['Portuguese', 'Seafood', 'Italian'].includes(c.cat)) activeStyle = { borderColor: '#B22222', background: 'rgba(178,34,34,0.12)', color: '#f87171' };
              else activeStyle = { color: '#fff', borderColor: 'rgba(255,255,255,0.30)', background: 'rgba(255,255,255,0.10)' };
            }
            return (
              <button key={c.cat} onClick={() => setActiveCat(c.cat)}
                className="flex-shrink-0 py-1.5 px-3.5 rounded-[20px] text-[11px] font-bold tracking-[0.08em] uppercase cursor-pointer transition-all duration-200 whitespace-nowrap border bg-transparent"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderColor: 'rgba(255,255,255,0.10)',
                  color: 'hsl(var(--muted))',
                  ...activeStyle,
                }}>
                {c.label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2.5">
          {filtered.map(r => {
            const cc = catCC(r.sub);
            return (
              <div key={r.name}
                onClick={() => flyTo(r.name)}
                className={`flex items-center gap-3.5 py-[13px] px-[15px] rounded-[18px] cursor-pointer transition-all duration-200 relative overflow-hidden ${
                  selected === r.name ? 'bg-[rgba(255,255,255,0.09)]' : ''
                }`}
                style={{
                  background: selected === r.name ? 'rgba(255,255,255,0.09)' : 'hsl(var(--glass))',
                  border: selected === r.name ? '1px solid rgba(255,255,255,0.22)' : '1px solid hsl(var(--glass-border))',
                }}>
                <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: borderColors[cc] || 'hsl(var(--muted))' }} />
                <div className="w-[42px] h-[42px] rounded-xl flex-shrink-0 flex items-center justify-center" style={icoStyles[catIco(r.sub)]}>
                  {getIcon(r.sub)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold whitespace-nowrap overflow-hidden text-ellipsis">{r.name}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{r.sub} · {r.hours}</div>
                </div>
                <div className="mono text-xs text-muted-foreground flex-shrink-0">{r.price}</div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default EatsTab;
