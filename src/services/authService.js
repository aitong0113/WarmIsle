import { supabase } from "./supabaseClient";

if (!supabase) {
  // 在開發或未設定環境變數時避免直接拋錯
  // 實際呼叫函式時再檢查
}

export async function getCurrentUser() {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.warn("Failed to get current user", error);
      return null;
    }
    return data.user ?? null;
  } catch (err) {
    // Supabase 在沒有 session 時可能會丟出 AuthSessionMissingError
    console.warn("Error calling supabase.auth.getUser", err);
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

  const redirectTo = `${window.location.origin}/`;

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
