import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Chrome-like User-Agent so Mass Lottery treats us like a browser
const browserHeaders: HeadersInit = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0 Safari/537.36",
  "Accept":
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
};

interface LotteryResult {
  game_name: string;
  draw_date: string;
  numbers: number[];
  special_number: number[] | null;
  multiplier: string | null;
  jackpot: string | null;
  official_url: string;
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
    return data.map((d: any, i: number) => {
      const nums = d.winning_numbers.split(" ").map(Number);
      return {
        game_name: "Powerball",
        draw_date: d.draw_date,
        numbers: nums.slice(0, 5),
        special_number: [nums[5]],
        multiplier: d.multiplier ? `${d.multiplier}x` : null,
        jackpot: i === 0 ? jackpotAmount : null, // only show jackpot on latest
        official_url: "https://www.masslottery.com/tools/past-results/powerball",
      };
    });
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
    return data.map((d: any, i: number) => {
      const nums = d.winning_numbers.split(" ").map(Number);
      const megaBall = d.mega_ball ? Number(d.mega_ball) : nums[5];
      return {
        game_name: "Mega Millions",
        draw_date: d.draw_date,
        numbers: nums.slice(0, 5),
        special_number: megaBall != null && !isNaN(megaBall) ? [megaBall] : null,
        multiplier: d.multiplier ? `${d.multiplier}x` : null,
        jackpot: i === 0 ? jackpotAmount : null,
        official_url: "https://www.masslottery.com/tools/past-results/mega-millions",
      };
    });
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
    const data = await res.json();
    const draws = data.draws || data.results || [];
    if (!Array.isArray(draws) || draws.length === 0) return [];

    return draws.slice(0, 3).map((d: any) => {
      let numbers: number[] = [];
      let special: number[] | null = null;
      let multiplier: string | null = null;

      if (d.numbers && Array.isArray(d.numbers)) {
        numbers = d.numbers.map(Number);
      } else if (d.winning_numbers) {
        numbers = String(d.winning_numbers).split(/[\s,]+/).filter(Boolean).map(Number);
      } else if (d.num1 !== undefined) {
        numbers = [d.num1, d.num2, d.num3, d.num4, d.num5].filter(n => n != null).map(Number);
        if (d.lucky_ball != null) special = [Number(d.lucky_ball)];
      }

      if (d.bonus != null && !special) special = [Number(d.bonus)];
      if (d.multiplier) multiplier = String(d.multiplier);

      const drawDate = d.draw_date || d.drawDate || d.date || today;

      return {
        game_name: gameName,
        draw_date: typeof drawDate === 'string' ? drawDate : new Date(drawDate).toISOString(),
        numbers: numbers.filter(n => !isNaN(n)),
        special_number: special,
        multiplier,
        jackpot: d.jackpot || null,
        official_url: `https://www.masslottery.com/tools/past-results/${urlSlug}`,
      };
    });
  } catch (e) {
    console.error(`MA ${gameName} error:`, e);
    return [];
  }
}

// Fetch Numbers Game (midday + evening as separate "games")
async function fetchNumbersGame(): Promise<LotteryResult[]> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date(
      Date.now() - 7 * 86400000
    ).toISOString().split("T")[0];

    const res = await fetch(
      `https://www.masslottery.com/rest/the-numbers-game/getDrawsByDateRange?startDate=${weekAgo}&endDate=${today}`,
      { headers: browserHeaders }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const draws = data.draws || data.results || [];
    if (!Array.isArray(draws)) return [];

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
      
      let numbers: number[] = [];
      if (d.numbers && Array.isArray(d.numbers)) {
        numbers = d.numbers.map(Number);
      } else if (d.winning_numbers) {
        numbers = String(d.winning_numbers).split(/[\s,]+/).filter(Boolean).map(Number);
      } else if (d.number != null) {
        numbers = String(d.number).split('').map(Number);
      }

      const drawDate = d.draw_date || d.drawDate || d.date || today;
      
      results.push({
        game_name: label,
        draw_date: typeof drawDate === 'string' ? drawDate : new Date(drawDate).toISOString(),
        numbers: numbers.filter(n => !isNaN(n)),
        special_number: null,
        multiplier: null,
        jackpot: null,
        official_url: "https://www.masslottery.com/tools/past-results/the-numbers-game",
      });
    }
    return results;
  } catch (e) {
    console.error("Numbers Game error:", e);
    return [];
  }
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
    const data = await res.json();
    const draws = data.draws || data.results || [];
    if (!Array.isArray(draws)) return [];

    const results: LotteryResult[] = [];
    for (const d of draws.slice(0, 10)) {
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

      let numbers: number[] = [];
      if (d.numbers && Array.isArray(d.numbers)) {
        numbers = d.numbers.map(Number);
      } else if (d.winning_numbers) {
        numbers = String(d.winning_numbers)
          .split(/[\s,]+/)
          .filter(Boolean)
          .map(Number);
      } else if (d.num1 !== undefined) {
        numbers = [
          d.num1,
          d.num2,
          d.num3,
          d.num4,
          d.num5,
        ]
          .filter((n) => n != null)
          .map(Number);
      }

      const drawDate = d.draw_date || d.drawDate || d.date || today;

      results.push({
        game_name: label,
        draw_date:
          typeof drawDate === "string"
            ? drawDate
            : new Date(drawDate).toISOString(),
        numbers: numbers.filter((n) => !isNaN(n)),
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

// Fetch Megabucks (Mon/Wed/Sat 9 PM) via generic helper
async function fetchMegabucks(): Promise<LotteryResult[]> {
  return fetchMassGame("megabucks", "Megabucks", "megabucks");
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
    const data = await res.json();
    const draws = data.draws || data.results || [];
    if (!Array.isArray(draws) || draws.length === 0) return [];

    const latest = draws[0];

    let numbers: number[] = [];
    if (latest.numbers && Array.isArray(latest.numbers)) {
      numbers = latest.numbers.map(Number);
    } else if (latest.winning_numbers) {
      numbers = String(latest.winning_numbers)
        .split(/[\s,]+/)
        .filter(Boolean)
        .map(Number);
    } else if (latest.winningNumbers) {
      numbers = String(latest.winningNumbers)
        .split(/[\s,]+/)
        .filter(Boolean)
        .map(Number);
    }

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
        numbers: numbers.filter((n) => !isNaN(n)).slice(0, 20),
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
    ].filter((r) => r.numbers.length > 0);

    console.log(`Fetched ${allResults.length} lottery results`);

    if (allResults.length > 0) {
      const { error } = await supabase
        .from("lottery_results")
        .upsert(
          allResults.map((r) => ({
            game_name: r.game_name,
            draw_date: r.draw_date,
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
