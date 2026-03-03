import csvRaw from './Fall_River_Events_2026_Final.csv?raw';

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
  const events: CityEvent[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    // Columns: Event Name, Date, Location, Category, Price, Direct Information Link
    events.push({
      name: cols[0] || '',
      date: cols[1] || '',
      time: '',
      sub: cols[3] || '',
      cost: cols[4] || 'Free',
      desc: '',
      location: cols[2] || undefined,
      url: cols[5] || undefined,
    });
  }
  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export const EVENTS: CityEvent[] = parseEvents();

export const evTagMap: Record<string, [string, string]> = {
  'Arts': ['purple', '🎨 Arts'],
  'Music': ['blue', '🎵 Music'],
  'Kids': ['green', '👶 Kids'],
  'Kids/Education': ['green', '📚 Education'],
  'Family': ['orange', '👨‍👩‍👧 Family'],
  'Festival': ['gold', '🎉 Festival'],
  'Holiday': ['red', '🎄 Holiday'],
};

export const evClassMap: Record<string, string> = {
  'Arts': 'arts',
  'Music': 'music',
  'Kids': 'kids',
  'Kids/Education': 'kids',
  'Family': 'family',
  'Festival': 'festival',
  'Holiday': 'holiday',
};
