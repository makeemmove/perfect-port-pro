#!/usr/bin/env node
/**
 * Pull winning numbers from Mass Lottery (and related) results.
 * Uses the same REST APIs as the app's fetch-lottery function.
 * Usage: node scripts/pull-mass-lottery-numbers.mjs
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
    const parts = raw.map((v) => String(v).trim()).filter((v) => v.length > 0);
    return {
      text: parts.join(" ") || null,
      nums: parts.map((p) => Number(p)).filter((n) => !Number.isNaN(n)),
    };
  }
  const str = String(raw).trim();
  if (!str || str === "[object Object]") return { text: null, nums: [] };
  const segments = str.split(/[\s,]+/).filter((s) => s.length > 0);
  return {
    text: segments.join(" ") || null,
    nums: segments.map((s) => Number(s)).filter((n) => !Number.isNaN(n)),
  };
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

async function fetchPowerball() {
  const res = await fetch(
    "https://data.ny.gov/resource/d6yy-54nr.json?$order=draw_date%20DESC&$limit=3",
    { headers: browserHeaders }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data
    .map((d) => {
      const { text, nums } = normalizeWinningNumbers(d.winning_numbers);
      if (!text) return null;
      const powerball = nums.length > 5 ? nums[5] : null;
      return {
        game: "Powerball",
        draw_date: d.draw_date,
        numbers: text,
        special: powerball != null ? `Powerball: ${powerball}` : null,
      };
    })
    .filter(Boolean);
}

async function fetchMegaMillions() {
  const res = await fetch(
    "https://data.ny.gov/resource/5xaw-6ayf.json?$order=draw_date%20DESC&$limit=3",
    { headers: browserHeaders }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data
    .map((d) => {
      const { text, nums } = normalizeWinningNumbers(d.winning_numbers);
      if (!text) return null;
      const mega = d.mega_ball != null ? Number(d.mega_ball) : nums[5];
      return {
        game: "Mega Millions",
        draw_date: d.draw_date,
        numbers: text,
        special: mega != null && !Number.isNaN(mega) ? `Mega Ball: ${mega}` : null,
      };
    })
    .filter(Boolean);
}

async function fetchMassGame(game, gameName, limit = 3) {
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
      const { text } = normalizeWinningNumbers(raw);
      if (!text) return null;
      let special = null;
      if (d.lucky_ball != null) special = `Lucky: ${d.lucky_ball}`;
      if (d.bonus != null && !special) special = `Bonus: ${d.bonus}`;
      const drawDate = d.draw_date || d.drawDate || d.date || today;
      return {
        game: gameName,
        draw_date: typeof drawDate === "string" ? drawDate.split("T")[0] : drawDate,
        numbers: text,
        special,
      };
    })
    .filter(Boolean);
}

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
        (d.number != null ? String(d.number).split("") : null);
      const { text } = normalizeWinningNumbers(raw);
      if (!text) continue;
      const label = String(d.draw_name || d.drawName || d.draw_time || "").toLowerCase();
      const isEvening = label.includes("evening") || label.includes("night") || label.includes("pm");
      results.push({
        game: isEvening ? "Numbers Evening" : "Numbers Midday",
        draw_date: (d.draw_date || d.drawDate || today).toString().split("T")[0],
        numbers: text,
        special: null,
      });
    }
    if (results.length > 0) return results;
  }
  return [];
}

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
    const { text } = normalizeWinningNumbers(raw);
    if (!text) continue;
    const label = String(d.draw_name || d.drawName || d.draw_time || "").toLowerCase();
    const isEvening = label.includes("evening") || label.includes("night") || label.includes("pm");
    results.push({
      game: isEvening ? "Mass Cash Evening" : "Mass Cash Midday",
      draw_date: (d.draw_date || d.drawDate || today).toString().split("T")[0],
      numbers: text,
      special: null,
    });
  }
  return results;
}

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
  const { text } = normalizeWinningNumbers(raw);
  if (!text) return [];
  const drawDate = (d.draw_date || d.drawDate || today).toString().split("T")[0];
  return [{ game: "Keno", draw_date: drawDate, numbers: text, special: null }];
}

// Wheel of Luck - draws every 4 minutes; get recent draws for today
async function fetchWheelOfLuck() {
  const today = new Date().toISOString().split("T")[0];
  const res = await fetch(
    `https://www.masslottery.com/rest/wheel-of-luck/getDrawsByDateRange?startDate=${today}&endDate=${today}`,
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
  const raw =
    d.winning_numbers ?? d.winningNumbers ?? d.numbers ?? d.winning_number;
  const { text } = normalizeWinningNumbers(raw);
  if (!text) return [];
  const drawDate = (d.draw_date || d.drawDate || today).toString().split("T")[0];
  const drawNum = d.draw_number ?? d.drawNumber ?? d.game_number;
  return [
    {
      game: "Wheel of Luck",
      draw_date: drawDate,
      numbers: text,
      special: drawNum != null ? `Draw #${drawNum}` : null,
    },
  ];
}

// All Mass Lottery (and NY) games we fetch
const GAME_FETCHERS = [
  { name: "Powerball", fn: fetchPowerball },
  { name: "Mega Millions", fn: fetchMegaMillions },
  { name: "Mass Cash", fn: fetchMassCash },
  { name: "The Numbers Game", fn: fetchNumbersGame },
  { name: "Megabucks", fn: () => fetchMassGame("megabucks-doubler", "Megabucks", 3) },
  { name: "Millionaire for Life", fn: () => fetchMassGame("lucky-for-life", "Millionaire for Life", 3) },
  { name: "Keno", fn: fetchKeno },
  { name: "Wheel of Luck", fn: fetchWheelOfLuck },
];

async function main() {
  const json = process.argv.includes("--json");
  console.error("Fetching all Mass Lottery (and NY) results...\n");

  const resultsByGame = {};
  for (const { name, fn } of GAME_FETCHERS) {
    try {
      const rows = await fn();
      const list = (rows || []).filter((r) => r && r.numbers && r.numbers.trim());
      if (list.length > 0) resultsByGame[name] = list;
      else console.error(`  ${name}: no draws returned`);
    } catch (err) {
      console.error(`  ${name}: ${err.message}`);
      resultsByGame[name] = [];
    }
  }

  const all = Object.values(resultsByGame).flat();

  if (json) {
    console.log(JSON.stringify(all, null, 2));
    return;
  }

  // Display grouped by game with headers
  const displayOrder = GAME_FETCHERS.map((g) => g.name).filter(
    (name) => resultsByGame[name] && resultsByGame[name].length > 0
  );
  for (const gameName of displayOrder) {
    const rows = resultsByGame[gameName];
    console.log(`\n--- ${gameName} ---`);
    for (const r of rows) {
      const special = r.special ? `  ${r.special}` : "";
      const dateStr = (r.draw_date || "").toString().replace("T00:00:00.000", "").trim();
      console.log(`  ${dateStr}: ${r.numbers}${special}`);
    }
  }
  console.log("");
}


main().catch((err) => {
  console.error(err);
  process.exit(1);
});
