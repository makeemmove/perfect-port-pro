import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const NEWS_SOURCES = [
  { name: "Fall River Reporter", url: "https://fallriverreporter.com/feed/", type: "rss" },
  { name: "Herald News", url: "https://www.heraldnews.com/arcio/rss/category/news/?query=Fall+River", type: "rss" },
  { name: "Fall River Police Department", url: "https://www.facebook.com/FallRiverPolice/", type: "facebook" },
];

interface NewsArticle {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  summary: string;
  imageUrl?: string;
}

async function fetchRSS(sourceUrl: string, sourceName: string): Promise<NewsArticle[]> {
  try {
    const res = await fetch(sourceUrl, {
      headers: { "User-Agent": "Mozilla/5.0 FallRiverDashboard/1.0" },
    });
    if (!res.ok) return [];
    const xml = await res.text();

    const articles: NewsArticle[] = [];
    // Simple XML parsing for RSS items
    const items = xml.split("<item>").slice(1);
    for (const item of items.slice(0, 5)) {
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/)?.[1] || item.match(/<title>(.*?)<\/title>/)?.[1] || "";
      const link = item.match(/<link>(.*?)<\/link>|<link><!\[CDATA\[(.*?)\]\]>/)?.[1] || "";
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
      const desc = item.match(/<description><!\[CDATA\[(.*?)\]\]>|<description>(.*?)<\/description>/s)?.[1] || "";
      const imgMatch = item.match(/<media:content[^>]*url="([^"]+)"|<enclosure[^>]*url="([^"]+)"|<img[^>]*src="([^"]+)"/);
      const imageUrl = imgMatch?.[1] || imgMatch?.[2] || imgMatch?.[3] || undefined;

      if (title) {
        // Strip HTML tags from description
        const cleanDesc = desc.replace(/<[^>]*>/g, "").trim().slice(0, 300);
        articles.push({
          title: title.trim(),
          source: sourceName,
          url: link.trim(),
          publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          summary: cleanDesc,
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

async function searchFallRiverNews(): Promise<NewsArticle[]> {
  // Use a Google News RSS feed for general Fall River news
  try {
    const url = "https://news.google.com/rss/search?q=Fall+River+Massachusetts&hl=en-US&gl=US&ceid=US:en";
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 FallRiverDashboard/1.0" },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const articles: NewsArticle[] = [];
    const items = xml.split("<item>").slice(1);
    for (const item of items.slice(0, 5)) {
      const title = item.match(/<title>(.*?)<\/title>/)?.[1] || "";
      const link = item.match(/<link\/>(.*?)<pubDate>|<link>(.*?)<\/link>/)?.[1]?.trim() || "";
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
      const source = item.match(/<source[^>]*>(.*?)<\/source>/)?.[1] || "News";

      if (title) {
        articles.push({
          title: title.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim(),
          source: source.replace(/&amp;/g, "&").trim(),
          url: link,
          publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          summary: "",
        });
      }
    }
    return articles;
  } catch (e) {
    console.error("Error fetching Google News:", e);
    return [];
  }
}

async function rewriteWithAI(articles: NewsArticle[]): Promise<NewsArticle[]> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY || articles.length === 0) return articles;

  try {
    const articlesForAI = articles.slice(0, 10).map((a, i) => `[${i}] "${a.title}" - ${a.summary || "No description available"}`).join("\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "You are a local news editor for Fall River, MA. Rewrite each article headline and summary in your own words. Keep it concise, factual, and engaging. Return a JSON array with objects containing 'index' (number), 'title' (rewritten headline), and 'summary' (1-2 sentence summary). Do NOT add any information not in the original.",
          },
          {
            role: "user",
            content: `Rewrite these news articles:\n${articlesForAI}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "rewrite_articles",
              description: "Return rewritten article headlines and summaries",
              parameters: {
                type: "object",
                properties: {
                  articles: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        index: { type: "number" },
                        title: { type: "string" },
                        summary: { type: "string" },
                      },
                      required: ["index", "title", "summary"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["articles"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "rewrite_articles" } },
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      return articles;
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) return articles;

    const rewritten = JSON.parse(toolCall.function.arguments);
    const rewrittenArticles = rewritten.articles || [];

    for (const rw of rewrittenArticles) {
      if (rw.index >= 0 && rw.index < articles.length) {
        articles[rw.index].title = rw.title;
        articles[rw.index].summary = rw.summary;
      }
    }

    return articles;
  } catch (e) {
    console.error("AI rewrite error:", e);
    return articles;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Fetch from all sources in parallel
    const [reporterArticles, heraldArticles, googleArticles] = await Promise.all([
      fetchRSS(NEWS_SOURCES[0].url, NEWS_SOURCES[0].name),
      fetchRSS(NEWS_SOURCES[1].url, NEWS_SOURCES[1].name),
      searchFallRiverNews(),
    ]);

    // Combine and sort by date
    let allArticles = [...reporterArticles, ...heraldArticles, ...googleArticles];
    allArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    // Deduplicate by similar titles
    const seen = new Set<string>();
    allArticles = allArticles.filter((a) => {
      const key = a.title.toLowerCase().slice(0, 40);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Limit to 15 articles
    allArticles = allArticles.slice(0, 15);

    // Rewrite with AI
    allArticles = await rewriteWithAI(allArticles);

    return new Response(JSON.stringify({ articles: allArticles, fetchedAt: new Date().toISOString() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fetch-news error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error", articles: [] }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
