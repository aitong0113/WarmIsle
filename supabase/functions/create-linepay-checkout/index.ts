import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const siteUrl = Deno.env.get("PUBLIC_SITE_URL") || "http://localhost:5173";
const linePayBaseUrl = Deno.env.get("LINEPAY_API_BASE") || "https://sandbox-api-pay.line.me";
const channelId = Deno.env.get("LINEPAY_CHANNEL_ID") || "";
const channelSecret = Deno.env.get("LINEPAY_CHANNEL_SECRET") || "";

const PLAN_DETAILS = {
  monthly: { amount: 220, label: "Warm Isle Plus 月訂閱" },
  yearly: { amount: 2280, label: "Warm Isle Plus 年訂閱" },
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

async function signRequest(path: string, body: string, nonce: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(channelSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signatureBase = channelSecret + path + body + nonce;
  const signed = await crypto.subtle.sign("HMAC", key, encoder.encode(signatureBase));
  const bytes = new Uint8Array(signed);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  if (!supabaseUrl || !supabaseAnonKey || !channelId || !channelSecret) {
    return jsonResponse({ error: "Missing LINE Pay or Supabase configuration" }, 500);
  }

  let payload: { planId?: "monthly" | "yearly"; lockedFeature?: string; returnTo?: string };
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON payload" }, 400);
  }

  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    return jsonResponse({ error: "Missing access token" }, 401);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return jsonResponse({ error: "Unable to resolve authenticated user" }, 401);
  }

  const planId = payload?.planId === "yearly" ? "yearly" : "monthly";
  const plan = PLAN_DETAILS[planId];
  const lockedFeature = payload?.lockedFeature || "暖心島付費內容";
  const returnTo = payload?.returnTo || "/hako-cabin/premium";
  const orderId = `warmisle-${planId}-${crypto.randomUUID()}`;

  const confirmUrl = new URL("/upgrade", siteUrl);
  confirmUrl.searchParams.set("checkout", "success");
  confirmUrl.searchParams.set("provider", "linepay");
  confirmUrl.searchParams.set("plan", planId);
  confirmUrl.searchParams.set("lockedFeature", lockedFeature);
  confirmUrl.searchParams.set("returnTo", returnTo);

  const cancelUrl = new URL("/upgrade", siteUrl);
  cancelUrl.searchParams.set("checkout", "canceled");
  cancelUrl.searchParams.set("provider", "linepay");
  cancelUrl.searchParams.set("plan", planId);
  cancelUrl.searchParams.set("lockedFeature", lockedFeature);
  cancelUrl.searchParams.set("returnTo", returnTo);

  const requestBody = {
    amount: plan.amount,
    currency: "TWD",
    orderId,
    packages: [
      {
        id: orderId,
        amount: plan.amount,
        name: plan.label,
        products: [
          {
            id: planId,
            name: plan.label,
            quantity: 1,
            price: plan.amount,
          },
        ],
      },
    ],
    redirectUrls: {
      confirmUrl: confirmUrl.toString(),
      cancelUrl: cancelUrl.toString(),
    },
    options: {
      display: {
        locale: "zh_TW",
      },
    },
  };

  const path = "/v3/payments/request";
  const body = JSON.stringify(requestBody);
  const nonce = crypto.randomUUID();
  const signature = await signRequest(path, body, nonce);

  try {
    const response = await fetch(`${linePayBaseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-LINE-ChannelId": channelId,
        "X-LINE-Authorization-Nonce": nonce,
        "X-LINE-Authorization": signature,
      },
      body,
    });

    const data = await response.json();
    if (!response.ok || data?.returnCode !== "0000") {
      console.error("LINE Pay request failed", data);
      return jsonResponse({ error: "Failed to create LINE Pay request", details: data }, 500);
    }

    return jsonResponse({
      url: data?.info?.paymentUrl?.web || "",
      orderId,
      transactionId: data?.info?.transactionId || null,
    });
  } catch (error) {
    console.error("Unexpected LINE Pay request error", error);
    return jsonResponse({ error: "Unexpected LINE Pay request error" }, 500);
  }
});
