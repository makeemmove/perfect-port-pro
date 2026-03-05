import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const NEWS_SOURCES = [
  { name: "Fall River Reporter", url: "https://fallriverreporter.com/feed/", type: "rss" },
  { name: "Herald News", url: "https://www.heraldnews.com/arcio/rss/category/news/?query=Fall+River", type: "rss" },
];

interface RawArticle {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  description: string;
  imageUrl?: string;
}

// ── RSS parser ──────────────────────────────────────────────
async function fetchRSS(sourceUrl: string, sourceName: string): Promise<RawArticle[]> {
  try {
    const res = await fetch(sourceUrl, {
      headers: { "User-Agent": "Mozilla/5.0 FallRiverDashboard/1.0" },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const articles: RawArticle[] = [];
    const items = xml.split("<item>").slice(1);
    for (const item of items.slice(0, 5)) {
      const title =
        item.match(/<title><!\[CDATA\[(.*?)\]\]>/)?.[1] ||
        item.match(/<title>(.*?)<\/title>/)?.[1] ||
        "";
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] || "";
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
      const desc =
        item.match(/<description><!\[CDATA\[(.*?)\]\]>/s)?.[1] ||
        item.match(/<description>(.*?)<\/description>/s)?.[1] ||
        "";
      const imgMatch = item.match(
        /<media:content[^>]*url="([^"]+)"|<enclosure[^>]*url="([^"]+)"|<img[^>]*src="([^"]+)"/
      );
      const imageUrl = imgMatch?.[1] || imgMatch?.[2] || imgMatch?.[3] || undefined;
      if (title) {
        const cleanDesc = desc.replace(/<[^>]*>/g, "").trim().slice(0, 600);
        articles.push({
          title: title.trim(),
          source: sourceName,
          url: link.trim(),
          publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          description: cleanDesc,
          imageUrl,
        });
      }
    }
    return articles;
  } catch (e) {
    console.error(`Error fetching ${sourceName}:`, e);
    return [];
  }
}

// ── Google News search ──────────────────────────────────────
async function searchGoogleNews(): Promise<RawArticle[]> {
  try {
    const url =
      'https://news.google.com/rss/search?q=%22Fall+River%22+Massachusetts&hl=en-US&gl=US&ceid=US:en';
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 FallRiverDashboard/1.0" },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const articles: RawArticle[] = [];
    const items = xml.split("<item>").slice(1);
    for (const item of items.slice(0, 5)) {
      const title = item.match(/<title>(.*?)<\/title>/)?.[1] || "";
      const link =
        item.match(/<link\/>(.*?)<pubDate>/)?.[1]?.trim() ||
        item.match(/<link>(.*?)<\/link>/)?.[1] ||
        "";
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
      const source = item.match(/<source[^>]*>(.*?)<\/source>/)?.[1] || "News";
      if (title) {
        articles.push({
          title: title
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&#39;/g, "'")
            .replace(/&quot;/g, '"')
            .trim(),
          source: source.replace(/&amp;/g, "&").trim(),
          url: link,
          publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          description: "",
        });
      }
    }
    return articles;
  } catch (e) {
    console.error("Error fetching Google News:", e);
    return [];
  }
}

// ── AI summary with Gemini 3 Flash ─────────────────────────
const SYSTEM_PROMPT = `You are a professional news curator for a Fall River, Massachusetts news aggregator.

Your ONLY job is to write a short teaser summary for each article. Do NOT write a full article.

STRICT CONSTRAINTS:
- Length: Maximum 150 characters (including spaces). This is a HARD limit.
- Style: Factual, objective, punchy wire-service bulletin style.
- Format: Start with a strong verb. No fluff.
- Voice: Third-person, active voice only.
- Tone: Neutral and professional.
- ONLY include news that directly involves Fall River, MA. Ignore stories about other cities.

Output using the write_summary tool.`;

async function rewriteArticle(
  raw: RawArticle,
  apiKey: string
): Promise<{ title: string; summary: string } | null> {
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Write a short teaser summary for this news:\n\nHeadline: ${raw.title}\nSource: ${raw.source}\nDescription: ${raw.description || "No description available"}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "write_summary",
              description: "Save the news teaser summary",
              parameters: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    description: "Clean, concise headline",
                  },
                  summary: {
                    type: "string",
                    description: "Teaser summary: MAX 150 characters, start with strong verb, active voice",
                  },
                },
                required: ["title", "summary"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "write_summary" } },
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      return null;
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) return null;

    const result = JSON.parse(toolCall.function.arguments);
    // Enforce 150 char limit
    if (result.summary && result.summary.length > 150) {
      result.summary = result.summary.slice(0, 147) + "...";
    }
    return result;
  } catch (e) {
    console.error("AI rewrite error:", e);
    return null;
  }
}

// ── Main handler ────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Scrape RSS feeds in parallel
    const [reporterArticles, heraldArticles, googleArticles] = await Promise.all([
      fetchRSS(NEWS_SOURCES[0].url, NEWS_SOURCES[0].name),
      fetchRSS(NEWS_SOURCES[1].url, NEWS_SOURCES[1].name),
      searchGoogleNews(),
    ]);

    let allRaw = [...reporterArticles, ...heraldArticles, ...googleArticles];

    // Deduplicate by similar titles
    const seen = new Set<string>();
    allRaw = allRaw.filter((a) => {
      const key = a.title.toLowerCase().slice(0, 40);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // 2. Check which URLs already exist in DB
    const urls = allRaw.map((a) => a.url).filter(Boolean);
    const { data: existing } = await supabase
      .from("articles")
      .select("source_url")
      .in("source_url", urls);

    const existingUrls = new Set((existing || []).map((e: any) => e.source_url));
    const newArticles = allRaw.filter((a) => a.url && !existingUrls.has(a.url));

    console.log(`Found ${allRaw.length} scraped, ${existingUrls.size} exist, ${newArticles.length} new`);

    // 3. Generate summaries for new articles and insert into DB
    if (LOVABLE_API_KEY && newArticles.length > 0) {
      for (const raw of newArticles.slice(0, 5)) {
        const rewritten = await rewriteArticle(raw, LOVABLE_API_KEY);
        if (rewritten) {
          const { error: insertError } = await supabase.from("articles").insert({
            source_url: raw.url,
            source_name: raw.source,
            title: rewritten.title,
            content: rewritten.summary,
            summary: rewritten.summary,
            original_title: raw.title,
            image_url: raw.imageUrl || null,
            status: "published",
            published_at: raw.publishedAt,
          });
          if (insertError) {
            console.error("Insert error:", insertError.message);
          }
        } else {
          // Fallback: insert without AI
          const fallbackSummary = raw.description?.slice(0, 150) || raw.title;
          await supabase.from("articles").insert({
            source_url: raw.url,
            source_name: raw.source,
            title: raw.title,
            content: fallbackSummary,
            summary: fallbackSummary,
            original_title: raw.title,
            image_url: raw.imageUrl || null,
            status: "published",
            published_at: raw.publishedAt,
          });
        }
      }
    }

    // 4. Return latest 15 articles from DB
    const { data: articles, error: fetchError } = await supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(15);

    if (fetchError) throw fetchError;

    return new Response(
      JSON.stringify({ articles: articles || [], fetchedAt: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("fetch-news error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
        articles: [],
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
