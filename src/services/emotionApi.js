import { supabase } from "./supabaseClient";

const TABLE = "emotion_logs";

export async function fetchEmotionLogs(userId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, emotion, date")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(30);

  if (error) {
    console.warn("Failed to fetch emotion logs", error);
    return [];
  }

  return data ?? [];
}

export async function addEmotionLogApi(userId, { emotion, date }) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ user_id: userId, emotion, date })
    .select()
    .single();

  if (error) {
    console.warn("Failed to insert emotion log", error);
    return null;
  }

  return data;
}
