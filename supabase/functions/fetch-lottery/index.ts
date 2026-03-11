import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const browserHeaders: HeadersInit = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0 Safari/537.36",
  Accept:
    "text/html, application/xhtml+xml, application/xml;q=0.9, */*;q=0.8",
};

interface LotteryResult {
  game_name: string;
  draw_date: string;
  numbers: string;
  special_number: number[] | null;
  multiplier: string | null;
  jackpot: string | null;
  official_url: string;
}

/** Parse date strings like "March 10th 2026" or "February 28th 2026" to YYYY-MM-DD */
function parseDateText(text: string): string {
  const cleaned = text.replace(/(\d+)(st|nd|rd|th)/g, "$1").trim();
  const d = new Date(cleaned);
  if (isNaN(d.getTime())) return new Date().toISOString().split("T")[0];
  return d.toISOString().split("T")[0];
}

/** Extract date from Prize Payout URL like /numbers/03-10-2026/21-00 or /numbers/03-10-2026 */
function parseDateFromUrl(url: string): string | null {
  const m = url.match(/(\d{2})-(\d{2})-(\d{4})/);
  if (!m) return null;
  return `${m[3]}-${m[1]}-${m[2]}`;
}

/** Extract time label from dateSmall span, e.g. "Tue 9:00pm" or "Tuesday" */
function parseTimeLabel(html: string): string | null {
  const m = html.match(/<span>([^<]*(?:am|pm)[^<]*)<\/span>/i);
  return m ? m[1].trim() : null;
}

/**
 * Generic scraper for lottery.net results pages.
 * Parses the consistent HTML structure used across all game pages.
 */
function parseLotteryNetHtml(
  html: string,
  gameName: string,
  officialUrl: string,
  options?: {
    splitByTime?: boolean; // true for Mass Cash / Numbers Game (midday/evening)
    middayName?: string;
    eveningName?: string;
    lastBallIsSpecial?: boolean; // true for Powerball/Mega Millions/Millionaire for Life
    maxResults?: number;
  }
): LotteryResult[] {
  const results: LotteryResult[] = [];
  const maxResults = options?.maxResults ?? 7;

  // Split into draw blocks - each starts with <div class="wider
  const blocks = html.split(/<div class="wider\b/);

  for (let i = 1; i < blocks.length && results.length < maxResults; i++) {
    const block = blocks[i];

    // Extract date from dateSmall div
    const dateSmallMatch = block.match(/<div class="dateSmall">([\s\S]*?)<\/div>/);
    if (!dateSmallMatch) continue;
    const dateSmallHtml = dateSmallMatch[1];

    // Try to get date from Prize Payout URL first (most reliable)
    const payoutUrlMatch = block.match(/href="[^"]*\/numbers\/(\d{2}-\d{2}-\d{4})/);
    let drawDate: string;
    if (payoutUrlMatch) {
      const parts = payoutUrlMatch[1].split("-");
      drawDate = `${parts[2]}-${parts[0]}-${parts[1]}`;
    } else {
      // Fallback: parse date text
      const dateTextMatch = dateSmallHtml.match(
        /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d+(?:st|nd|rd|th)?\s+\d{4}/i
      );
      drawDate = dateTextMatch
        ? parseDateText(dateTextMatch[0])
        : new Date().toISOString().split("T")[0];
    }

    // Extract ball numbers
    const ballMatches = [...block.matchAll(/<li class="ball[^"]*">(\d+)<\/li>/g)];
    if (ballMatches.length === 0) continue;

    let nums = ballMatches.map((m) => parseInt(m[1], 10));
    let specialNumber: number[] | null = null;

    if (options?.lastBallIsSpecial && nums.length > 1) {
      specialNumber = [nums[nums.length - 1]];
      nums = nums.slice(0, -1);
    }

    const numbersText = nums.join(" ");

    // Determine game name variant for midday/evening split
    let resolvedGameName = gameName;
    if (options?.splitByTime) {
      const timeLabel = parseTimeLabel(dateSmallHtml);
      if (timeLabel) {
        const lower = timeLabel.toLowerCase();
        if (lower.includes("pm") && !lower.includes("2:00")) {
          resolvedGameName = options.eveningName || `${gameName} Evening`;
        } else if (lower.includes("am") || lower.includes("2:00")) {
          resolvedGameName = options.middayName || `${gameName} Midday`;
        } else {
          // Check hour
          const hourMatch = lower.match(/(\d+):/);
          if (hourMatch && parseInt(hourMatch[1]) >= 7) {
            resolvedGameName = options.eveningName || `${gameName} Evening`;
          } else {
            resolvedGameName = options.middayName || `${gameName} Midday`;
          }
        }
      }
    }

    // Extract multiplier if present
    const multiplierMatch = block.match(/Multiplier[:\s]*(\d+)x/i);
    const multiplier = multiplierMatch ? `${multiplierMatch[1]}x` : null;

    results.push({
      game_name: resolvedGameName,
      draw_date: drawDate,
      numbers: numbersText,
      special_number: specialNumber,
      multiplier,
      jackpot: null,
      official_url: officialUrl,
    });
  }

  return results;
}

/** Fetch and parse a lottery.net results page */
async function fetchLotteryNetPage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: browserHeaders });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text || text.includes("Page Not Found")) return null;
    return text;
  } catch (e) {
    console.error(`Failed to fetch ${url}:`, e);
    return null;
  }
}

/** Extract jackpot amounts from lottery.net homepage sidebar */
function extractJackpots(html: string): {
  powerball: string | null;
  megaMillions: string | null;
} {
  let powerball: string | null = null;
  let megaMillions: string | null = null;

  const pbMatch = html.match(
    /powerball-promo[\s\S]*?jackpotBox[^>]*><span>\$<\/span>(\d+)/i
  );
  if (pbMatch) powerball = `$${pbMatch[1]} Million`;

  const mmMatch = html.match(
    /megamillions-promo[\s\S]*?jackpotBox[^>]*><span>\$<\/span>(\d+)/i
  );
  if (mmMatch) megaMillions = `$${mmMatch[1]} Million`;

  return { powerball, megaMillions };
}

// ──────────────────────────────────────────────
// Game fetchers using lottery.net HTML scraping
// ──────────────────────────────────────────────

async function fetchMassCash(): Promise<LotteryResult[]> {
  const html = await fetchLotteryNetPage(
    "https://www.lottery.net/massachusetts/mass-cash/numbers"
  );
  if (!html) return [];
  return parseLotteryNetHtml(html, "Mass Cash", "https://www.masslottery.com/tools/past-results/mass-cash", {
    splitByTime: true,
    middayName: "Mass Cash Midday",
    eveningName: "Mass Cash Evening",
    maxResults: 6,
  });
}

async function fetchMegabucks(): Promise<LotteryResult[]> {
  const html = await fetchLotteryNetPage(
    "https://www.lottery.net/massachusetts/megabucks/numbers"
  );
  if (!html) return [];
  return parseLotteryNetHtml(html, "Megabucks", "https://www.masslottery.com/tools/past-results/megabucks", {
    maxResults: 3,
  });
}

async function fetchNumbersEvening(): Promise<LotteryResult[]> {
  const html = await fetchLotteryNetPage(
    "https://www.lottery.net/massachusetts/numbers-evening/numbers"
  );
  if (!html) return [];
  return parseLotteryNetHtml(html, "Numbers Evening", "https://www.masslottery.com/tools/past-results/the-numbers-game", {
    maxResults: 3,
  });
}

async function fetchNumbersMidday(): Promise<LotteryResult[]> {
  const html = await fetchLotteryNetPage(
    "https://www.lottery.net/massachusetts/numbers-midday/numbers"
  );
  if (!html) return [];
  return parseLotteryNetHtml(html, "Numbers Midday", "https://www.masslottery.com/tools/past-results/the-numbers-game", {
    maxResults: 3,
  });
}

async function fetchMillionaireForLife(): Promise<LotteryResult[]> {
  const html = await fetchLotteryNetPage(
    "https://www.lottery.net/millionaire-for-life/numbers"
  );
  if (!html) return [];

  // Millionaire for Life page has a slightly different structure
  // The latest draw is in the main section, previous draws follow
  const results: LotteryResult[] = [];

  // Parse all draw blocks from the page
  const parsed = parseLotteryNetHtml(
    html,
    "Millionaire for Life",
    "https://www.masslottery.com/tools/past-results/millionaire-for-life",
    { lastBallIsSpecial: true, maxResults: 3 }
  );

  if (parsed.length > 0) return parsed;

  // Fallback: parse the main page structure manually
  // Latest draw date
  const dateMatch = html.match(
    /(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d+(?:st|nd|rd|th)?\s+\d{4})/gi
  );
  const ballMatches = [...html.matchAll(/<li class="ball[^"]*">(\d+)<\/li>/g)];

  if (dateMatch && dateMatch.length > 0 && ballMatches.length >= 6) {
    const drawDate = parseDateText(dateMatch[0].replace(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+/i, ""));
    const allNums = ballMatches.map((m) => parseInt(m[1], 10));
    // First 5 are main, 6th is Lucky Ball
    results.push({
      game_name: "Millionaire for Life",
      draw_date: drawDate,
      numbers: allNums.slice(0, 5).join(" "),
      special_number: [allNums[5]],
      multiplier: null,
      jackpot: null,
      official_url: "https://www.masslottery.com/tools/past-results/millionaire-for-life",
    });
  }

  return results;
}

// Powerball & Mega Millions still use the reliable NY Open Data API
async function fetchPowerball(jackpot: string | null): Promise<LotteryResult[]> {
  try {
    const res = await fetch(
      "https://data.ny.gov/resource/d6yy-54nr.json?$order=draw_date%20DESC&$limit=3",
      { headers: { ...browserHeaders, Accept: "application/json" } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data
      .map((d: any, i: number) => {
        const rawNums = d.winning_numbers;
        if (!rawNums) return null;
        const parts = String(rawNums).trim().split(/\s+/);
        const nums = parts.map(Number).filter((n) => !isNaN(n));
        if (nums.length === 0) return null;
        return {
          game_name: "Powerball",
          draw_date: d.draw_date,
          numbers: parts.join(" "),
          special_number: nums.length > 5 ? [nums[5]] : null,
          multiplier: d.multiplier ? `${d.multiplier}x` : null,
          jackpot: i === 0 ? jackpot : null,
          official_url: "https://www.masslottery.com/tools/past-results/powerball",
        };
      })
      .filter(Boolean);
  } catch (e) {
    console.error("Powerball fetch error:", e);
    return [];
  }
}

async function fetchMegaMillions(jackpot: string | null): Promise<LotteryResult[]> {
  try {
    const res = await fetch(
      "https://data.ny.gov/resource/5xaw-6ayf.json?$order=draw_date%20DESC&$limit=3",
      { headers: { ...browserHeaders, Accept: "application/json" } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data
      .map((d: any, i: number) => {
        const rawNums = d.winning_numbers;
        if (!rawNums) return null;
        const parts = String(rawNums).trim().split(/\s+/);
        const megaBall = d.mega_ball != null ? Number(d.mega_ball) : null;
        return {
          game_name: "Mega Millions",
          draw_date: d.draw_date,
          numbers: parts.join(" "),
          special_number: megaBall != null && !isNaN(megaBall) ? [megaBall] : null,
          multiplier: d.multiplier ? `${d.multiplier}x` : null,
          jackpot: i === 0 ? jackpot : null,
          official_url: "https://www.masslottery.com/tools/past-results/mega-millions",
        };
      })
      .filter(Boolean);
  } catch (e) {
    console.error("Mega Millions fetch error:", e);
    return [];
  }
}

/** Keno: try masslottery.com REST first since it updates every ~4 min */
async function fetchKeno(): Promise<LotteryResult[]> {
  const today = new Date().toISOString().split("T")[0];
  try {
    const res = await fetch(
      `https://www.masslottery.com/rest/keno/getDrawsByDateRange?startDate=${today}&endDate=${today}`,
      {
        headers: {
          ...browserHeaders,
          Accept: "application/json, text/javascript, */*; q=0.01",
          Referer: "https://www.masslottery.com/",
        },
      }
    );
    if (!res.ok) return [];
    const text = await res.text();
    if (!text || text.trim().startsWith("<")) return []; // HTML = blocked
    const data = JSON.parse(text);
    const draws = data?.draws ?? (Array.isArray(data) ? data : []);
    if (draws.length === 0) return [];
    const latest = draws[0];
    const nums = Array.isArray(latest.numbers)
      ? latest.numbers.map(Number)
      : String(latest.winning_numbers || "").split(/[\s,]+/).filter(Boolean).map(Number);
    return [
      {
        game_name: "Keno",
        draw_date: (latest.draw_date || latest.drawDate || today).toString().split("T")[0],
        numbers: nums.filter((n: number) => !isNaN(n)).join(" "),
        special_number: null,
        multiplier: latest.draw_number ? `Draw #${latest.draw_number}` : null,
        jackpot: null,
        official_url: "https://www.masslottery.com/tools/past-results/keno",
      },
    ];
  } catch (e) {
    console.log("Keno REST failed, skipping:", e);
    return [];
  }
}

/** Normalize to YYYY-MM-DD for consistent upsert */
function toDrawDateOnly(v: string | null | undefined): string {
  if (!v) return new Date().toISOString().split("T")[0];
  const s = String(v);
  const part = s.split("T")[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(part)) return part;
  const d = new Date(s);
  return isNaN(d.getTime()) ? new Date().toISOString().split("T")[0] : d.toISOString().split("T")[0];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch jackpots from lottery.net (embedded in the mass-cash page we're already fetching)
    let jackpots = { powerball: null as string | null, megaMillions: null as string | null };

    // Fetch all games in parallel
    const [
      massCashHtml,
      powerball,
      megaMillions,
      megabucks,
      numbersEvening,
      numbersMidday,
      millionaireForLife,
      keno,
    ] = await Promise.all([
      fetchLotteryNetPage("https://www.lottery.net/massachusetts/mass-cash/numbers"),
      fetchPowerball(null), // we'll update jackpot after
      fetchMegaMillions(null),
      fetchMegabucks(),
      fetchNumbersEvening(),
      fetchNumbersMidday(),
      fetchMillionaireForLife(),
      fetchKeno(),
    ]);

    // Extract jackpots from the mass-cash page HTML (it has the sidebar promos)
    if (massCashHtml) {
      jackpots = extractJackpots(massCashHtml);
      console.log("Jackpots extracted:", jackpots);
    }

    // Update Powerball/MM jackpots on latest results
    if (jackpots.powerball && powerball.length > 0) {
      powerball[0].jackpot = jackpots.powerball;
    }
    if (jackpots.megaMillions && megaMillions.length > 0) {
      megaMillions[0].jackpot = jackpots.megaMillions;
    }

    // Parse Mass Cash from the HTML we already fetched
    const massCash = massCashHtml
      ? parseLotteryNetHtml(massCashHtml, "Mass Cash", "https://www.masslottery.com/tools/past-results/mass-cash", {
          splitByTime: true,
          middayName: "Mass Cash Midday",
          eveningName: "Mass Cash Evening",
          maxResults: 6,
        })
      : [];

    const allResults = [
      ...powerball,
      ...megaMillions,
      ...massCash,
      ...megabucks,
      ...numbersEvening,
      ...numbersMidday,
      ...millionaireForLife,
      ...keno,
    ].filter((r) => r.numbers && r.numbers.trim().length > 0);

    console.log(`Fetched ${allResults.length} lottery results`);
    for (const r of allResults) {
      console.log(`  ${r.game_name}: ${r.draw_date} → ${r.numbers}${r.jackpot ? ` (${r.jackpot})` : ""}`);
    }

    if (allResults.length > 0) {
      const { error } = await supabase
        .from("lottery_results")
        .upsert(
          allResults.map((r) => ({
            game_name: r.game_name,
            draw_date: toDrawDateOnly(r.draw_date),
            numbers: r.numbers,
            special_number: r.special_number,
            multiplier: r.multiplier,
            jackpot: r.jackpot,
            official_url: r.official_url,
            updated_at: new Date().toISOString(),
          })),
          { onConflict: "game_name,draw_date" }
        );

      if (error) console.error("Upsert error:", error);
    }

    const { data: latest } = await supabase
      .from("lottery_results")
      .select("*")
      .order("draw_date", { ascending: false })
      .limit(50);

    return new Response(
      JSON.stringify({ results: latest || [], fetched: allResults.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Lottery fetch error:", error);
    return new Response(
      JSON.stringify({ error: String(error), results: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
