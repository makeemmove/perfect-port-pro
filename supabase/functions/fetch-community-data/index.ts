import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LOTTERY_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36";

interface CommunityLotteryResult {
  game_name: string;
  draw_date: string;
  numbers: number[];
  special_number: number[] | null;
  multiplier: string | null;
  jackpot: string | null;
  official_url: string;
  draw_time?: string | null;
}

interface FallRiverObit {
  full_name: string;
  age: number | null;
  date_of_passing: string | null;
  obituary_url: string;
  source: string;
  city: string;
}

async function fetchJsonWithUA(url: string): Promise<any | null> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": LOTTERY_USER_AGENT,
      Accept: "application/json, text/javascript,*/*;q=0.9",
    },
  });
  if (!res.ok) return null;
  return res.json();
}

async function fetchKenoLatest(): Promise<CommunityLotteryResult | null> {
  const today = new Date().toISOString().split("T")[0];
  const res = await fetchJsonWithUA(
    `https://www.masslottery.com/rest/keno/getDrawsByDateRange?startDate=${today}&endDate=${today}`,
  );
  if (!res || !Array.isArray(res.draws) || res.draws.length === 0) {
    return null;
  }

  // Keno runs all day; take the latest draw of today
  const latest = res.draws[0];
  const numbers: number[] = Array.isArray(latest.numbers)
    ? latest.numbers.map(Number)
    : String(latest.winning_numbers || "")
        .split(/[\s,]+/)
        .filter(Boolean)
        .map(Number);

  const drawDate = latest.draw_date || latest.drawDate || today;

  return {
    game_name: "Keno",
    draw_date:
      typeof drawDate === "string"
        ? drawDate
        : new Date(drawDate).toISOString(),
    numbers: numbers.filter((n) => !isNaN(n)),
    special_number: null,
    multiplier: null,
    jackpot: null,
    official_url: "https://www.masslottery.com/tools/past-results/keno",
    draw_time: latest.draw_time || latest.drawTime || null,
  };
}

async function fetchMegabucks(): Promise<CommunityLotteryResult[]> {
  // Megabucks uses the same REST style as other MA games
  const today = new Date().toISOString().split("T")[0];
  const weekAgo = new Date(Date.now() - 7 * 86400000)
    .toISOString()
    .split("T")[0];

  const res = await fetchJsonWithUA(
    `https://www.masslottery.com/rest/megabucks-doubler/getDrawsByDateRange?startDate=${weekAgo}&endDate=${today}`,
  );
  if (!res || !Array.isArray(res.draws) || res.draws.length === 0) {
    return [];
  }

  return res.draws.slice(0, 3).map((d: any) => {
    const nums = Array.isArray(d.numbers)
      ? d.numbers.map(Number)
      : String(d.winning_numbers || "")
          .split(/[\s,]+/)
          .filter(Boolean)
          .map(Number);

    const drawDate = d.draw_date || d.drawDate || d.date || today;

    return {
      game_name: "Megabucks",
      draw_date:
        typeof drawDate === "string"
          ? drawDate
          : new Date(drawDate).toISOString(),
      numbers: nums.filter((n) => !isNaN(n)),
      special_number: null,
      multiplier: null,
      jackpot: d.jackpot || null,
      official_url: "https://www.masslottery.com/tools/past-results/megabucks",
      draw_time: d.draw_time || d.drawTime || null,
    };
  });
}

async function refreshLotteryAndObits() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Trigger the existing fetch-lottery and fetch-obituaries functions to
  // handle the heavy lifting (Powerball, Mega Millions, Mass Cash,
  // Lucky for Life, Numbers Game + Fall River obituary parsing).
  const projectRef = supabaseUrl.replace(/^https:\/\/(.+)\.supabase\.co$/, "$1");
  const functionsBase = `https://${projectRef}.functions.supabase.co`;

  const authHeaders = {
    "Content-Type": "application/json",
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    "User-Agent": LOTTERY_USER_AGENT,
  };

  // Fire both in parallel but don't crash the whole function if one fails
  const [lotteryResp, obitsResp] = await Promise.allSettled([
    fetch(`${functionsBase}/fetch-lottery`, {
      method: "POST",
      headers: authHeaders,
    }),
    fetch(`${functionsBase}/fetch-obituaries`, {
      method: "POST",
      headers: authHeaders,
    }),
  ]);

  if (
    lotteryResp.status === "fulfilled" &&
    lotteryResp.value.ok &&
    obitsResp.status === "fulfilled" &&
    obitsResp.value.ok
  ) {
    // Additionally enrich with Megabucks + Keno into the shared table so the
    // community dashboard has a single source of truth.
    const [keno, megabucks] = await Promise.all([
      fetchKenoLatest(),
      fetchMegabucks(),
    ]);

    const extra: CommunityLotteryResult[] = [];
    if (keno) extra.push(keno);
    extra.push(...megabucks);

    if (extra.length > 0) {
      const { error } = await supabase
        .from("lottery_results")
        .upsert(
          extra.map((r) => ({
            game_name: r.game_name,
            draw_date: r.draw_date,
            numbers: r.numbers,
            special_number: r.special_number,
            multiplier: r.multiplier,
            jackpot: r.jackpot,
            official_url: r.official_url,
            updated_at: new Date().toISOString(),
            // Optional extension column; safe to ignore if not present
            // @ts-ignore - column may not exist yet
            draw_time: r.draw_time ?? null,
          })),
          { onConflict: "game_name,draw_date" },
        );
      if (error) console.error("Community lottery upsert error:", error);
    }
  }

  // Pull back the latest for the API response
  const { data: lottery } = await supabase
    .from("lottery_results")
    .select("*")
    .order("draw_date", { ascending: false })
    .limit(50);

  const { data: obits } = await supabase
    .from("local_obituaries")
    .select("*")
    .eq("city", "Fall River")
    .order("created_at", { ascending: false })
    .limit(50);

  return {
    lottery: lottery || [],
    obituaries: (obits || []) as FallRiverObit[],
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data = await refreshLotteryAndObits();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("fetch-community-data error:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});


