#!/usr/bin/env node
/**
 * Fetch draw results from masslottery.com (and NY for Powerball/Mega Millions),
 * turn the API JSON into the exact format used by the lottery cards (numbers +
 * special_number as arrays), and optionally upsert into Supabase to keep cards updated.
 *
 * Usage:
 *   node scripts/update-lottery-cards-from-masslottery.mjs           # print card-format JSON
 *   node scripts/update-lottery-cards-from-masslottery.mjs --json    # same, one JSON array
 *   node scripts/update-lottery-cards-from-masslottery.mjs --db      # upsert to Supabase (keeps cards updated)
 *
 * Env for --db: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 * To use .env: node -r dotenv/config scripts/update-lottery-cards-from-masslottery.mjs --db
 * Or: npm run lottery-cards-update:db  (with dotenv installed, loads .env)
 */

const browserHeaders = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0 Safari/537.36",
  Accept:
    "application/json, text/html, application/xhtml+xml, application/xml;q=0.9, */*;q=0.8",
  Referer: "https://www.masslottery.com/",
};

function normalizeWinningNumbers(raw) {
  if (raw == null) return { text: null, nums: [] };
  if (typeof raw === "object" && !Array.isArray(raw)) {
    const arr = raw.numbers ?? raw.winning_numbers ?? raw.values;
    if (Array.isArray(arr) && arr.length > 0) return normalizeWinningNumbers(arr);
  }
  if (Array.isArray(raw)) {
    const nums = raw
      .map((v) => Number(String(v).trim()))
      .filter((n) => !Number.isNaN(n));
    const text = nums.length ? nums.join(" ") : null;
    return { text, nums };
  }
  const str = String(raw).trim();
  if (!str || str === "[object Object]") return { text: null, nums: [] };
  const segments = str.split(/[\s,]+/).filter((s) => s.length > 0);
  const nums = segments.map((s) => Number(s)).filter((n) => !Number.isNaN(n));
  return { text: nums.length ? nums.join(" ") : null, nums };
}

function normalizeJackpot(value) {
  if (value == null) return null;

  let str = String(value).trim();
  if (!str) return null;

  // Plain numeric strings like "421000000" → format as dollars.
  if (/^\d{3,}$/.test(str.replace(/,/g, ""))) {
    const numeric = Number(str.replace(/,/g, ""));
    if (!Number.isNaN(numeric) && numeric > 0) {
      const billions = numeric >= 1_000_000_000;
      const unit = billions ? "Billion" : "Million";
      const divisor = billions ? 1_000_000_000 : 1_000_000;
      const rounded = Math.round((numeric / divisor) * 10) / 10;
      return `$${rounded}${unit === "Million" ? " Million" : " Billion"}`;
    }
  }

  if (/^\d/.test(str) && !str.startsWith("$")) {
    str = `$${str}`;
  }

  return str;
}

function getDraws(data) {
  if (!data || typeof data !== "object") return [];
  const arr =
    data.draws ??
    data.results ??
    data.data?.draws ??
    data.data?.results ??
    (Array.isArray(data) ? data : []);
  if (Array.isArray(arr)) return arr;
  const single = data.draw ?? data.result ?? data.data?.draw ?? data.data?.result;
  return single && typeof single === "object" ? [single] : [];
}

function toDrawDateOnly(v) {
  if (v == null) return new Date().toISOString().split("T")[0];
  if (typeof v === "string") {
    const part = v.split("T")[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(part)) return part;
    const d = new Date(v);
    return isNaN(d.getTime()) ? new Date().toISOString().split("T")[0] : d.toISOString().split("T")[0];
  }
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? new Date().toISOString().split("T")[0] : d.toISOString().split("T")[0];
}

/** Convert a single API draw into card row: numbers + special_number as arrays for display. */
function toCardRow(row) {
  const numbers = Array.isArray(row.numbers) ? row.numbers : normalizeWinningNumbers(row.numbers).nums;
  const special_number =
    row.special_number != null
      ? Array.isArray(row.special_number)
        ? row.special_number
        : [row.special_number]
      : null;
  return {
    game_name: row.game_name,
    draw_date: toDrawDateOnly(row.draw_date),
    numbers,
    special_number: special_number && special_number.length ? special_number : null,
    multiplier: row.multiplier ?? null,
    jackpot: row.jackpot ?? null,
    official_url: row.official_url,
  };
}

// --- Powerball (NY Open Data)
async function fetchPowerball(jackpotAmount = null) {
  const res = await fetch(
    "https://data.ny.gov/resource/d6yy-54nr.json?$order=draw_date%20DESC&$limit=3",
    { headers: browserHeaders }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data
    .map((d, i) => {
      const { nums } = normalizeWinningNumbers(d.winning_numbers);
      if (!nums.length) return null;
      const main = nums.slice(0, 5);
      const powerball = nums.length > 5 && !Number.isNaN(nums[5]) ? [nums[5]] : null;
      return toCardRow({
        game_name: "Powerball",
        draw_date: d.draw_date,
        numbers: main,
        special_number: powerball,
        multiplier: d.multiplier ? `${d.multiplier}x` : null,
        jackpot: i === 0 ? jackpotAmount : null,
        official_url: "https://www.masslottery.com/tools/past-results/powerball",
      });
    })
    .filter(Boolean);
}

// --- Mega Millions (NY Open Data)
async function fetchMegaMillions(jackpotAmount = null) {
  const res = await fetch(
    "https://data.ny.gov/resource/5xaw-6ayf.json?$order=draw_date%20DESC&$limit=3",
    { headers: browserHeaders }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data
    .map((d, i) => {
      const { nums } = normalizeWinningNumbers(d.winning_numbers);
      if (!nums.length) return null;
      const main = nums.slice(0, 5);
      const megaRaw = d.mega_ball != null ? Number(d.mega_ball) : nums[5];
      const special_number =
        megaRaw != null && !Number.isNaN(megaRaw) ? [megaRaw] : null;
      return toCardRow({
        game_name: "Mega Millions",
        draw_date: d.draw_date,
        numbers: main,
        special_number,
        multiplier: d.multiplier ? `${d.multiplier}x` : null,
        jackpot: i === 0 ? jackpotAmount : null,
        official_url: "https://www.masslottery.com/tools/past-results/mega-millions",
      });
    })
    .filter(Boolean);
}

// --- Jackpot estimates (for Powerball / Mega Millions cards)
async function fetchJackpots() {
  let powerball = null;
  let megaMillions = null;
  try {
    const pbRes = await fetch(
      "https://www.powerball.com/api/v1/estimates/powerball?_format=json",
      { headers: browserHeaders }
    );
    if (pbRes.ok) {
      const pbData = await pbRes.json();
      const rawAmount =
        pbData?.data?.[0]?.field_prize_amount_text ??
        pbData?.data?.[0]?.field_prize_amount ??
        null;
      powerball = normalizeJackpot(rawAmount);
    }
  } catch (_) {}
  try {
    const mmRes = await fetch(
      "https://www.megamillions.com/cmspages/utilservice.asmx/GetLatestDrawData",
      { headers: browserHeaders }
    );
    if (mmRes.ok) {
      const mmText = await mmRes.text();
      const jpMatch = mmText.match(
        /Jackpot["\s:>]*\$?([\d,]+(?:\s*(?:Million|Billion))?)/i
      );
      if (jpMatch) megaMillions = normalizeJackpot(jpMatch[1]);
    }
  } catch (_) {}
  return { powerball, megaMillions };
}

// --- Mass Lottery REST: generic game
async function fetchMassGame(game, gameName, urlSlug, limit = 3) {
  const today = new Date().toISOString().split("T")[0];
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
  const res = await fetch(
    `https://www.masslottery.com/rest/${game}/getDrawsByDateRange?startDate=${weekAgo}&endDate=${today}`,
    { headers: browserHeaders }
  );
  if (!res.ok) return [];
  let data;
  try {
    data = JSON.parse(await res.text());
  } catch {
    return [];
  }
  const draws = getDraws(data).slice(0, limit);
  return draws
    .map((d) => {
      const raw =
        d.winning_numbers ??
        d.winningNumbers ??
        d.numbers ??
        (d.num1 !== undefined ? [d.num1, d.num2, d.num3, d.num4, d.num5] : null);
      const { nums } = normalizeWinningNumbers(raw);
      if (!nums.length) return null;
      let special_number = null;
      if (d.lucky_ball != null) special_number = [Number(d.lucky_ball)];
      if (d.bonus != null && !special_number) special_number = [Number(d.bonus)];
      const drawDate = d.draw_date || d.drawDate || d.date || today;
      return toCardRow({
        game_name: gameName,
        draw_date: typeof drawDate === "string" ? drawDate : new Date(drawDate).toISOString(),
        numbers: nums,
        special_number,
        multiplier: d.multiplier ? String(d.multiplier) : null,
        jackpot: d.jackpot ?? null,
        official_url: `https://www.masslottery.com/tools/past-results/${urlSlug}`,
      });
    })
    .filter(Boolean);
}

// --- Numbers Game (Midday / Evening)
async function fetchNumbersGame() {
  const today = new Date().toISOString().split("T")[0];
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
  for (const slug of ["the-numbers-game", "the-numbers"]) {
    const res = await fetch(
      `https://www.masslottery.com/rest/${slug}/getDrawsByDateRange?startDate=${weekAgo}&endDate=${today}`,
      { headers: browserHeaders }
    );
    if (!res.ok) continue;
    let data;
    try {
      data = JSON.parse(await res.text());
    } catch {
      continue;
    }
    const draws = getDraws(data).slice(0, 6);
    const results = [];
    for (const d of draws) {
      const raw =
        d.winning_numbers ??
        d.winningNumbers ??
        d.numbers ??
        (d.number != null ? String(d.number).split("").map(Number) : null);
      const { nums } = normalizeWinningNumbers(raw);
      if (!nums.length) continue;
      const label = String(d.draw_name || d.drawName || d.draw_time || "").toLowerCase();
      const isEvening =
        label.includes("evening") || label.includes("night") || label.includes("pm");
      results.push(
        toCardRow({
          game_name: isEvening ? "Numbers Evening" : "Numbers Midday",
          draw_date: (d.draw_date || d.drawDate || today).toString().split("T")[0],
          numbers: nums,
          special_number: null,
          multiplier: null,
          jackpot: null,
          official_url: "https://www.masslottery.com/tools/past-results/the-numbers-game",
        })
      );
    }
    if (results.length > 0) return results;
  }
  return [];
}

// --- Mass Cash (Midday / Evening)
async function fetchMassCash() {
  const today = new Date().toISOString().split("T")[0];
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
  const res = await fetch(
    `https://www.masslottery.com/rest/mass-cash/getDrawsByDateRange?startDate=${weekAgo}&endDate=${today}`,
    { headers: browserHeaders }
  );
  if (!res.ok) return [];
  let data;
  try {
    data = JSON.parse(await res.text());
  } catch {
    return [];
  }
  let draws = getDraws(data);
  draws = [...draws].sort((a, b) => {
    const da = a.draw_date || a.drawDate || "";
    const db = b.draw_date || b.drawDate || "";
    return String(db).localeCompare(String(da));
  });
  const results = [];
  for (const d of draws.slice(0, 6)) {
    const raw =
      d.winning_numbers ??
      d.winningNumbers ??
      d.numbers ??
      (d.num1 !== undefined ? [d.num1, d.num2, d.num3, d.num4, d.num5] : null);
    const { nums } = normalizeWinningNumbers(raw);
    if (!nums.length) continue;
    const label = String(d.draw_name || d.drawName || d.draw_time || "").toLowerCase();
    const isEvening =
      label.includes("evening") || label.includes("night") || label.includes("pm");
    results.push(
      toCardRow({
        game_name: isEvening ? "Mass Cash Evening" : "Mass Cash Midday",
        draw_date: (d.draw_date || d.drawDate || today).toString().split("T")[0],
        numbers: nums,
        special_number: null,
        multiplier: null,
        jackpot: null,
        official_url: "https://www.masslottery.com/tools/past-results/mass-cash",
      })
    );
  }
  return results;
}

// --- Keno
async function fetchKeno() {
  const today = new Date().toISOString().split("T")[0];
  const res = await fetch(
    `https://www.masslottery.com/rest/keno/getDrawsByDateRange?startDate=${today}&endDate=${today}`,
    { headers: browserHeaders }
  );
  if (!res.ok) return [];
  let data;
  try {
    data = JSON.parse(await res.text());
  } catch {
    return [];
  }
  const draws = getDraws(data);
  if (draws.length === 0) return [];
  const d = draws[0];
  const raw = d.winning_numbers ?? d.winningNumbers ?? d.numbers;
  const { nums } = normalizeWinningNumbers(raw);
  if (!nums.length) return [];
  const drawDate = (d.draw_date || d.drawDate || today).toString().split("T")[0];
  const drawNum = d.draw_number ?? d.drawNumber ?? d.game_number;
  return [
    toCardRow({
      game_name: "Keno",
      draw_date: drawDate,
      numbers: nums,
      special_number: null,
      multiplier: drawNum != null ? `Draw #${drawNum}` : null,
      jackpot: null,
      official_url: "https://www.masslottery.com/tools/past-results/keno",
    }),
  ];
}

async function main() {
  const outJson = process.argv.includes("--json");
  const writeDb = process.argv.includes("--db");

  if (!outJson && !writeDb) {
    console.error("Fetching from masslottery.com (and NY) → card format (numbers on each card)...\n");
  }

  const jackpots = await fetchJackpots();

  const [
    powerball,
    megaMillions,
    massCash,
    numbersGame,
    megabucks,
    millionaireForLife,
    keno,
  ] = await Promise.all([
    fetchPowerball(jackpots.powerball),
    fetchMegaMillions(jackpots.megaMillions),
    fetchMassCash(),
    fetchNumbersGame(),
    fetchMassGame("megabucks-doubler", "Megabucks", "megabucks", 3),
    fetchMassGame("lucky-for-life", "Millionaire for Life", "millionaire-for-life", 3),
    fetchKeno(),
  ]);

  const all = [
    ...powerball,
    ...megaMillions,
    ...massCash,
    ...numbersGame,
    ...megabucks,
    ...millionaireForLife,
    ...keno,
  ].filter((r) => r && r.numbers && r.numbers.length > 0);

  if (writeDb) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      console.error(
        "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set them or use a .env file."
      );
      process.exit(1);
    }
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseKey);
    const rows = all.map((r) => ({
      game_name: r.game_name,
      draw_date: toDrawDateOnly(r.draw_date),
      numbers: r.numbers,
      special_number: r.special_number,
      multiplier: r.multiplier,
      jackpot: r.jackpot,
      official_url: r.official_url,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase
      .from("lottery_results")
      .upsert(rows, { onConflict: "game_name,draw_date" });
    if (error) {
      console.error("Supabase upsert error:", error);
      process.exit(1);
    }
    console.error(`Upserted ${rows.length} draws to lottery_results. Cards will update.`);
  }

  if (outJson || !writeDb) {
    const payload = outJson ? all : { card_format: all, count: all.length };
    console.log(JSON.stringify(payload, null, outJson ? 2 : 2));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
