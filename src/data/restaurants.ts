import csvRaw from './eats.csv?raw';

export interface Restaurant {
  name: string;
  sub: string;
  hours: string;
  loc: string;
  price: string;
  desc: string;
  url?: string;
  neighborhood?: string;
}

/** Normalize CSV "Type" into display-friendly categories */
function normalizeType(raw: string): string {
  const t = raw.trim().toLowerCase();
  if (t.includes('portuguese') && !t.includes('bakery')) return 'Portuguese';
  if (t.includes('bakery') || t.includes('cafe') || t === 'cafe/healthy') return 'Bakery/Coffee';
  if (t.includes('italian') || t === 'contemporary') return 'Italian';
  if (t.includes('seafood')) return 'Seafood';
  if (t.includes('pizza')) return 'Pizza';
  if (t.includes('hot dog')) return 'Hot Dogs';
  if (t.includes('diner') || t.includes('american') || t.includes('pub') || t.includes('gastropub') || t.includes('brewery') || t.includes('grill')) return 'Casual Dining';
  if (t.includes('asian') || t.includes('chinese') || t.includes('cambodian') || t.includes('pho')) return 'Asian';
  if (t.includes('mexican') || t.includes('mediterranean') || t.includes('middle eastern') || t.includes('greek') || t.includes('eclectic') || t.includes('polish') || t.includes('bbq')) return 'Specialty';
  if (t.includes('deli') || t.includes('market') || t.includes('specialty food')) return 'Market/Specialty';
  return 'Casual Dining';
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

function parseRestaurants(): Restaurant[] {
  const lines = csvRaw.split('\n').filter(l => l.trim());
  const seen = new Set<string>();
  const restaurants: Restaurant[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    // Columns: Name, Type, Address, Neighborhood
    const name = cols[0] || '';
    const nameKey = name.toLowerCase().replace(/['']/g, "'").replace(/\s+/g, ' ').trim();
    if (seen.has(nameKey)) continue;
    seen.add(nameKey);

    restaurants.push({
      name,
      sub: normalizeType(cols[1] || ''),
      hours: '',
      loc: cols[2] || 'Fall River, MA',
      price: '',
      desc: '',
      neighborhood: cols[3] || undefined,
    });
  }

  return restaurants.sort((a, b) => a.name.localeCompare(b.name));
}

export const RESTAURANTS: Restaurant[] = parseRestaurants();
