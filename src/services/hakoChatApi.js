import { supabase } from "./supabaseClient";
import { getGuestUserId } from "./guestUser";

// 哈可聊天訊息表（請在 Supabase 中將 diary_entries 改名為 hako_chat_messages）
const HAKO_CHAT_TABLE = "hako_chat_messages";
const HAKO_GUEST_CONVERSATIONS_KEY = "warmisle.hako.chat.conversations";
const HAKO_HISTORY_LIMIT = 24;
const HAKO_CONVERSATION_LIMIT = 12;
const HAKO_REMOTE_MESSAGE_LIMIT = 240;
const DEFAULT_CONVERSATION_TITLE = "新的對話";
let hasRoleColumn = null;
let hasConversationColumn = null;

function generateConversationId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `hako_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function toTimestamp(value) {
  return value ? new Date(value).getTime() : 0;
}

function sortConversationsByUpdatedAt(conversations) {
  return [...conversations].sort((left, right) => toTimestamp(right.updatedAt) - toTimestamp(left.updatedAt));
}

function createConversationTitle(messages, fallback = DEFAULT_CONVERSATION_TITLE) {
  const source = messages.find((message) => message.role === "user")?.content || messages[0]?.content || "";
  const normalized = source.replace(/\s+/g, " ").trim();

  if (!normalized) return fallback;
  return normalized.length > 20 ? `${normalized.slice(0, 20)}...` : normalized;
}

function normalizeHakoMessage(message) {
  if (!message?.content || typeof message.content !== "string") {
    return null;
  }

  return {
    role: message.role === "assistant" ? "assistant" : "user",
    content: message.content,
    createdAt: message.createdAt || message.created_at || new Date().toISOString(),
  };
}

function normalizeHakoConversation(conversation) {
  const messages = Array.isArray(conversation?.messages)
    ? conversation.messages.map((message) => normalizeHakoMessage(message)).filter(Boolean)
    : [];

  const createdAt = conversation?.createdAt || messages[0]?.createdAt || new Date().toISOString();
  const updatedAt = conversation?.updatedAt || messages.at(-1)?.createdAt || createdAt;

  return {
    id: conversation?.id || generateConversationId(),
    title: conversation?.title || createConversationTitle(messages),
    createdAt,
    updatedAt,
    summary: conversation?.summary || messages.at(-1)?.content || "",
    messages,
  };
}

function readGuestHakoChatConversations(limit = HAKO_CONVERSATION_LIMIT) {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(HAKO_GUEST_CONVERSATIONS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return sortConversationsByUpdatedAt(parsed.map((conversation) => normalizeHakoConversation(conversation)))
      .slice(-limit);
  } catch (error) {
    console.warn("Failed to read guest hako chat conversations", error);
    return [];
  }
}

function writeGuestHakoChatConversations(conversations) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      HAKO_GUEST_CONVERSATIONS_KEY,
      JSON.stringify(sortConversationsByUpdatedAt(conversations).slice(0, HAKO_CONVERSATION_LIMIT)),
    );
  } catch (error) {
    console.warn("Failed to write guest hako chat conversations", error);
  }
}

function upsertGuestHakoConversation(conversation) {
  const nextConversation = normalizeHakoConversation(conversation);
  const existing = readGuestHakoChatConversations();
  const remaining = existing.filter((item) => item.id !== nextConversation.id);
  writeGuestHakoChatConversations([nextConversation, ...remaining]);
  return nextConversation;
}

function appendGuestHakoChatMessage(content, role, conversationId) {
  const guestId = getGuestUserId();
  const nextMessage = normalizeHakoMessage({
    content,
    role,
    createdAt: new Date().toISOString(),
    guestId,
  });

  if (!nextMessage) return null;

  const conversations = readGuestHakoChatConversations();
  const currentConversation = conversations.find((conversation) => conversation.id === conversationId);

  const nextConversation = normalizeHakoConversation({
    id: conversationId,
    createdAt: currentConversation?.createdAt || nextMessage.createdAt,
    updatedAt: nextMessage.createdAt,
    messages: [...(currentConversation?.messages || []), nextMessage].slice(-HAKO_HISTORY_LIMIT),
  });

  upsertGuestHakoConversation(nextConversation);
  return nextMessage;
}

function buildRemoteConversationRows(rows) {
  const groups = new Map();

  [...rows].reverse().forEach((row) => {
    const message = normalizeHakoMessage(row);
    if (!message) return;

    const conversationId = row.conversation_id || "legacy";
    const existing = groups.get(conversationId) || {
      id: conversationId,
      createdAt: message.createdAt,
      updatedAt: message.createdAt,
      messages: [],
    };

    existing.messages.push(message);
    existing.updatedAt = message.createdAt;
    groups.set(conversationId, existing);
  });

  return sortConversationsByUpdatedAt(
    Array.from(groups.values()).map((conversation) => normalizeHakoConversation(conversation)),
  ).slice(0, HAKO_CONVERSATION_LIMIT);
}

function missingColumn(error, columnName) {
  const details = `${error?.message || ""} ${error?.details || ""} ${error?.hint || ""}`.toLowerCase();
  return details.includes(columnName.toLowerCase());
}

function isMissingColumnError(error, columnName) {
  return (error?.code === "PGRST204" || error?.code === "42703") && missingColumn(error, columnName);
}

async function selectRemoteHakoRows(userId) {
  const runSelect = async () => {
    const selectFields = ["content", "created_at"];
    if (hasRoleColumn !== false) {
      selectFields.push("role");
    }
    if (hasConversationColumn !== false) {
      selectFields.push("conversation_id");
    }

    return supabase
      .from(HAKO_CHAT_TABLE)
      .select(selectFields.join(", "))
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(HAKO_REMOTE_MESSAGE_LIMIT);
  };

  let { data, error } = await runSelect();

  if (isMissingColumnError(error, "conversation_id") && hasConversationColumn !== false) {
    hasConversationColumn = false;
    ({ data, error } = await runSelect());
  }

  if (isMissingColumnError(error, "role") && hasRoleColumn !== false) {
    hasRoleColumn = false;
    ({ data, error } = await runSelect());
  }

  return { data, error };
}

function buildInsertPayload(userId, content, role, conversationId) {
  const payload = {
    user_id: userId,
    content,
  };

  if (hasRoleColumn !== false) {
    payload.role = role;
  }

  if (hasConversationColumn !== false && conversationId) {
    payload.conversation_id = conversationId;
  }

  return payload;
}

async function insertRemoteHakoChatMessage(userId, content, role, conversationId) {
  const runInsert = async () => supabase
    .from(HAKO_CHAT_TABLE)
    .insert(buildInsertPayload(userId, content, role, conversationId));

  let { data, error } = await runInsert();

  if (isMissingColumnError(error, "conversation_id") && hasConversationColumn !== false) {
    hasConversationColumn = false;
    ({ data, error } = await runInsert());
  }

  if (isMissingColumnError(error, "role") && hasRoleColumn !== false) {
    hasRoleColumn = false;
    ({ data, error } = await runInsert());
  }

  return { data, error };
}

async function getAuthenticatedUser() {
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ?? null;
}

export function createHakoConversation(messages = []) {
  return normalizeHakoConversation({
    id: generateConversationId(),
    messages,
  });
}

export function saveGuestHakoConversation(conversation) {
  return upsertGuestHakoConversation(conversation);
}

export function deleteGuestHakoConversation(conversationId) {
  const nextConversations = readGuestHakoChatConversations().filter((conversation) => conversation.id !== conversationId);
  writeGuestHakoChatConversations(nextConversations);
  return nextConversations;
}

export async function deleteHakoConversation(conversationId) {
  if (!conversationId) return false;

  const user = await getAuthenticatedUser();

  if (!user || !supabase) {
    deleteGuestHakoConversation(conversationId);
    return true;
  }

  let query = supabase
    .from(HAKO_CHAT_TABLE)
    .delete()
    .eq("user_id", user.id);

  if (hasConversationColumn !== false) {
    query = query.eq("conversation_id", conversationId);
  } else {
    console.warn("Remote conversation delete requires conversation_id column");
    return false;
  }

  const { error } = await query;

  if (isMissingColumnError(error, "conversation_id")) {
    hasConversationColumn = false;
    console.warn("Remote conversation delete is unavailable until conversation_id exists");
    return false;
  }

  if (error) {
    console.error("Failed to delete hako conversation", error);
    return false;
  }

  return true;
}

export async function loadHakoChatConversations() {
  const user = await getAuthenticatedUser();

  if (!user || !supabase) {
    return {
      mode: "guest",
      conversations: readGuestHakoChatConversations(),
    };
  }

  let { data, error } = await selectRemoteHakoRows(user.id);

  if (isMissingColumnError(error, "conversation_id")) {
    hasConversationColumn = false;

    ({ data, error } = await supabase
      .from(HAKO_CHAT_TABLE)
      .select(hasRoleColumn === false ? "content, created_at" : "content, role, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(HAKO_REMOTE_MESSAGE_LIMIT));
  }

  if (isMissingColumnError(error, "role")) {
    hasRoleColumn = false;

    ({ data, error } = await supabase
      .from(HAKO_CHAT_TABLE)
      .select("content, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(HAKO_REMOTE_MESSAGE_LIMIT));
  }

  if (error) {
    console.error("Failed to load hako chat conversations", error);
    return {
      mode: "authenticated",
      conversations: [],
    };
  }

  return {
    mode: "authenticated",
    conversations: buildRemoteConversationRows(data || []),
  };
}

/**
 * 將一則哈可聊天訊息存入後端。
 * 目前沿用 diary_entries 資料表，未來若要改名只需更新此處常數。
 */
export async function insertHakoChatMessage(content, role = "user", conversationId) {
  const normalizedContent = content?.trim();
  if (!normalizedContent) return null;

  const user = await getAuthenticatedUser();

  if (!user || !supabase) {
    return appendGuestHakoChatMessage(normalizedContent, role, conversationId);
  }

  const { data, error } = await insertRemoteHakoChatMessage(user.id, normalizedContent, role, conversationId);

  if (error) {
    console.error("Failed to insert hako chat message", error);
    return null;
  }

  return data;
}
