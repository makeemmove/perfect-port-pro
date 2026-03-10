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

// Fetch Powerball from NY Open Data
async function fetchPowerball(): Promise<LotteryResult[]> {
  try {
    const res = await fetch(
      "https://data.ny.gov/resource/d6yy-54nr.json?$order=draw_date%20DESC&$limit=3"
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((d: any) => {
      const nums = d.winning_numbers.split(" ").map(Number);
      return {
        game_name: "Powerball",
        draw_date: d.draw_date,
        numbers: nums.slice(0, 5),
        special_number: [nums[5]],
        multiplier: d.multiplier ? `${d.multiplier}x` : null,
        jackpot: null,
        official_url: "https://www.masslottery.com/tools/past-results/powerball",
      };
    });
  } catch (e) {
    console.error("Powerball fetch error:", e);
    return [];
  }
}

// Fetch Mega Millions from NY Open Data
async function fetchMegaMillions(): Promise<LotteryResult[]> {
  try {
    const res = await fetch(
      "https://data.ny.gov/resource/5xaw-6ayf.json?$order=draw_date%20DESC&$limit=3"
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((d: any) => {
      const nums = d.winning_numbers.split(" ").map(Number);
      return {
        game_name: "Mega Millions",
        draw_date: d.draw_date,
        numbers: nums.slice(0, 5),
        special_number: [nums[5]],
        multiplier: d.mega_ball ? null : null,
        jackpot: null,
        official_url: "https://www.masslottery.com/tools/past-results/mega-millions",
      };
    });
  } catch (e) {
    console.error("Mega Millions fetch error:", e);
    return [];
  }
}

// Fetch MA-specific games from masslottery.com REST API
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
    if (!res.ok) {
      console.error(`MA ${gameName} fetch failed: ${res.status}`);
      return [];
    }
    const data = await res.json();
    const draws = data.draws || data.results || [];
    if (!Array.isArray(draws) || draws.length === 0) return [];

    return draws.slice(0, 3).map((d: any) => {
      let numbers: number[] = [];
      let special: number[] | null = null;
      let multiplier: string | null = null;

      // Mass Cash format
      if (d.numbers && Array.isArray(d.numbers)) {
        numbers = d.numbers.map(Number);
      } else if (d.winning_numbers) {
        // Some formats have winning_numbers as string
        numbers = String(d.winning_numbers).split(/[\s,]+/).filter(Boolean).map(Number);
      } else if (d.num1 !== undefined) {
        // Lucky for Life / numbered fields
        numbers = [d.num1, d.num2, d.num3, d.num4, d.num5].filter(n => n != null).map(Number);
        if (d.lucky_ball != null) special = [Number(d.lucky_ball)];
      }

      if (d.bonus != null && !special) {
        special = [Number(d.bonus)];
      }
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
    
    // Group by midday/evening
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

    // Fetch all games in parallel
    const [powerball, megaMillions, massCash, luckyForLife, numbersGame] =
      await Promise.all([
        fetchPowerball(),
        fetchMegaMillions(),
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

    // Upsert into DB
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

      if (error) {
        console.error("Upsert error:", error);
      }
    }

    // Return latest results
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
