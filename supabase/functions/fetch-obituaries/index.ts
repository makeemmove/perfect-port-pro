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

// Multiple source URLs to try
const SOURCES = [
  {
    url: "https://news.google.com/rss/search?q=%22Fall+River%22+obituary&hl=en-US&gl=US&ceid=US:en",
    name: "Google News",
  },
  {
    url: "https://news.google.com/rss/search?q=%22Fall+River+MA%22+obituary+site:legacy.com&hl=en-US&gl=US&ceid=US:en",
    name: "Legacy via Google",
  },
  {
    url: "https://news.google.com/rss/search?q=%22Fall+River%22+%22passed+away%22+OR+%22obituary%22+site:heraldnews.com&hl=en-US&gl=US&ceid=US:en",
    name: "Herald News",
  },
];

const FUNERAL_HOME_SOURCES = [
  {
    url: "https://news.google.com/rss/search?q=%22Auclair+Funeral+Home%22+%22Fall+River%22&hl=en-US&gl=US&ceid=US:en",
    name: "Auclair Funeral Home",
  },
  {
    url: "https://news.google.com/rss/search?q=%22Manuel+Rogers%22+%22Fall+River%22+obituary&hl=en-US&gl=US&ceid=US:en",
    name: "Manuel Rogers",
  },
  {
    url: "https://news.google.com/rss/search?q=%22Oliveira+Funeral+Home%22+%22Fall+River%22&hl=en-US&gl=US&ceid=US:en",
    name: "Oliveira Funeral Home",
  },
];

const EXCLUDED_CITIES = [
  "somerset", "swansea", "tiverton", "westport", "freetown",
  "dartmouth", "new bedford", "taunton", "rehoboth", "dighton",
  "berkley", "lakeville", "seekonk", "assonet",
];

function isFallRiver(text: string): boolean {
  const lower = text.toLowerCase();
  return lower.includes("fall river");
}

function isExcludedCity(text: string): boolean {
  const lower = text.toLowerCase();
  for (const city of EXCLUDED_CITIES) {
    if (
      (lower.includes(`of ${city}`) || lower.includes(`${city}, ma`) || lower.includes(`${city}, mass`)) &&
      !lower.includes("of fall river") && !lower.includes("fall river, ma")
    ) {
      return true;
    }
  }
  return false;
}

function extractAge(text: string): number | null {
  const patterns = [/\bage[d]?\s+(\d{1,3})\b/i, /,\s*(\d{1,3})\s*,/];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const age = parseInt(m[1]);
      if (age > 0 && age < 130) return age;
    }
  }
  return null;
}

function extractDate(text: string): string | null {
  const m = text.match(/(\w+ \d{1,2},?\s*\d{4})/i);
  if (m) {
    const d = new Date(m[1]);
    if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
  }
  return null;
}

function cleanName(title: string): string {
  return title
    .replace(/<[^>]+>/g, "")
    .replace(/\s*obituary\s*/gi, "")
    .replace(/\s*-\s*legacy\.com.*/i, "")
    .replace(/\s*\|.*$/, "")
    .replace(/\s*-\s*Herald News.*$/i, "")
    .replace(/,\s*\d{1,3}\s*,?/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isObituary(title: string, desc: string): boolean {
  const combined = (title + " " + desc).toLowerCase();
  const keywords = ["obituary", "obit", "passed away", "died", "memorial", "funeral", "in memoriam", "rest in peace", "survived by"];
  return keywords.some((kw) => combined.includes(kw));
}

async function fetchRSS(url: string, sourceName: string): Promise<ObituaryEntry[]> {
  const entries: ObituaryEntry[] = [];
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; FRConnect/1.0)" },
    });
    if (!res.ok) {
      console.log(`${sourceName} returned ${res.status}`);
      return [];
    }
    const xml = await res.text();

    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const item = match[1];
      const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/);
      const linkMatch = item.match(/<link>(.*?)<\/link>/);
      const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/);

      const title = titleMatch ? (titleMatch[1] || titleMatch[2] || "") : "";
      const link = linkMatch ? linkMatch[1].trim() : "";
      const desc = descMatch ? (descMatch[1] || descMatch[2] || "") : "";

      if (!title || !link) continue;

      const combined = `${title} ${desc}`;

      // Must be an obituary
      if (!isObituary(title, desc)) continue;

      // CRITICAL: Must mention Fall River
      if (!isFallRiver(combined)) continue;

      // Exclude surrounding towns
      if (isExcludedCity(combined)) continue;

      const name = cleanName(title);
      if (name.length < 3 || name.length > 80) continue;

      entries.push({
        full_name: name,
        age: extractAge(combined),
        date_of_passing: extractDate(combined),
        obituary_url: link,
        source: sourceName,
        city: "Fall River",
      });
    }
  } catch (e) {
    console.error(`Error fetching ${sourceName}:`, e);
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

    // Fetch from all sources in parallel
    const allSources = [...SOURCES, ...FUNERAL_HOME_SOURCES];
    const results = await Promise.all(
      allSources.map((s) => fetchRSS(s.url, s.name))
    );

    // Deduplicate by URL
    const seen = new Set<string>();
    const entries: ObituaryEntry[] = [];
    for (const batch of results) {
      for (const e of batch) {
        if (!seen.has(e.obituary_url)) {
          seen.add(e.obituary_url);
          entries.push(e);
        }
      }
    }

    console.log(`Found ${entries.length} Fall River obituaries`);

    if (entries.length > 0) {
      const { error } = await supabase
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
      if (error) console.error("Upsert error:", error);
    }

    // Return latest
    const { data: latest } = await supabase
      .from("local_obituaries")
      .select("*")
      .eq("city", "Fall River")
      .order("created_at", { ascending: false })
      .limit(20);

    return new Response(
      JSON.stringify({ obituaries: latest || [], fetched: entries.length }),
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
