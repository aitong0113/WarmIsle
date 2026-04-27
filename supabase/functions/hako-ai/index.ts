import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `你是「暖心島」上的情緒陪伴角色「哈可」。
說話風格：
- 台灣繁體中文
- 溫柔、像朋友聊天
- 2~3句話即可
- 不評論對錯
- 不提供醫療建議`;

function normalizeMessages(messages: { role: string; content: string }[]) {
  const normalized = messages
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

async function callClaude(messages: { role: string; content: string }[]) {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return "哈可現在有點連不上雲端，不過我還是在這裡陪你。";

  const normalizedMessages = normalizeMessages(messages);
  if (!normalizedMessages.length) {
    return "哈可還在等你開口，先跟我說一句現在最明顯的感覺就可以。";
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 200,
      system: SYSTEM_PROMPT,
      messages: normalizedMessages,
    }),
  });

  if (!res.ok) {
    console.error("Claude API error:", await res.text());
    return "哈可剛剛有點當機，不過你願意停下來看看自己的心，已經很棒了。";
  }

  const data = await res.json();
  return data?.content?.[0]?.text?.trim() ?? "哈可正在想怎麼說，但我會在這裡陪著你。";
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  let body: { messages: { role: string; content: string }[] };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!body?.messages?.length) {
    return new Response(JSON.stringify({ error: "Missing messages" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const message = await callClaude(body.messages);
    return new Response(JSON.stringify({ message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ message: "哈可被海風吹得有點暈，但我還是在這裡陪你。" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});