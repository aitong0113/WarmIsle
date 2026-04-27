import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "npm:stripe@18.3.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

serve(async (req: Request): Promise<Response> => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  if (!stripeSecretKey || !stripeWebhookSecret || !supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Missing Stripe or Supabase webhook configuration" }, 500);
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return jsonResponse({ error: "Missing stripe-signature header" }, 400);
  }

  const body = await req.text();
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2025-03-31.basil",
  });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      stripeWebhookSecret,
      undefined,
      Stripe.createSubtleCryptoProvider(),
    );
  } catch (error) {
    console.error("Stripe webhook verification failed", error);
    return jsonResponse({ error: "Invalid webhook signature" }, 400);
  }

  if (event.type !== "checkout.session.completed") {
    return jsonResponse({ received: true, ignored: event.type });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session.metadata?.user_id || session.client_reference_id;

  if (!userId) {
    return jsonResponse({ error: "Missing user id in checkout session metadata" }, 400);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);

  try {
    const { data: existingUser, error: existingUserError } = await admin.auth.admin.getUserById(userId);
    if (existingUserError || !existingUser?.user) {
      throw existingUserError || new Error("Authenticated user not found");
    }

    const currentAppMetadata = existingUser.user.app_metadata || {};
    const currentUserMetadata = existingUser.user.user_metadata || {};
    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
    const subscriptionId = typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

    const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
      app_metadata: {
        ...currentAppMetadata,
        subscription_tier: "paid",
        billing_plan: session.metadata?.plan_id || "monthly",
        stripe_customer_id: customerId || currentAppMetadata.stripe_customer_id,
        stripe_subscription_id: subscriptionId || currentAppMetadata.stripe_subscription_id,
      },
      user_metadata: {
        ...currentUserMetadata,
        subscription_tier: "paid",
      },
    });

    if (updateError) {
      throw updateError;
    }

    return jsonResponse({ received: true, updatedUserId: userId });
  } catch (error) {
    console.error("Stripe webhook user update failed", error);
    return jsonResponse({ error: "Failed to update user subscription" }, 500);
  }
});