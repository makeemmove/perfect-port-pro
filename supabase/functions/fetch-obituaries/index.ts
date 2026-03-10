import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ObituaryEntry {
  full_name: string;
  age: number | null;
  date_of_passing: string | null;
  obituary_url: string;
  source: string;
  city: string;
}

const LEGACY_FEEDS = [
  "https://www.legacy.com/us/obituaries/heraldnews/rss",
  "https://www.legacy.com/obituaries/heraldnews/rss.aspx",
];

const FUNERAL_HOME_KEYWORDS = ["auclair", "oliveira", "manuel rogers"];
const FALL_RIVER_KEYWORDS = ["fall river"];
const EXCLUDED_CITIES = ["somerset", "swansea", "tiverton", "westport", "freetown", "dartmouth", "new bedford", "taunton", "rehoboth", "dighton", "berkley", "lakeville", "seekonk", "assonet"];

function isFallRiver(text: string): boolean {
  const lower = text.toLowerCase();
  // Must mention Fall River
  if (!FALL_RIVER_KEYWORDS.some(kw => lower.includes(kw))) {
    return false;
  }
  return true;
}

function isExcludedCity(text: string): boolean {
  const lower = text.toLowerCase();
  // If the primary city reference is a surrounding town, exclude
  for (const city of EXCLUDED_CITIES) {
    // Check if city appears as primary (e.g. "of Somerset" or "Somerset, MA")
    if (lower.includes(`of ${city}`) || lower.includes(`${city}, ma`) || lower.includes(`${city}, mass`)) {
      // But only exclude if Fall River is NOT also mentioned as primary
      if (!lower.includes("of fall river") && !lower.includes("fall river, ma") && !lower.includes("fall river, mass")) {
        return true;
      }
    }
  }
  return false;
}

function extractAge(text: string): number | null {
  // Common patterns: "age 85" "aged 72" ", 85," "85, of Fall River"
  const patterns = [
    /\bage[d]?\s+(\d{1,3})\b/i,
    /,\s*(\d{1,3})\s*,/,
    /^([^,]+),\s*(\d{1,3})/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const age = parseInt(m[m.length === 3 ? 2 : 1]);
      if (age > 0 && age < 130) return age;
    }
  }
  return null;
}

function extractDateOfPassing(text: string): string | null {
  // Patterns: "passed away on March 5, 2026" "died January 15, 2026"
  const patterns = [
    /(?:passed away|died|passing)\s+(?:on\s+)?(\w+ \d{1,2},?\s*\d{4})/i,
    /(\w+ \d{1,2},?\s*\d{4})/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const d = new Date(m[1]);
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    }
  }
  return null;
}

function cleanName(title: string): string {
  // Remove age, dates, and location from title to get just the name
  return title
    .replace(/,\s*\d{1,3}\s*,?/g, '')
    .replace(/\s*-\s*.*$/, '')
    .replace(/\s*\|.*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchLegacyRSS(): Promise<ObituaryEntry[]> {
  const entries: ObituaryEntry[] = [];
  
  for (const feedUrl of LEGACY_FEEDS) {
    try {
      const res = await fetch(feedUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ObituaryBot/1.0)' }
      });
      if (!res.ok) {
        console.log(`Feed ${feedUrl} returned ${res.status}`);
        continue;
      }
      const xml = await res.text();
      
      // Parse RSS items
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match;
      while ((match = itemRegex.exec(xml)) !== null) {
        const item = match[1];
        
        const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/);
        const linkMatch = item.match(/<link>(.*?)<\/link>/);
        const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/);
        
        const title = titleMatch ? (titleMatch[1] || titleMatch[2] || '') : '';
        const link = linkMatch ? linkMatch[1] : '';
        const desc = descMatch ? (descMatch[1] || descMatch[2] || '') : '';
        
        if (!title || !link) continue;
        
        const combined = `${title} ${desc}`;
        
        // CRITICAL: Only allow Fall River entries
        if (!isFallRiver(combined)) continue;
        if (isExcludedCity(combined)) continue;
        
        entries.push({
          full_name: cleanName(title),
          age: extractAge(combined),
          date_of_passing: extractDateOfPassing(combined),
          obituary_url: link.trim(),
          source: 'Legacy.com',
          city: 'Fall River',
        });
      }
    } catch (e) {
      console.error(`Error fetching ${feedUrl}:`, e);
    }
  }
  
  // Also try funeral home-specific feeds
  for (const home of FUNERAL_HOME_KEYWORDS) {
    try {
      const searchUrl = `https://www.legacy.com/us/obituaries/heraldnews/name/${home}/rss`;
      const res = await fetch(searchUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ObituaryBot/1.0)' }
      });
      if (!res.ok) continue;
      const xml = await res.text();
      
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match;
      while ((match = itemRegex.exec(xml)) !== null) {
        const item = match[1];
        const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/);
        const linkMatch = item.match(/<link>(.*?)<\/link>/);
        const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/);
        
        const title = titleMatch ? (titleMatch[1] || titleMatch[2] || '') : '';
        const link = linkMatch ? linkMatch[1] : '';
        const desc = descMatch ? (descMatch[1] || descMatch[2] || '') : '';
        
        if (!title || !link) continue;
        
        const combined = `${title} ${desc}`;
        if (!isFallRiver(combined)) continue;
        if (isExcludedCity(combined)) continue;
        
        // Avoid duplicates by URL
        if (!entries.some(e => e.obituary_url === link.trim())) {
          entries.push({
            full_name: cleanName(title),
            age: extractAge(combined),
            date_of_passing: extractDateOfPassing(combined),
            obituary_url: link.trim(),
            source: home.charAt(0).toUpperCase() + home.slice(1),
            city: 'Fall River',
          });
        }
      }
    } catch (e) {
      console.error(`Error fetching funeral home ${home}:`, e);
    }
  }
  
  return entries;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const entries = await fetchLegacyRSS();
    console.log(`Found ${entries.length} Fall River obituaries`);

    let upserted = 0;
    if (entries.length > 0) {
      const { error, count } = await supabase
        .from("local_obituaries")
        .upsert(
          entries.map((e) => ({
            full_name: e.full_name,
            age: e.age,
            date_of_passing: e.date_of_passing,
            obituary_url: e.obituary_url,
            source: e.source,
            city: e.city,
            updated_at: new Date().toISOString(),
          })),
          { onConflict: "obituary_url" }
        );

      if (error) {
        console.error("Upsert error:", error);
      } else {
        upserted = entries.length;
      }
    }

    // Return latest obituaries
    const { data: latest } = await supabase
      .from("local_obituaries")
      .select("*")
      .eq("city", "Fall River")
      .order("created_at", { ascending: false })
      .limit(20);

    return new Response(
      JSON.stringify({ obituaries: latest || [], fetched: entries.length, upserted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Obituary fetch error:", error);
    return new Response(
      JSON.stringify({ error: String(error), obituaries: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
