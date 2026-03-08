import { supabase } from "./supabaseClient";

const TABLE = "diary_entries";

export async function addDiaryEntryApi(userId, { content, tags, date }) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ user_id: userId, content, tags, date })
    .select()
    .single();

  if (error) {
    console.warn("Failed to insert diary entry", error);
    return null;
  }

  return data;
}
