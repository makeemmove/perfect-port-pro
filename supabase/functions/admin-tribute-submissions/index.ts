import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-key",
};

function jsonResponse(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function unauthorized() {
  return jsonResponse({ error: "Unauthorized" }, 401);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const adminSecret = Deno.env.get("ADMIN_SECRET");
  if (adminSecret) {
    const key = req.headers.get("x-admin-key");
    if (key !== adminSecret) {
      return unauthorized();
    }
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("tribute_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return jsonResponse({ submissions: data ?? [] });
    }

    if (req.method === "PATCH") {
      const body = await req.json().catch(() => ({}));
      const id = body?.id;
      if (!id || typeof id !== "string") {
        return jsonResponse({ error: "Missing or invalid id" }, 400);
      }
      const { error } = await supabase
        .from("tribute_submissions")
        .update({ status: "approved", updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      return jsonResponse({ ok: true });
    }

    if (req.method === "DELETE") {
      const body = await req.json().catch(() => ({}));
      const id = body?.id;
      if (!id || typeof id !== "string") {
        return jsonResponse({ error: "Missing or invalid id" }, 400);
      }
      const { error } = await supabase
        .from("tribute_submissions")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return jsonResponse({ ok: true });
    }

    return jsonResponse({ error: "Method not allowed" }, 405);
  } catch (err) {
    console.error("admin-tribute-submissions error:", err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : String(err) },
      500
    );
  }
});
