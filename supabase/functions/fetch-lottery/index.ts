import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Chrome-like User-Agent so Mass Lottery treats us like a browser and returns JSON when available
const browserHeaders: HeadersInit = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0 Safari/537.36",
  "Accept":
    "application/json, text/html, application/xhtml+xml, application/xml;q=0.9, */*;q=0.8",
  "Referer": "https://www.masslottery.com/",
};

interface LotteryResult {
  game_name: string;
  draw_date: string;
  numbers: string | null;
  special_number: number[] | null;
  multiplier: string | null;
  jackpot: string | null;
  official_url: string;
}

function normalizeWinningNumbers(
  raw:
    | string
    | number
    | (string | number)[]
    | Record<string, unknown>
    | null
    | undefined
): { text: string | null; nums: number[] } {
  if (raw == null) {
    return { text: null, nums: [] };
  }

  // API sometimes returns { numbers: [...] } or { winning_numbers: [...] }
  if (typeof raw === "object" && !Array.isArray(raw)) {
    const arr =
      (raw as any).numbers ??
      (raw as any).winning_numbers ??
      (raw as any).values;
    if (Array.isArray(arr) && arr.length > 0) {
      return normalizeWinningNumbers(arr);
    }
  }

  if (Array.isArray(raw)) {
    const parts = raw
      .map((v) => String(v).trim())
      .filter((v) => v.length > 0);
    const text = parts.join(" ");
    const nums = parts
      .map((p) => Number(p))
      .filter((n) => !Number.isNaN(n));
    return { text: text || null, nums };
  }

  const str = String(raw).trim();
  if (!str || str === "[object Object]") return { text: null, nums: [] };

  const segments = str.split(/[\s,]+/).filter((s) => s.length > 0);
  const text = segments.join(" ");
  const nums = segments
    .map((s) => Number(s))
    .filter((n) => !Number.isNaN(n));

  return { text: text || null, nums };
}

/** Normalize to YYYY-MM-DD for consistent upsert on game_name + draw_date */
function toDrawDateOnly(v: string | object | null | undefined): string {
  if (v == null) return new Date().toISOString().split("T")[0];
  if (typeof v === "string") {
    const part = v.split("T")[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(part)) return part;
    const d = new Date(v);
    return isNaN(d.getTime()) ? new Date().toISOString().split("T")[0] : d.toISOString().split("T")[0];
  }
  const d = new Date((v as any).toString?.() ?? v);
  return isNaN(d.getTime()) ? new Date().toISOString().split("T")[0] : d.toISOString().split("T")[0];
}

/** Extract draws array from Mass Lottery API response (multiple possible shapes) */
function getDrawsFromResponse(data: any): any[] {
  if (!data || typeof data !== "object") return [];
  const arr =
    data.draws ??
    data.results ??
    data.data?.draws ??
    data.data?.results ??
    (Array.isArray(data) ? data : []);
  if (Array.isArray(arr)) return arr;
  const single = data.draw ?? data.result ?? data.data?.draw ?? data.data?.result;
  if (single && typeof single === "object") return [single];
  return [];
}

// Fetch current jackpot estimates
async function fetchJackpots(): Promise<{ powerball: string | null; megaMillions: string | null }> {
  let powerball: string | null = null;
  let megaMillions: string | null = null;

  try {
    // Try Powerball API
    const pbRes = await fetch(
      "https://www.powerball.com/api/v1/estimates/powerball?_format=json",
      { headers: browserHeaders }
    );
    if (pbRes.ok) {
      const pbData = await pbRes.json();
      if (pbData?.data?.[0]?.field_prize_amount) {
        powerball = pbData.data[0].field_prize_amount;
      } else if (pbData?.data?.[0]?.field_prize_amount_text) {
        powerball = pbData.data[0].field_prize_amount_text;
      }
    }
  } catch (e) {
    console.log("Powerball jackpot fetch failed, trying fallback:", e);
  }

  try {
    // Try Mega Millions
    const mmRes = await fetch(
      "https://www.megamillions.com/cmspages/utilservice.asmx/GetLatestDrawData",
      { headers: browserHeaders }
    );
    if (mmRes.ok) {
      const mmText = await mmRes.text();
      const jpMatch = mmText.match(/Jackpot["\s:>]*\$?([\d,]+\s*(Million|Billion)?)/i);
      if (jpMatch) {
        megaMillions = `$${jpMatch[1]}`;
      }
    }
  } catch (e) {
    console.log("Mega Millions jackpot fetch failed:", e);
  }

  // Fallback: try lottery APIs
  if (!powerball || !megaMillions) {
    try {
      const res = await fetch(
        "https://data.ny.gov/resource/d6yy-54nr.json?$order=draw_date%20DESC&$limit=1",
        { headers: browserHeaders }
      );
      if (res.ok) {
        const data = await res.json();
        // NY data doesn't have jackpot but we tried
      }
    } catch { /* ignore */ }
  }

  return { powerball, megaMillions };
}

// Fetch Powerball from NY Open Data
async function fetchPowerball(jackpotAmount: string | null): Promise<LotteryResult[]> {
  try {
    const res = await fetch(
      "https://data.ny.gov/resource/d6yy-54nr.json?$order=draw_date%20DESC&$limit=3",
      { headers: browserHeaders }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data
      .map((d: any, i: number) => {
        const { text, nums } = normalizeWinningNumbers(d.winning_numbers);
        if (!text) return null;

        return {
          game_name: "Powerball",
          draw_date: d.draw_date,
          numbers: text,
          special_number:
            nums.length > 5 && !Number.isNaN(nums[5]) ? [nums[5]] : null,
          multiplier: d.multiplier ? `${d.multiplier}x` : null,
          jackpot: i === 0 ? jackpotAmount : null, // only show jackpot on latest
          official_url:
            "https://www.masslottery.com/tools/past-results/powerball",
        };
      })
      .filter((r: LotteryResult | null): r is LotteryResult => r !== null);
  } catch (e) {
    console.error("Powerball fetch error:", e);
    return [];
  }
}

// Fetch Mega Millions from NY Open Data
async function fetchMegaMillions(jackpotAmount: string | null): Promise<LotteryResult[]> {
  try {
    const res = await fetch(
      "https://data.ny.gov/resource/5xaw-6ayf.json?$order=draw_date%20DESC&$limit=3",
      { headers: browserHeaders }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data
      .map((d: any, i: number) => {
        const { text, nums } = normalizeWinningNumbers(d.winning_numbers);
        if (!text) return null;

        const megaBallRaw =
          d.mega_ball != null ? Number(d.mega_ball) : nums[5];
        const megaBall =
          megaBallRaw != null && !Number.isNaN(megaBallRaw)
            ? megaBallRaw
            : null;

        return {
          game_name: "Mega Millions",
          draw_date: d.draw_date,
          numbers: text,
          special_number: megaBall != null ? [megaBall] : null,
          multiplier: d.multiplier ? `${d.multiplier}x` : null,
          jackpot: i === 0 ? jackpotAmount : null,
          official_url:
            "https://www.masslottery.com/tools/past-results/mega-millions",
        };
      })
      .filter((r: LotteryResult | null): r is LotteryResult => r !== null);
  } catch (e) {
    console.error("Mega Millions fetch error:", e);
    return [];
  }
}

// Generic helper for MA draw games that don't need special casing
async function fetchMassGame(
  game: string,
  gameName: string,
  urlSlug: string
): Promise<LotteryResult[]> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date(
      Date.now() - 7 * 86400000
    ).toISOString().split("T")[0];

    const res = await fetch(
      `https://www.masslottery.com/rest/${game}/getDrawsByDateRange?startDate=${weekAgo}&endDate=${today}`,
      { headers: browserHeaders }
    );
    if (!res.ok) return [];
    let data: any;
    try {
      const raw = await res.text();
      if (!raw || !raw.trim()) return [];
      data = JSON.parse(raw);
    } catch {
      return [];
    }
    const draws = getDrawsFromResponse(data);
    if (draws.length === 0) return [];

    return draws
      .slice(0, 3)
      .map((d: any) => {
        const rawWinning =
          d.winning_numbers ??
          d.winningNumbers ??
          d.numbers ??
          (d.num1 !== undefined
            ? [d.num1, d.num2, d.num3, d.num4, d.num5]
            : null);

        const { text, nums } = normalizeWinningNumbers(rawWinning);
        if (!text) return null;

        let special: number[] | null = null;
        if (d.lucky_ball != null) special = [Number(d.lucky_ball)];
        if (d.bonus != null && !special) special = [Number(d.bonus)];

        const multiplier = d.multiplier ? String(d.multiplier) : null;
        const drawDate = d.draw_date || d.drawDate || d.date || today;

        return {
          game_name: gameName,
          draw_date:
            typeof drawDate === "string"
              ? drawDate
              : new Date(drawDate).toISOString(),
          numbers: text,
          special_number: special,
          multiplier,
          jackpot: d.jackpot || null,
          official_url: `https://www.masslottery.com/tools/past-results/${urlSlug}`,
        };
      })
      .filter((r: LotteryResult | null): r is LotteryResult => r !== null);
  } catch (e) {
    console.error(`MA ${gameName} error:`, e);
    return [];
  }
}

// Fetch Numbers Game (midday + evening as separate "games")
async function fetchNumbersGame(): Promise<LotteryResult[]> {
  const today = new Date().toISOString().split("T")[0];
  const weekAgo = new Date(
    Date.now() - 7 * 86400000
  ).toISOString().split("T")[0];

  for (const slug of ["the-numbers-game", "the-numbers"]) {
    try {
      const res = await fetch(
        `https://www.masslottery.com/rest/${slug}/getDrawsByDateRange?startDate=${weekAgo}&endDate=${today}`,
        { headers: browserHeaders }
      );
      if (!res.ok) continue;
      const raw = await res.text();
      if (!raw || raw.trim().length === 0) continue;
      let data: any;
      try {
        data = JSON.parse(raw);
      } catch {
        continue;
      }

      const draws = getDrawsFromResponse(data);
      if (draws.length === 0) continue;

      const results: LotteryResult[] = [];
      for (const d of draws.slice(0, 6)) {
        const rawLabel =
          d.draw_name ||
          d.drawName ||
          d.description ||
          d.draw_description ||
          d.drawDescription ||
          d.draw_time ||
          d.drawTime ||
          "";
        const lowerLabel = String(rawLabel).toLowerCase();

        let isEvening: boolean;
        if (lowerLabel.includes("midday")) {
          isEvening = false;
        } else if (lowerLabel.includes("evening") || lowerLabel.includes("night")) {
          isEvening = true;
        } else {
          const drawTime = d.draw_time || d.drawTime || "";
          const timeString = String(drawTime).toLowerCase();
          isEvening =
            timeString.includes("9 pm") ||
            timeString.includes("9:00 pm") ||
            timeString.includes("pm") ||
            timeString.includes("evening");
        }

        const label = isEvening ? "Numbers Evening" : "Numbers Midday";

        const rawWinning =
          d.winning_numbers ??
          d.winningNumbers ??
          d.winning_number ??
          d.numbers ??
          (d.number != null ? String(d.number).split("") : null);

        const { text } = normalizeWinningNumbers(rawWinning);
        if (!text) continue;

        const drawDate = toDrawDateOnly(d.draw_date || d.drawDate || d.date || today);

        results.push({
          game_name: label,
          draw_date: drawDate,
          numbers: text,
          special_number: null,
          multiplier: null,
          jackpot: null,
          official_url:
            "https://www.masslottery.com/tools/past-results/the-numbers-game",
        });
      }
      if (results.length > 0) return results;
    } catch (e) {
      console.error(`Numbers Game (${slug}) error:`, e);
    }
  }
  return [];
}

// Fetch Mass Cash with distinct Midday and Evening games
async function fetchMassCash(): Promise<LotteryResult[]> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date(
      Date.now() - 7 * 86400000
    ).toISOString().split("T")[0];

    const res = await fetch(
      `https://www.masslottery.com/rest/mass-cash/getDrawsByDateRange?startDate=${weekAgo}&endDate=${today}`,
      { headers: browserHeaders }
    );
    if (!res.ok) return [];
    let data: any;
    try {
      const raw = await res.text();
      if (!raw || !raw.trim()) return [];
      data = JSON.parse(raw);
    } catch {
      return [];
    }

    let draws = getDrawsFromResponse(data);
    draws = [...draws].sort((a: any, b: any) => {
      const da = a.draw_date || a.drawDate || a.date || "";
      const db = b.draw_date || b.drawDate || b.date || "";
      return String(db).localeCompare(String(da));
    });

    const results: LotteryResult[] = [];
    for (const d of draws.slice(0, 14)) {
      const rawLabel =
        d.draw_name ||
        d.drawName ||
        d.description ||
        d.draw_description ||
        d.drawDescription ||
        d.draw_time ||
        d.drawTime ||
        "";
      const lowerLabel = String(rawLabel).toLowerCase();

      let isEvening: boolean;
      if (lowerLabel.includes("midday")) {
        isEvening = false;
      } else if (lowerLabel.includes("evening") || lowerLabel.includes("night")) {
        isEvening = true;
      } else {
        const drawTime = d.draw_time || d.drawTime || "";
        const timeString = String(drawTime).toLowerCase();
        isEvening =
          timeString.includes("9 pm") ||
          timeString.includes("9:00 pm") ||
          timeString.includes("pm") ||
          timeString.includes("evening");
      }

      const label = isEvening ? "Mass Cash Evening" : "Mass Cash Midday";

      const rawWinning =
        d.winning_numbers ??
        d.winningNumbers ??
        d.winning_number ??
        d.numbers ??
        d.draw_details?.winning_numbers ??
        d.draw_details?.winningNumbers ??
        (d.num1 !== undefined
          ? [d.num1, d.num2, d.num3, d.num4, d.num5]
          : d.number1 !== undefined
          ? [d.number1, d.number2, d.number3, d.number4, d.number5]
          : null);

      const { text } = normalizeWinningNumbers(rawWinning);
      if (!text) continue;

      const drawDate = toDrawDateOnly(d.draw_date || d.drawDate || d.date || today);

      results.push({
        game_name: label,
        draw_date: drawDate,
        numbers: text,
        special_number: null,
        multiplier: null,
        jackpot: null,
        official_url:
          "https://www.masslottery.com/tools/past-results/mass-cash",
      });
    }
    return results;
  } catch (e) {
    console.error("Mass Cash error:", e);
    return [];
  }
}

// Fetch Megabucks (Mon/Wed/Sat 9 PM) — MA REST API uses megabucks-doubler path
async function fetchMegabucks(): Promise<LotteryResult[]> {
  return fetchMassGame("megabucks-doubler", "Megabucks", "megabucks");
}

// Fetch Millionaire for Life (daily at ~10:38 PM) using Lucky for Life backend
async function fetchMillionaireForLife(): Promise<LotteryResult[]> {
  // The REST backend path may still use the legacy lucky-for-life slug,
  // but we brand and link the game as Millionaire for Life in our hub.
  return fetchMassGame(
    "lucky-for-life",
    "Millionaire for Life",
    "millionaire-for-life"
  );
}

// Fetch latest Keno draw (20-number grid)
async function fetchKeno(): Promise<LotteryResult[]> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const res = await fetch(
      `https://www.masslottery.com/rest/keno/getDrawsByDateRange?startDate=${today}&endDate=${today}`,
      { headers: browserHeaders }
    );
    if (!res.ok) return [];
    let data: any;
    try {
      const raw = await res.text();
      if (!raw || !raw.trim()) return [];
      data = JSON.parse(raw);
    } catch {
      return [];
    }
    const draws = getDrawsFromResponse(data);
    if (draws.length === 0) return [];

    const latest = draws[0];

    const rawWinning =
      latest.winning_numbers ??
      latest.winningNumbers ??
      latest.numbers ??
      (typeof latest.winningNumbers === "string"
        ? latest.winningNumbers
        : null);

    const { text, nums } = normalizeWinningNumbers(rawWinning);
    if (!text) return [];

    const drawDate =
      latest.draw_date || latest.drawDate || latest.date || today;
    const drawNumber =
      latest.draw_number || latest.drawNumber || latest.gameNumber;

    return [
      {
        game_name: "Keno",
        draw_date:
          typeof drawDate === "string"
            ? drawDate
            : new Date(drawDate).toISOString(),
        numbers: text,
        special_number: null,
        multiplier: drawNumber ? `Draw #${drawNumber}` : null,
        jackpot: null,
        official_url:
          "https://www.masslottery.com/tools/past-results/keno",
      },
    ];
  } catch (e) {
    console.error("Keno error:", e);
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch jackpots first, then pass to game fetchers
    const jackpots = await fetchJackpots();
    console.log("Jackpots:", jackpots);

    const [
      powerball,
      megaMillions,
      massCash,
      millionaireForLife,
      numbersGame,
      megabucks,
      keno,
    ] = await Promise.all([
      fetchPowerball(jackpots.powerball),
      fetchMegaMillions(jackpots.megaMillions),
      fetchMassCash(),
      fetchMillionaireForLife(),
      fetchNumbersGame(),
      fetchMegabucks(),
      fetchKeno(),
    ]);

    const allResults = [
      ...powerball,
      ...megaMillions,
      ...massCash,
      ...millionaireForLife,
      ...numbersGame,
      ...megabucks,
      ...keno,
    ].filter((r) => r.numbers && r.numbers.trim().length > 0);

    console.log(`Fetched ${allResults.length} lottery results`);

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
      .limit(20);

    return new Response(JSON.stringify({ results: latest || [], fetched: allResults.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Lottery fetch error:", error);
    return new Response(
      JSON.stringify({ error: String(error), results: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
