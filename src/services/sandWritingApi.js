import { supabase } from "./supabaseClient";

// 情緒沙灘（寫在沙上的字）主表、回覆表與按讚表
// 請在 Supabase 中將 emotion_bottles 改名為 emotion_sand_writings
// 並將 emotion_bottle_replies 改名為 emotion_sand_replies
// 另外建立 emotion_sand_likes（欄位：id, writing_id, user_id, created_at）
const SAND_WRITINGS_TABLE = "emotion_sand_writings";
const SAND_WRITING_REPLIES_TABLE = "emotion_sand_replies";
const SAND_WRITING_LIKES_TABLE = "emotion_sand_likes";

// 核心概念：寫在沙灘上的字（Sand Writings）

export async function createSandWriting({ userId, content }) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(SAND_WRITINGS_TABLE)
    .insert({ user_id: userId, content })
    .select()
    .single();

  if (error) {
    console.warn("Failed to create sand writing", error);
    return null;
  }

  return data;
}

export async function fetchReplyCountsForSandWritings(writingIds) {
  if (!supabase || !Array.isArray(writingIds) || writingIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from(SAND_WRITING_REPLIES_TABLE)
    .select("writing_id, id")
    .in("writing_id", writingIds);

  if (error) {
    console.warn("Failed to fetch reply counts for sand writings", error);
    return {};
  }

  const counts = {};
  (data || []).forEach((row) => {
    if (!row?.writing_id) return;
    counts[row.writing_id] = (counts[row.writing_id] || 0) + 1;
  });

  return counts;
}

export async function fetchRandomSandWriting(excludeId) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(SAND_WRITINGS_TABLE)
    .select("id, content, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.warn("Failed to fetch random sand writing", error);
    return null;
  }

  const list = data || [];
  if (list.length === 0) return null;

  let candidates = list;
  if (excludeId && list.length > 1) {
    const filtered = list.filter((item) => item.id !== excludeId);
    if (filtered.length > 0) {
      candidates = filtered;
    }
  }

  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
}

export async function fetchMySandWritings(userId, { limit = 20 } = {}) {
  if (!supabase || !userId) return [];

  const { data, error } = await supabase
    .from(SAND_WRITINGS_TABLE)
    .select("id, content, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("Failed to fetch user sand writings", error);
    return [];
  }

  return data ?? [];
}

export async function fetchSandWritingReplies(sandWritingId) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(SAND_WRITING_REPLIES_TABLE)
    .select("id, content, created_at")
    .eq("writing_id", sandWritingId)
    .order("created_at", { ascending: true });

  if (error) {
    console.warn("Failed to fetch sand writing replies", error);
    return [];
  }

  return data ?? [];
}

export async function addSandWritingReply({ sandWritingId, userId, content }) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(SAND_WRITING_REPLIES_TABLE)
    .insert({
      writing_id: sandWritingId,
      user_id: userId,
      content,
    })
    .select()
    .single();

  if (error) {
    console.warn("Failed to add sand writing reply", error);
    return null;
  }

  return data;
}

export async function fetchRecentSandWritings({ limit = 20 } = {}) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(SAND_WRITINGS_TABLE)
    .select("id, content, created_at, user_id")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("Failed to fetch recent sand writings", error);
    return [];
  }

  return data ?? [];
}

// 取得一批貼文的按讚數與當前使用者是否按過讚
export async function fetchSandWritingLikesMeta(writingIds, userId) {
  if (!supabase || !Array.isArray(writingIds) || writingIds.length === 0) {
    return { counts: {}, likedIds: [] };
  }

  const { data, error } = await supabase
    .from(SAND_WRITING_LIKES_TABLE)
    .select("writing_id, user_id")
    .in("writing_id", writingIds);

  if (error) {
    console.warn("Failed to fetch likes for sand writings", error);
    return { counts: {}, likedIds: [] };
  }

  const counts = {};
  const likedSet = new Set();

  (data || []).forEach((row) => {
    const id = row?.writing_id;
    if (!id) return;
    counts[id] = (counts[id] || 0) + 1;
    if (userId && row.user_id === userId) {
      likedSet.add(id);
    }
  });

  return { counts, likedIds: Array.from(likedSet) };
}

// 切換某使用者對單一貼文的按讚狀態
export async function toggleSandWritingLike({ writingId, userId }) {
  if (!supabase || !writingId || !userId) return { liked: false };

  const { data, error } = await supabase
    .from(SAND_WRITING_LIKES_TABLE)
    .select("id")
    .eq("writing_id", writingId)
    .eq("user_id", userId)
    .limit(1);

  if (error) {
    console.warn("Failed to check existing like", error);
    return { liked: false };
  }

  const existing = (data || [])[0];

  if (existing) {
    const { error: deleteError } = await supabase
      .from(SAND_WRITING_LIKES_TABLE)
      .delete()
      .eq("id", existing.id);

    if (deleteError) {
      console.warn("Failed to remove like", deleteError);
    }

    return { liked: false };
  }

  const { error: insertError } = await supabase
    .from(SAND_WRITING_LIKES_TABLE)
    .insert({ writing_id: writingId, user_id: userId });

  if (insertError) {
    console.warn("Failed to add like", insertError);
    return { liked: false };
  }

  return { liked: true };
}

