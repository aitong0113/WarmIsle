import { supabase } from "./supabaseClient";

const SUBSCRIPTION_OVERRIDE_KEY = "warmisle.subscription.override";

const ADMIN_EMAILS = (import.meta.env.VITE_LIGHTHOUSE_ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const PAID_EMAILS = (import.meta.env.VITE_PAID_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export function isAdminUser(user) {
  if (!user) return false;

  const email = user.email?.toLowerCase() || "";
  const appRole = user.app_metadata?.role;
  const userRole = user.user_metadata?.role;
  const adminFlag = user.app_metadata?.is_admin ?? user.user_metadata?.is_admin;

  return adminFlag === true || appRole === "admin" || userRole === "admin" || ADMIN_EMAILS.includes(email);
}

export function toUserState(user) {
  const metaName = user?.user_metadata?.name;
  const displayName = metaName && metaName !== "Abbie" ? metaName : "Abbie";
  const email = user?.email?.toLowerCase() || "";
  const subscriptionTierMeta =
    user?.app_metadata?.subscription_tier ||
    user?.user_metadata?.subscription_tier ||
    user?.app_metadata?.plan ||
    user?.user_metadata?.plan ||
    null;
  const normalizedTier = typeof subscriptionTierMeta === "string"
    ? subscriptionTierMeta.trim().toLowerCase()
    : null;
  const storedOverride = getStoredSubscriptionTier(email);
  const effectiveTier = storedOverride || normalizedTier;
  const hasPaidAccess = effectiveTier === "paid" || effectiveTier === "pro" || effectiveTier === "premium" || PAID_EMAILS.includes(email);
  const subscriptionTier = hasPaidAccess ? "paid" : "free";

  return {
    id: user?.id ?? null,
    name: displayName,
    email: user?.email ?? "",
    isAuthenticated: !!user,
    isAdmin: isAdminUser(user),
    subscriptionTier,
    hasPaidAccess,
    authReady: true,
  };
}

export function getStoredSubscriptionTier(email) {
  if (typeof window === "undefined" || !email) return null;

  try {
    const raw = window.localStorage.getItem(SUBSCRIPTION_OVERRIDE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.[email] || null;
  } catch (error) {
    console.warn("Failed to read subscription override", error);
    return null;
  }
}

export function setStoredSubscriptionTier(email, tier) {
  if (typeof window === "undefined" || !email || !tier) return;

  try {
    const raw = window.localStorage.getItem(SUBSCRIPTION_OVERRIDE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[email.toLowerCase()] = tier;
    window.localStorage.setItem(SUBSCRIPTION_OVERRIDE_KEY, JSON.stringify(parsed));
  } catch (error) {
    console.warn("Failed to write subscription override", error);
  }
}

if (!supabase) {
  // 在開發或未設定環境變數時避免直接拋錯
  // 實際呼叫函式時再檢查
}

export async function getCurrentUser() {
  if (!supabase) return null;

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.user ?? null;
  } catch (err) {
    console.warn("Error reading current session", err);
    return null;
  }
}

// 讓元件可以訂閱 Supabase 登入狀態變化
// callback 會收到目前的 user（或未登入時為 null）
export function onAuthStateChange(callback) {
  if (!supabase) return () => {};

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });

  return () => {
    subscription.unsubscribe();
  };
}

export async function updateUserProfile(updates) {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const { data, error } = await supabase.auth.updateUser({
    data: updates,
  });

  if (error) throw error;
  return data.user;
}

export async function signInWithEmail(email) {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const redirectTo = `${window.location.origin}/login`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
    },
  });

  if (error) throw error;
}

export async function signUpWithEmailPassword(email, password) {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signInWithPassword(email, password) {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const redirectTo = `${window.location.origin}/intro`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.warn("Failed to sign out", error);
  }
}
