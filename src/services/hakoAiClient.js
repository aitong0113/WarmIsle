import { supabase } from "./supabaseClient";

function normalizeHakoMessages(messages) {
  const normalized = (messages || [])
    .filter((message) => typeof message?.content === "string" && message.content.trim())
    .map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: message.content.trim(),
    }));

  while (normalized.length > 0 && normalized[0].role !== "user") {
    normalized.shift();
  }

  return normalized.slice(-12);
}

export async function fetchHakoAiReply(messages) {
  if (!supabase) {
    console.warn("Supabase client not initialized");
    return null;
  }

  const { data: { session } } = await supabase.auth.getSession();
  const normalizedMessages = normalizeHakoMessages(messages);

  if (!normalizedMessages.length) {
    return "哈可還在等你開口，先跟我說一句現在最明顯的感覺就可以。";
  }

  try {
    const invokeOptions = {
      body: { messages: normalizedMessages },
    };

    if (session?.access_token) {
      invokeOptions.headers = {
        Authorization: `Bearer ${session.access_token}`,
      };
    }

    const { data, error } = await supabase.functions.invoke("hako-ai", invokeOptions);

    if (error) {
      console.warn("Hako AI invoke error", error);
      // 即使 Edge Function 回傳 401/5xx，也給一段溫柔的 fallback 文案
      return "哈可現在有點連不上雲端，不過我還是在這裡陪你。";
    }

    return typeof data?.message === "string"
      ? data.message
      : "哈可正在想怎麼說，但我會在這裡陪著你。";
  } catch (err) {
    console.warn("Failed to fetch Hako AI reply", err);
    return "哈可剛剛有點當機，不過你願意停下來看看自己的心，已經很棒了。";
  }
}