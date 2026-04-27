import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "npm:stripe@18.3.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const publicSiteUrl = Deno.env.get("PUBLIC_SITE_URL") || "http://localhost:5173";

const planPriceMap = {
  monthly: Deno.env.get("STRIPE_PRICE_ID_MONTHLY") || "",
  yearly: Deno.env.get("STRIPE_PRICE_ID_YEARLY") || "",
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

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  if (!stripeSecretKey || !supabaseUrl || !supabaseAnonKey) {
    return jsonResponse({ error: "Missing Stripe or Supabase configuration" }, 500);
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
  const priceId = planPriceMap[planId];

  if (!priceId) {
    return jsonResponse({ error: `Missing Stripe price id for plan ${planId}` }, 500);
  }

  const lockedFeature = payload?.lockedFeature || "暖心島付費內容";
  const returnTo = payload?.returnTo || "/hako-cabin/premium";

  const successUrl = new URL("/upgrade", publicSiteUrl);
  successUrl.searchParams.set("checkout", "success");
  successUrl.searchParams.set("provider", "stripe");
  successUrl.searchParams.set("plan", planId);
  successUrl.searchParams.set("lockedFeature", lockedFeature);
  successUrl.searchParams.set("returnTo", returnTo);

  const cancelUrl = new URL("/upgrade", publicSiteUrl);
  cancelUrl.searchParams.set("checkout", "canceled");
  cancelUrl.searchParams.set("provider", "stripe");
  cancelUrl.searchParams.set("plan", planId);
  cancelUrl.searchParams.set("lockedFeature", lockedFeature);
  cancelUrl.searchParams.set("returnTo", returnTo);

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2025-03-31.basil",
  });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      client_reference_id: user.id,
      customer_email: user.email,
      locale: "zh-TW",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        user_id: user.id,
        plan_id: planId,
        locked_feature: lockedFeature,
        return_to: returnTo,
      },
      success_url: successUrl.toString(),
      cancel_url: cancelUrl.toString(),
    });

    return jsonResponse({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Failed to create Stripe checkout session", error);
    return jsonResponse({ error: "Failed to create checkout session" }, 500);
  }
});