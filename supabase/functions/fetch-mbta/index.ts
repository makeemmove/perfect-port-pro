import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MBTA_API_KEY = "fe3a3623d0524813a4c47c16828bf84a";
const MBTA_BASE = "https://api-v3.mbta.com";
const ROUTE_ID = "CR-NewBedford";

const STOP_ID_MAP: Record<string, string> = {
  "Fall River Depot": "place-FRS-0109",
  "Freetown": "place-FRS-0054",
  "East Taunton": "place-NBM-0374",
  "Middleborough": "place-MBS-0350",
  "Bridgewater": "place-MM-0277",
  "Campello": "place-MM-0219",
  "Brockton": "place-MM-0200",
  "Montello": "place-MM-0186",
  "Holbrook/Randolph": "place-MM-0150",
  "Braintree": "place-brntn",
  "Quincy Center": "place-qnctr",
  "JFK/UMass": "place-jfk",
  "South Station": "place-sstat",
};

const STOP_NAME_MAP: Record<string, string> = {};
for (const [name, id] of Object.entries(STOP_ID_MAP)) {
  STOP_NAME_MAP[id] = name;
}

interface StopPrediction {
  stopId: string;
  stopName: string;
  scheduledTime: string | null;
  predictedTime: string | null;
  delayMinutes: number;
  status: string;
  direction: string;
  tripId: string;
}

interface PredictionResult {
  scheduledTime: string | null;
  predictedTime: string | null;
  delayMinutes: number;
  status: string;
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
    const mode = url.searchParams.get("mode"); // "route" for all-stops view
    const stationName = url.searchParams.get("stop") || "Fall River Depot";
    const directionId = url.searchParams.get("direction_id");

    // MODE: route — fetch predictions for ALL stops on route (for per-stop display)
    if (mode === "route") {
      const predUrl = `${MBTA_BASE}/predictions?filter[route]=${ROUTE_ID}&include=stop,schedule&sort=departure_time&api_key=${MBTA_API_KEY}${directionId ? `&filter[direction_id]=${directionId}` : ""}`;
      
      const predResponse = await fetch(predUrl);
      const stopPredictions: StopPrediction[] = [];

      if (predResponse.ok) {
        const data = await predResponse.json();
        const predictions = data.data || [];
        const included = data.included || [];

        // Build maps for stops and schedules from included
        const stopMap = new Map<string, string>();
        const scheduleMap = new Map<string, any>();
        for (const inc of included) {
          if (inc.type === "stop") {
            stopMap.set(inc.id, inc.attributes?.name || inc.id);
          }
          if (inc.type === "schedule") {
            const tripId = inc.relationships?.trip?.data?.id;
            const stopId = inc.relationships?.stop?.data?.id;
            if (tripId && stopId) {
              scheduleMap.set(`${tripId}-${stopId}`, inc);
            }
          }
        }

        for (const pred of predictions) {
          const attrs = pred.attributes;
          const tripId = pred.relationships?.trip?.data?.id || "";
          const stopId = pred.relationships?.stop?.data?.id || "";
          const dirId = attrs.direction_id;

          // Get stop name from included data or our map
          const stopName = STOP_NAME_MAP[stopId] || stopMap.get(stopId) || stopId;

          if (attrs.schedule_relationship === "CANCELLED") {
            const schedKey = `${tripId}-${stopId}`;
            const schedule = scheduleMap.get(schedKey);
            stopPredictions.push({
              stopId,
              stopName,
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
          const schedKey = `${tripId}-${stopId}`;
          const schedule = scheduleMap.get(schedKey);
          const scheduledDep = schedule?.attributes?.departure_time || schedule?.attributes?.arrival_time;

          let delayMinutes = 0;
          if (predictedDep && scheduledDep) {
            const diffMs = new Date(predictedDep).getTime() - new Date(scheduledDep).getTime();
            delayMinutes = Math.round(diffMs / 60000);
          }

          let status: string;
          if (delayMinutes > 1) status = `${delayMinutes} min late`;
          else if (delayMinutes < -1) status = `${Math.abs(delayMinutes)} min early`;
          else status = "On Time";

          stopPredictions.push({
            stopId,
            stopName,
            scheduledTime: fmtTime(scheduledDep || predictedDep),
            predictedTime: fmtTime(predictedDep),
            delayMinutes,
            status,
            direction: dirId === 1 ? "Inbound → South Station" : "Outbound → Fall River",
            tripId,
          });
        }
      }

      // If no predictions, try schedule fallback for all stops
      if (stopPredictions.length === 0) {
        const today = new Date().toISOString().split("T")[0];
        let schedUrl = `${MBTA_BASE}/schedules?filter[route]=${ROUTE_ID}&filter[date]=${today}&include=stop&sort=departure_time&api_key=${MBTA_API_KEY}`;
        if (directionId) schedUrl += `&filter[direction_id]=${directionId}`;

        const schedResponse = await fetch(schedUrl);
        if (schedResponse.ok) {
          const schedData = await schedResponse.json();
          const schedules = schedData.data || [];
          const includedStops = schedData.included || [];
          const now = new Date();

          const stopNames = new Map<string, string>();
          for (const inc of includedStops) {
            if (inc.type === "stop") stopNames.set(inc.id, inc.attributes?.name || inc.id);
          }

          for (const sched of schedules) {
            const attrs = sched.attributes;
            const depTime = attrs.departure_time || attrs.arrival_time;
            if (!depTime || new Date(depTime) < now) continue;

            const stopId = sched.relationships?.stop?.data?.id || "";
            const stopName = STOP_NAME_MAP[stopId] || stopNames.get(stopId) || stopId;
            const dirId = attrs.direction_id;
            const tripId = sched.relationships?.trip?.data?.id || "";

            stopPredictions.push({
              stopId,
              stopName,
              scheduledTime: fmtTime(depTime),
              predictedTime: null,
              delayMinutes: 0,
              status: "Scheduled",
              direction: dirId === 1 ? "Inbound → South Station" : "Outbound → Fall River",
              tripId,
            });
          }
        }
      }

      return new Response(JSON.stringify({ stopPredictions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // LEGACY MODE: single-stop predictions (unchanged behavior)
    const stopId = STOP_ID_MAP[stationName];
    if (!stopId) {
      return new Response(
        JSON.stringify({ error: `Unknown station: ${stationName}`, predictions: [] }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let predUrl = `${MBTA_BASE}/predictions?filter[route]=${ROUTE_ID}&filter[stop]=${stopId}&include=schedule&sort=departure_time`;
    if (directionId !== null && directionId !== undefined) {
      predUrl += `&filter[direction_id]=${directionId}`;
    }

    const today = new Date().toISOString().split("T")[0];
    let schedUrl = `${MBTA_BASE}/schedules?filter[route]=${ROUTE_ID}&filter[stop]=${stopId}&filter[date]=${today}&sort=departure_time`;
    if (directionId !== null && directionId !== undefined) {
      schedUrl += `&filter[direction_id]=${directionId}`;
    }

    const [predResponse, schedResponse] = await Promise.all([
      fetch(predUrl, { headers: { "x-api-key": MBTA_API_KEY } }),
      fetch(schedUrl, { headers: { "x-api-key": MBTA_API_KEY } }),
    ]);

    const results: PredictionResult[] = [];

    if (predResponse.ok) {
      const data = await predResponse.json();
      const predictions = data.data || [];
      const included = data.included || [];

      const scheduleMap = new Map<string, any>();
      for (const inc of included) {
        if (inc.type === "schedule") {
          const tripId = inc.relationships?.trip?.data?.id;
          if (tripId) scheduleMap.set(tripId, inc);
        }
      }

      for (const pred of predictions) {
        const attrs = pred.attributes;
        const tripId = pred.relationships?.trip?.data?.id || "";
        const dirId = attrs.direction_id;

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
        if (delayMinutes > 1) status = `${delayMinutes} min Late`;
        else if (delayMinutes < -1) status = `${Math.abs(delayMinutes)} min Early`;
        else status = "On Time";

        results.push({
          scheduledTime: fmtTime(scheduledDep || predictedDep),
          predictedTime: fmtTime(predictedDep),
          delayMinutes,
          status,
          direction: dirId === 1 ? "Inbound → South Station" : "Outbound → Fall River",
          tripId,
        });
      }
    }

    if (results.length === 0 && schedResponse.ok) {
      const schedData = await schedResponse.json();
      const schedules = schedData.data || [];
      const now = new Date();

      for (const sched of schedules) {
        const attrs = sched.attributes;
        const depTime = attrs.departure_time || attrs.arrival_time;
        if (!depTime) continue;
        if (new Date(depTime) < now) continue;

        const dirId = attrs.direction_id;
        const tripId = sched.relationships?.trip?.data?.id || "";

        results.push({
          scheduledTime: fmtTime(depTime),
          predictedTime: null,
          delayMinutes: 0,
          status: "Scheduled",
          direction: dirId === 1 ? "Inbound → South Station" : "Outbound → Fall River",
          tripId,
        });
      }
    }

    return new Response(JSON.stringify({ predictions: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fetch-mbta error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error", predictions: [], stopPredictions: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
