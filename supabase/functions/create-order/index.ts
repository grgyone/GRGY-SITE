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

function buildOrderNumber(orderId: number) {
  const date = new Date();
  const year = String(date.getUTCFullYear()).slice(-2);
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `GRGY-${year}${month}${day}-${String(orderId).padStart(4, "0")}`;
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

  const productIds = items.map((item) => item.product_id);
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, title, price_rub")
    .in("id", productIds);

  if (productsError) {
    return jsonResponse({ error: productsError.message }, 500);
  }

  if (!products || products.length !== productIds.length) {
    return jsonResponse({ error: "Some products were not found" }, 400);
  }

  const productMap = new Map(
    products.map((product) => [Number(product.id), product]),
  );

  const total = items.reduce((sum, item) => {
    const product = productMap.get(item.product_id);
    const price = Number(product?.price_rub) || 0;
    return sum + price * item.quantity;
  }, 0);

  const { data: insertedOrder, error: orderError } = await supabase
    .from("orders")
    .insert({
      email,
      contact,
      comment,
      total_rub: total,
      status: "new",
    })
    .select("id")
    .single();

  if (orderError || !insertedOrder) {
    return jsonResponse({ error: orderError?.message || "Order insert failed" }, 500);
  }

  const orderId = Number(insertedOrder.id);
  const orderNumber = buildOrderNumber(orderId);

  const { error: orderNumberError } = await supabase
    .from("orders")
    .update({ order_number: orderNumber })
    .eq("id", orderId);

  if (orderNumberError) {
    return jsonResponse({ error: orderNumberError.message }, 500);
  }

  const orderItems = items.map((item) => {
    const product = productMap.get(item.product_id);
    const unitPrice = Number(product?.price_rub) || 0;

    return {
      order_id: orderId,
      product_id: item.product_id,
      product_name: String(product?.name || product?.title || "Untitled"),
      quantity: item.quantity,
      unit_price_rub: unitPrice,
      line_total_rub: unitPrice * item.quantity,
    };
  });

  const { error: orderItemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (orderItemsError) {
    return jsonResponse({ error: orderItemsError.message }, 500);
  }

  return jsonResponse({
    success: true,
    order_number: orderNumber,
    id: orderId,
  });
});
