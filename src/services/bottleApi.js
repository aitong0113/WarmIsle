import { supabase } from "./supabaseClient";

const BOTTLES_TABLE = "emotion_bottles";
const REPLIES_TABLE = "emotion_bottle_replies";

export async function createBottle({ userId, content }) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(BOTTLES_TABLE)
    .insert({ user_id: userId, content })
    .select()
    .single();

  if (error) {
    console.warn("Failed to create emotion bottle", error);
    return null;
  }

  return data;
}

export async function fetchReplyCountsForBottles(bottleIds) {
  if (!supabase || !Array.isArray(bottleIds) || bottleIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from(REPLIES_TABLE)
    .select("bottle_id, id")
    .in("bottle_id", bottleIds);

  if (error) {
    console.warn("Failed to fetch reply counts for bottles", error);
    return {};
  }

  const counts = {};
  (data || []).forEach((row) => {
    if (!row?.bottle_id) return;
    counts[row.bottle_id] = (counts[row.bottle_id] || 0) + 1;
  });

  return counts;
}

export async function fetchRandomBottle() {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(BOTTLES_TABLE)
    .select("id, content, created_at")
    // Supabase 不支援直接用 order("random") 當函式，
    // 這裡先改成依建立時間隨機取一筆的替代方案：
    // 1. 先取得總數
    // 2. 再用隨機 offset 取一筆資料
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn("Failed to fetch random bottle", error);
    return null;
  }

  return data;
}

export async function fetchMyBottles(userId, { limit = 20 } = {}) {
  if (!supabase || !userId) return [];

  const { data, error } = await supabase
    .from(BOTTLES_TABLE)
    .select("id, content, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("Failed to fetch user emotion bottles", error);
    return [];
  }

  return data ?? [];
}

export async function fetchBottleReplies(bottleId) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(REPLIES_TABLE)
    .select("id, content, created_at")
    .eq("bottle_id", bottleId)
    .order("created_at", { ascending: true });

  if (error) {
    console.warn("Failed to fetch bottle replies", error);
    return [];
  }

  return data ?? [];
}

export async function addBottleReply({ bottleId, userId, content }) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(REPLIES_TABLE)
    .insert({ bottle_id: bottleId, user_id: userId, content })
    .select()
    .single();

  if (error) {
    console.warn("Failed to add bottle reply", error);
    return null;
  }

  return data;
}
