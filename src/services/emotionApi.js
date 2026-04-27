import { supabase } from "./supabaseClient";

const TABLE = "emotion_logs";

export async function fetchEmotionLogs(userId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, emotion, date, note")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(30);

  if (error) {
    console.warn("Failed to fetch emotion logs", error);
    return [];
  }

  return data ?? [];
}

export async function addEmotionLogApi(userId, { emotion, date, note }) {
  if (!supabase) return null;

  const payload = { user_id: userId, emotion, date };
  if (note !== undefined) {
    payload.note = note;
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.warn("Failed to insert emotion log", error);
    return null;
  }

  return data;
}

export async function syncEmotionLogApi(userId, { emotion, date, note }) {
  if (!supabase) return null;

  const { data: existing, error: findError } = await supabase
    .from(TABLE)
    .select("id")
    .eq("user_id", userId)
    .eq("date", date)
    .limit(1)
    .maybeSingle();

  if (findError) {
    console.warn("Failed to find existing emotion log", findError);
    return null;
  }

  if (existing?.id) {
    const payload = {};
    if (emotion !== undefined) {
      payload.emotion = emotion;
    }
    if (note !== undefined) {
      payload.note = note;
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update(payload)
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      console.warn("Failed to update emotion log", error);
      return null;
    }

    return data;
  }

  return addEmotionLogApi(userId, { emotion, date, note });
}
