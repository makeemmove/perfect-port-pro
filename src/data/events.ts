import csvRaw from './events_2026.csv?raw';

export interface CityEvent {
  name: string;
  date: string;
  time: string;
  sub: string;
  cost: string;
  desc: string;
  location?: string;
  url?: string;
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else current += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ',') { fields.push(current.trim()); current = ''; }
      else current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

/** Normalize event Type into display categories */
function normalizeEventType(raw: string): string {
  const t = raw.trim().toLowerCase();
  if (t.includes('concert') || t.includes('music')) return 'Music';
  if (t.includes('art') && !t.includes('theater')) return 'Arts';
  if (t.includes('kids') || t.includes('scouts') || t.includes('steam') || t.includes('reading')) return 'Kids';
  if (t.includes('education') || t.includes('hobbies')) return 'Education';
  if (t.includes('theater') || t.includes('comedy') || t.includes('musical')) return 'Theater';
  if (t.includes('holiday') || t.includes('easter') || t.includes('parade')) return 'Holiday';
  if (t.includes('festival') || t.includes('cultural')) return 'Festival';
  if (t.includes('community') || t.includes('family')) return 'Community';
  if (t.includes('market')) return 'Community';
  if (t.includes('teens')) return 'Kids';
  if (t.includes('all ages')) return 'Community';
  return 'Arts';
}

function parseEvents(): CityEvent[] {
  const lines = csvRaw.split('\n').filter(l => l.trim());
  const seen = new Set<string>();
  const events: CityEvent[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    // Columns: Event_Name, Type, Date, Location, Direct_Info_Link
    const name = cols[0] || '';
    const date = cols[2] || '';
    const key = `${name.toLowerCase()}|${date}`;
    if (seen.has(key)) continue;
    seen.add(key);

    events.push({
      name,
      date,
      time: '',
      sub: normalizeEventType(cols[1] || ''),
      cost: '',
      desc: '',
      location: cols[3] || undefined,
      url: cols[4] || undefined,
    });
  }

  const today = new Date(new Date().toDateString());
  return events
    .filter(e => e.date && new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export const EVENTS: CityEvent[] = parseEvents();

export const evTagMap: Record<string, [string, string]> = {
  'Arts': ['purple', '🎨 Arts'],
  'Music': ['blue', '🎵 Music'],
  'Kids': ['green', '👶 Kids'],
  'Education': ['teal', '📚 Education'],
  'Theater': ['pink', '🎭 Theater'],
  'Holiday': ['red', '🎄 Holiday'],
  'Festival': ['gold', '🎉 Festival'],
  'Community': ['orange', '🏘 Community'],
  'Family': ['orange', '👨‍👩‍👧 Family'],
};

export const evClassMap: Record<string, string> = {
  'Arts': 'arts',
  'Music': 'music',
  'Kids': 'kids',
  'Education': 'kids',
  'Theater': 'arts',
  'Holiday': 'holiday',
  'Festival': 'festival',
  'Community': 'family',
  'Family': 'family',
};
