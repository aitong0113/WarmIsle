import { supabase } from "./supabaseClient";

export async function createStripeCheckoutSession({ planId, lockedFeature, returnTo }) {
  if (!supabase) {
    throw new Error("Supabase client is not initialized");
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const invokeOptions = {
    body: {
      planId,
      lockedFeature,
      returnTo,
    },
  };

  if (session?.access_token) {
    invokeOptions.headers = {
      Authorization: `Bearer ${session.access_token}`,
    };
  }

  const { data, error } = await supabase.functions.invoke("create-stripe-checkout", invokeOptions);

  if (error) {
    throw error;
  }

  return data;
}

export async function createLinePayCheckout({ planId, lockedFeature, returnTo }) {
  if (!supabase) {
    throw new Error("Supabase client is not initialized");
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const invokeOptions = {
    body: {
      planId,
      lockedFeature,
      returnTo,
    },
  };

  if (session?.access_token) {
    invokeOptions.headers = {
      Authorization: `Bearer ${session.access_token}`,
    };
  }

  const { data, error } = await supabase.functions.invoke("create-linepay-checkout", invokeOptions);

  if (error) {
    throw error;
  }

  return data;
}