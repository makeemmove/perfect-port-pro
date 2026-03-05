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

/** Normalize CSV "Category" into display-friendly categories */
function normalizeType(raw: string): string {
  const t = raw.trim().toLowerCase();
  if (t.includes('steakhouse')) return 'Steakhouse';
  if (t.includes('breakfast') || t.includes('brunch')) return 'Breakfast';
  if (t.includes('ice cream')) return 'Ice Cream/Desserts';
  if (t.includes('cookie') || t.includes('cake') || t.includes('dessert')) return 'Ice Cream/Desserts';
  if (t.includes('portuguese') && !t.includes('bakery')) return 'Portuguese';
  if (t.includes('bakery') || t.includes('cafe') || t.includes('coffee') || t.includes('bagel')) return 'Bakery/Coffee';
  if (t.includes('italian')) return 'Italian';
  if (t.includes('seafood') && !t.includes('american')) return 'Seafood';
  if (t.includes('pizza')) return 'Pizza';
  if (t.includes('hot dog')) return 'Hot Dogs';
  if (t.includes('chicken') || t.includes('wings')) return 'Chicken/Wings';
  if (t.includes('juice')) return 'Juice/Healthy';
  if (t.includes('diner') || t.includes('american') || t.includes('pub') || t.includes('gastropub') || t.includes('brewery') || t.includes('grill') || t.includes('sports bar') || t.includes('nautical') || t.includes('bar') || t.includes('lounge')) return 'Casual Dining';
  if (t.includes('asian') || t.includes('chinese') || t.includes('cambodian') || t.includes('pho') || t.includes('thai') || t.includes('noodle')) return 'Asian';
  if (t.includes('mexican') || t.includes('mediterranean') || t.includes('middle eastern') || t.includes('greek') || t.includes('eclectic') || t.includes('polish') || t.includes('bbq') || t.includes('irish') || t.includes('brazilian')) return 'Specialty';
  if (t.includes('deli') || t.includes('market') || t.includes('specialty food')) return 'Market/Specialty';
  if (t.includes('seafood')) return 'Seafood';
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
    // Columns: Name, Address, Category, Website
    const name = cols[0] || '';
    const nameKey = name.toLowerCase().replace(/['']/g, "'").replace(/\s+/g, ' ').trim();
    if (seen.has(nameKey)) continue;
    seen.add(nameKey);

    const url = (cols[3] || '').trim();

    restaurants.push({
      name,
      sub: normalizeType(cols[2] || ''),
      hours: '',
      loc: cols[1] || 'Fall River, MA',
      price: '',
      desc: '',
      url: url || undefined,
    });
  }

  return restaurants.sort((a, b) => a.name.localeCompare(b.name));
}

export const RESTAURANTS: Restaurant[] = parseRestaurants();
