import csvRaw from './fall_river_dashboard_master.csv?raw';

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
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        fields.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseEvents(): CityEvent[] {
  const lines = csvRaw.split('\n').filter(l => l.trim());
  // Skip header row
  const events: CityEvent[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    // cols: Category, Subcategory, Name, Date/Time/Schedule, Time/Hours, Location, Frequency, Cost/Price, Description, Source URL
    if (cols[0] !== 'Event') continue;
    events.push({
      name: cols[2] || '',
      date: cols[3] || '',
      time: cols[4] || '',
      sub: cols[1] || '',
      cost: cols[7] || 'Free',
      desc: cols[8] || '',
      location: cols[5] || undefined,
      url: cols[9] || undefined,
    });
  }
  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export const EVENTS: CityEvent[] = parseEvents();

export const evTagMap: Record<string, [string, string]> = {
  'Library': ['purple', '📚 Library'],
  'Museum/Attraction': ['gold', '⚓ Museum'],
  'Community': ['green', '🏙 Community'],
  'Arts & Culture': ['orange', '🎨 Arts'],
  'Park/Nature': ['green', '🌿 Nature'],
};

export const evClassMap: Record<string, string> = {
  'Library': 'lib',
  'Museum/Attraction': 'museum',
  'Community': 'comm',
  'Park/Nature': 'park',
  'Arts & Culture': 'arts',
};
