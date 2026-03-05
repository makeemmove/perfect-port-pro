import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MBTA_API_KEY = "fe3a3623d0524813a4c47c16828bf84a";
const MBTA_BASE = "https://api-v3.mbta.com";

// Map display station names to MBTA stop IDs
const STOP_ID_MAP: Record<string, string> = {
  "Fall River Depot": "place-FR-0064",
  "Freetown": "place-FR-0137",
  "East Taunton": "place-PB-0356",
  "Bridgewater": "place-PB-0281",
  "Campello": "place-PB-0245",
  "Brockton": "place-PB-0212",
  "Holbrook/Randolph": "place-PB-0158",
  "Braintree": "place-PB-0116",
  "Quincy Center": "place-qnctr",
  "JFK/UMass": "place-jfk",
  "South Station": "place-sstat",
};

interface PredictionResult {
  scheduledTime: string | null;
  predictedTime: string | null;
  delayMinutes: number;
  status: "On Time" | "CANCELLED" | string;
  direction: string;
  tripId: string;
}

function fmtTime(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York",
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const stationName = url.searchParams.get("stop") || "Fall River Depot";
    const directionId = url.searchParams.get("direction_id"); // 0=outbound, 1=inbound

    const stopId = STOP_ID_MAP[stationName];
    if (!stopId) {
      return new Response(
        JSON.stringify({ error: `Unknown station: ${stationName}`, predictions: [] }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let apiUrl = `${MBTA_BASE}/predictions?filter[route]=CR-Fall+River&filter[stop]=${stopId}&include=schedule&sort=departure_time`;
    if (directionId !== null && directionId !== undefined) {
      apiUrl += `&filter[direction_id]=${directionId}`;
    }

    const response = await fetch(apiUrl, {
      headers: { "x-api-key": MBTA_API_KEY },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("MBTA API error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "MBTA API error", predictions: [] }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const predictions = data.data || [];
    const included = data.included || [];

    // Build schedule lookup by trip ID
    const scheduleMap = new Map<string, any>();
    for (const inc of included) {
      if (inc.type === "schedule") {
        const tripId = inc.relationships?.trip?.data?.id;
        if (tripId) {
          scheduleMap.set(tripId, inc);
        }
      }
    }

    const results: PredictionResult[] = [];

    for (const pred of predictions) {
      const attrs = pred.attributes;
      const tripId = pred.relationships?.trip?.data?.id || "";
      const dirId = attrs.direction_id;

      // Check for cancellation
      if (attrs.schedule_relationship === "CANCELLED") {
        const schedule = scheduleMap.get(tripId);
        results.push({
          scheduledTime: fmtTime(schedule?.attributes?.departure_time || attrs.departure_time),
          predictedTime: null,
          delayMinutes: 0,
          status: "CANCELLED",
          direction: dirId === 1 ? "Inbound → South Station" : "Outbound → Fall River",
          tripId,
        });
        continue;
      }

      const predictedDep = attrs.departure_time || attrs.arrival_time;
      const schedule = scheduleMap.get(tripId);
      const scheduledDep = schedule?.attributes?.departure_time || schedule?.attributes?.arrival_time;

      let delayMinutes = 0;
      if (predictedDep && scheduledDep) {
        const diffMs = new Date(predictedDep).getTime() - new Date(scheduledDep).getTime();
        delayMinutes = Math.round(diffMs / 60000);
      }

      let status: string;
      if (delayMinutes > 1) {
        status = `${delayMinutes} min Late`;
      } else {
        status = "On Time";
      }

      results.push({
        scheduledTime: fmtTime(scheduledDep),
        predictedTime: fmtTime(predictedDep),
        delayMinutes,
        status,
        direction: dirId === 1 ? "Inbound → South Station" : "Outbound → Fall River",
        tripId,
      });
    }

    return new Response(JSON.stringify({ predictions: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fetch-mbta error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error", predictions: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
