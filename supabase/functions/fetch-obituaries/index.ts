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
  birth_date?: string | null;
  article_bio?: string | null;
  picture_url?: string | null;
}

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
  return text.toLowerCase().includes("fall river");
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
    .replace(/\s*-\s*(Fall River|Legacy|Dignity Memorial|Herald News|East Bay RI|heraldnews).*$/i, "")
    .replace(/\s*\|.*$/, "")
    .replace(/\(\d{4}\)/g, "")
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
    if (!res.ok) return [];
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
      if (!isObituary(title, desc)) continue;
      if (!isFallRiver(combined)) continue;
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

function extractMetaContent(html: string, key: string): string | null {
  const re = new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i');
  const m = html.match(re);
  return m?.[1]?.trim() || null;
}

function extractNameFromLD(ld: any): string | null {
  const tryObj = (o: any): string | null => {
    if (!o || typeof o !== 'object') return null;
    if (typeof o.name === 'string' && o.name.trim().length > 2) return o.name.trim();
    return null;
  };
  if (Array.isArray(ld)) {
    for (const it of ld) {
      const n = extractNameFromLD(it);
      if (n) return n;
    }
  }
  const direct = tryObj(ld);
  if (direct) return direct;
  const graph = (ld as any)['@graph'];
  if (Array.isArray(graph)) {
    for (const it of graph) {
      const n = tryObj(it);
      if (n) return n;
    }
  }
  return null;
}

function extractDatesFromLD(ld: any): { birth: string | null; death: string | null } {
  const out = { birth: null as string | null, death: null as string | null };
  const scan = (o: any) => {
    if (!o || typeof o !== 'object') return;
    const b = o.birthDate;
    const d = o.deathDate;
    if (!out.birth && typeof b === 'string') out.birth = b;
    if (!out.death && typeof d === 'string') out.death = d;
    const graph = o['@graph'];
    if (Array.isArray(graph)) {
      for (const it of graph) scan(it);
    }
  };
  if (Array.isArray(ld)) {
    for (const it of ld) scan(it);
  } else {
    scan(ld);
  }
  return out;
}

function extractJsonLd(html: string): any[] {
  const blocks: any[] = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const raw = (m[1] || '').trim();
    if (!raw) continue;
    try {
      blocks.push(JSON.parse(raw));
    } catch {
      // Some sites embed invalid JSON-LD; ignore.
    }
  }
  return blocks;
}

function toIsoDateMaybe(s: string | null): string | null {
  if (!s) return null;
  // Prefer YYYY-MM-DD
  const m = s.match(/\d{4}-\d{2}-\d{2}/);
  if (m) return m[0];
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  return null;
}

function cleanSnippet(text: string): string {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function enrichFromPage(entry: ObituaryEntry): Promise<ObituaryEntry> {
  try {
    const pageRes = await fetch(entry.obituary_url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; FRConnect/1.0)" },
      redirect: "follow",
    });
    if (!pageRes.ok) return entry;

    const html = await pageRes.text();

    // Best-effort bio from OG description / meta description
    const ogDesc = extractMetaContent(html, 'og:description');
    const metaDesc = (() => {
      const m = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i);
      return m?.[1]?.trim() || null;
    })();
    const snippet = cleanSnippet(ogDesc || metaDesc || '');
    if (snippet && snippet.length > 20) {
      entry.article_bio = snippet.slice(0, 600);
    }

    // Photo: og:image is standard on Legacy.com and many funeral home pages
    const ogImage = extractMetaContent(html, 'og:image');
    if (ogImage && ogImage.startsWith('http')) {
      entry.picture_url = ogImage;
    }

    // Birth/death dates from JSON-LD if present
    const lds = extractJsonLd(html);
    for (const ld of lds) {
      const dates = extractDatesFromLD(ld);
      const birthIso = toIsoDateMaybe(dates.birth);
      const deathIso = toIsoDateMaybe(dates.death);
      if (!entry.birth_date && birthIso) entry.birth_date = birthIso;
      if (!entry.date_of_passing && deathIso) entry.date_of_passing = deathIso;
      if (entry.birth_date && entry.date_of_passing) break;
    }
  } catch (e) {
    console.error(`Enrichment failed for ${entry.full_name}:`, e);
  }
  return entry;
}

// Use AI to extract age and date from obituary page content
async function enrichWithAI(entries: ObituaryEntry[]): Promise<ObituaryEntry[]> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    console.log("No LOVABLE_API_KEY, skipping AI enrichment");
    return entries;
  }

  // Only enrich entries missing age or date, max 5 per run
  const needsEnrichment = entries.filter(e => e.age === null || e.date_of_passing === null).slice(0, 5);
  if (needsEnrichment.length === 0) return entries;

  console.log(`Enriching ${needsEnrichment.length} obituaries with AI`);

  for (const entry of needsEnrichment) {
    try {
      // Fetch the obituary page
      const pageRes = await fetch(entry.obituary_url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; FRConnect/1.0)" },
        redirect: "follow",
      });
      if (!pageRes.ok) continue;

      const html = await pageRes.text();
      // Strip HTML tags, get first 3000 chars of text
      const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 3000);

      if (text.length < 50) continue;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            {
              role: "system",
              content: "Extract the age and date of passing from this obituary text. Return ONLY a JSON object with 'age' (number or null) and 'date_of_passing' (YYYY-MM-DD string or null). No other text.",
            },
            { role: "user", content: text },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "extract_obituary_details",
                description: "Extract age and date of passing from obituary text",
                parameters: {
                  type: "object",
                  properties: {
                    age: { type: ["number", "null"], description: "Age of the deceased" },
                    date_of_passing: { type: ["string", "null"], description: "Date of passing in YYYY-MM-DD format" },
                  },
                  required: ["age", "date_of_passing"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "extract_obituary_details" } },
        }),
      });

      if (!response.ok) {
        console.log(`AI enrichment failed for ${entry.full_name}: ${response.status}`);
        continue;
      }

      const aiData = await response.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        const parsed = JSON.parse(toolCall.function.arguments);
        if (entry.age === null && parsed.age && typeof parsed.age === "number" && parsed.age > 0 && parsed.age < 130) {
          entry.age = parsed.age;
        }
        if (entry.date_of_passing === null && parsed.date_of_passing && typeof parsed.date_of_passing === "string") {
          const d = new Date(parsed.date_of_passing);
          if (!isNaN(d.getTime())) {
            entry.date_of_passing = parsed.date_of_passing;
          }
        }
        console.log(`Enriched ${entry.full_name}: age=${entry.age}, date=${entry.date_of_passing}`);
      }
    } catch (e) {
      console.error(`AI enrichment error for ${entry.full_name}:`, e);
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

    const allSources = [...SOURCES, ...FUNERAL_HOME_SOURCES];
    const results = await Promise.all(
      allSources.map((s) => fetchRSS(s.url, s.name))
    );

    const seen = new Set<string>();
    let entries: ObituaryEntry[] = [];
    for (const batch of results) {
      for (const e of batch) {
        if (!seen.has(e.obituary_url)) {
          seen.add(e.obituary_url);
          entries.push(e);
        }
      }
    }

    console.log(`Found ${entries.length} Fall River obituaries`);

    // Current week (Sunday–Saturday) in local time for "this week" filter
    const now = new Date();
    const day = now.getDay();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - day);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const weekStartIso = weekStart.toISOString().slice(0, 10);
    const weekEndIso = weekEnd.toISOString().slice(0, 10);

    // Only keep entries with date_of_passing in the current week
    const entriesThisWeek = entries.filter((e) => {
      if (!e.date_of_passing) return false;
      return e.date_of_passing >= weekStartIso && e.date_of_passing <= weekEndIso;
    });
    console.log(`Keeping ${entriesThisWeek.length} obituaries for this week (${weekStartIso}–${weekEndIso})`);

    // Best-effort enrichment for newest entries (keep small to avoid timeouts)
    const newest = entriesThisWeek.slice(0, 10);
    const enrichedNewest = await Promise.all(newest.map(enrichFromPage));
    const enrichedEntries = [...enrichedNewest, ...entriesThisWeek.slice(10)];

    // Enrich with AI for missing age/date
    const toUpsert = await enrichWithAI(enrichedEntries);

    if (toUpsert.length > 0) {
      const { error } = await supabase
        .from("local_obituaries")
        .upsert(
          toUpsert.map((e) => ({
            full_name: e.full_name,
            age: e.age,
            date_of_passing: e.date_of_passing,
            birth_date: e.birth_date ?? null,
            article_bio: e.article_bio ?? null,
            picture_url: e.picture_url ?? null,
            obituary_url: e.obituary_url,
            source: e.source,
            city: e.city,
            updated_at: new Date().toISOString(),
          })),
          { onConflict: "obituary_url" }
        );
      if (error) console.error("Upsert error:", error);
    }

    // Remove everyone except obituaries for this week: delete all not in [weekStartIso, weekEndIso]
    const { error: deleteBefore } = await supabase
      .from("local_obituaries")
      .delete()
      .eq("city", "Fall River")
      .lt("date_of_passing", weekStartIso);
    if (deleteBefore) console.error("Delete before week error:", deleteBefore);

    const { error: deleteAfter } = await supabase
      .from("local_obituaries")
      .delete()
      .eq("city", "Fall River")
      .gt("date_of_passing", weekEndIso);
    if (deleteAfter) console.error("Delete after week error:", deleteAfter);

    const { error: deleteNoDate } = await supabase
      .from("local_obituaries")
      .delete()
      .eq("city", "Fall River")
      .is("date_of_passing", null);
    if (deleteNoDate) console.error("Delete no-date error:", deleteNoDate);

    const { data: latest } = await supabase
      .from("local_obituaries")
      .select("*")
      .eq("city", "Fall River")
      .order("date_of_passing", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(100);

    return new Response(
      JSON.stringify({ obituaries: latest || [], fetched: entriesThisWeek.length }),
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
