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

    // Enrich with AI for missing age/date
    entries = await enrichWithAI(entries);

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
