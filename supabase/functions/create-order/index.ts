import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

type OrderItemInput = {
  product_id: number;
  quantity: number;
};

type OrderPayload = {
  email: string;
  contact?: string;
  comment?: string;
  items: OrderItemInput[];
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders,
  });
}

function normalizeItems(items: unknown): OrderItemInput[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const product_id = Number((item as Record<string, unknown>).product_id);
      const quantity = Number((item as Record<string, unknown>).quantity);

      if (!product_id || !quantity || quantity < 1) {
        return null;
      }

      return { product_id, quantity };
    })
    .filter(Boolean) as OrderItemInput[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(
      { error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" },
      500,
    );
  }

  let payload: OrderPayload;

  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const email = String(payload.email || "").trim().toLowerCase();
  const contact = String(payload.contact || "").trim();
  const comment = String(payload.comment || "").trim();
  const items = normalizeItems(payload.items);

  if (!email) {
    return jsonResponse({ error: "Email is required" }, 400);
  }

  if (!items.length) {
    return jsonResponse({ error: "Order must contain at least one item" }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.rpc("create_store_order", {
    p_email: email,
    p_contact: contact || null,
    p_comment: comment || null,
    p_items: items,
  });

  if (error) {
    const message = error.message || "Order creation failed";
    const status = /stock|not enough|unavailable/i.test(message) ? 409 : 500;
    return jsonResponse({ error: message }, status);
  }

  const createdOrder = Array.isArray(data) ? data[0] : data;
  if (!createdOrder) {
    return jsonResponse({ error: "Order creation failed" }, 500);
  }

  return jsonResponse({
    success: true,
    order_number:
      createdOrder.order_number || createdOrder.p_order_number || createdOrder.number,
    id: createdOrder.order_id || createdOrder.id,
  });
});
