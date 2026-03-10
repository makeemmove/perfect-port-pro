import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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
    const pbRes = await fetch("https://www.powerball.com/api/v1/estimates/powerball?_format=json");
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
    const mmRes = await fetch("https://www.megamillions.com/cmspages/utilservice.asmx/GetLatestDrawData");
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
      const res = await fetch("https://data.ny.gov/resource/d6yy-54nr.json?$order=draw_date%20DESC&$limit=1");
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
      "https://data.ny.gov/resource/d6yy-54nr.json?$order=draw_date%20DESC&$limit=3"
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
      "https://data.ny.gov/resource/5xaw-6ayf.json?$order=draw_date%20DESC&$limit=3"
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

// Fetch MA-specific games
async function fetchMassGame(
  game: string,
  gameName: string,
  urlSlug: string
): Promise<LotteryResult[]> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
    
    const res = await fetch(
      `https://www.masslottery.com/rest/${game}/getDrawsByDateRange?startDate=${weekAgo}&endDate=${today}`
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

// Fetch Numbers Game
async function fetchNumbersGame(): Promise<LotteryResult[]> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
    
    const res = await fetch(
      `https://www.masslottery.com/rest/the-numbers-game/getDrawsByDateRange?startDate=${weekAgo}&endDate=${today}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    const draws = data.draws || data.results || [];
    if (!Array.isArray(draws)) return [];

    const results: LotteryResult[] = [];
    for (const d of draws.slice(0, 6)) {
      const drawTime = d.draw_time || d.drawTime || '';
      const isEvening = String(drawTime).toLowerCase().includes('evening') || 
                        String(drawTime).toLowerCase().includes('eve') ||
                        String(drawTime).toLowerCase().includes('night');
      const label = isEvening ? 'Numbers Evening' : 'Numbers Midday';
      
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

    const [powerball, megaMillions, massCash, luckyForLife, numbersGame] =
      await Promise.all([
        fetchPowerball(jackpots.powerball),
        fetchMegaMillions(jackpots.megaMillions),
        fetchMassGame("mass-cash", "Mass Cash", "mass-cash"),
        fetchMassGame("lucky-for-life", "Lucky for Life", "lucky-for-life"),
        fetchNumbersGame(),
      ]);

    const allResults = [
      ...powerball,
      ...megaMillions,
      ...massCash,
      ...luckyForLife,
      ...numbersGame,
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
