// Supabase Edge Function: hako-ai
// 用來支援「AI 哈可」的回覆邏輯
// 與前端 src/services/hakoAiClient.js 的協定：
//   - 請求：POST JSON { type: string, payload?: object }
//   - 回應：JSON { message: string }

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders: HeadersInit = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type HakoEvent = {
  type: string;
  // 根據事件可能帶的資料（例如 emotion、日記預覽文字等）
  payload?: Record<string, unknown>;
};

function buildUserPrompt(event: HakoEvent): string {
  const { type, payload } = event;

  switch (type) {
    case "emotion_selected": {
      const emotion = typeof payload?.emotion === "string" ? payload.emotion : "未知情緒";
      return `使用者剛在「情緒沙灘」選擇了情緒：「${emotion}」。請用一段 2~3 句、溫柔、具同理心的中文對話，幫他覺察與陪伴。`;
    }
    case "diary_saved": {
      const preview = typeof payload?.preview === "string" ? payload.preview : "（日記內容未知）";
      return `使用者剛在「哈可小屋」寫完一篇日記。以下是前半段內容預覽：\n${preview}\n\n請用 2~3 句溫暖的中文回應，幫他整理情緒，但不要重複貼出日記內容。`;
    }
    case "docked_today": {
      return "使用者今天在『每日靠岸』完成了一次打卡。請以 2~3 句中文，肯定他的穩定靠岸與照顧自己的努力，語氣輕鬆溫柔。";
    }
    case "open_resource": {
      return "使用者打開了『心理燈塔』資源頁，正在尋找心理支持或自我照顧的方式。請用 2~3 句中文鼓勵他善用資源，並提醒他慢慢來就好。";
    }
    case "welcome_random": {
      const name = typeof payload?.name === "string" && payload.name.trim().length > 0 ? payload.name.trim() : null;
      if (name) {
        return `使用者剛完成暖心島的新手導覽，第一次正式踏上島嶼，名字（或暱稱）是「${name}」。請用 2~3 句中文，用『哈可』的身份，溫柔歡迎他來到這裡，並在開頭直接叫出他的名字（例如：「${name}，歡迎來到暖心島！」），再簡單提醒可以從『每日靠岸』開始。`;
      }

      return "使用者剛完成暖心島的新手導覽，第一次正式踏上島嶼。請用 2~3 句中文，用『哈可』的身份，溫柔歡迎他來到這裡，並簡單提醒可以從『每日靠岸』開始。";
    }
    default: {
      return `這是一個來自暖心島的事件：${type}。請以 2~3 句溫柔的中文，扮演情緒陪伴者「哈可」，給出鼓勵與陪伴。`;
    }
  }
}

const SYSTEM_PROMPT = `你是「暖心島」上的情緒陪伴角色「哈可」，是一個住在木箱裡的小小守護者。

你的說話風格：
- 使用自然、口語化的台灣繁體中文。
- 句子短一點、溫柔一點，像在和朋友聊天。
- 具同理心，不急著給建議，而是先理解和陪伴。
- 不評論對錯，也不做臨床診斷。

你的限制：
- 不提供專業醫療或緊急處置建議。
- 若感覺使用者可能有自傷或他傷風險，只能溫柔提醒他尋求身旁信任的大人或專業協助。

回覆格式：
- 只輸出最終要顯示給使用者的文字，不要加標題、不要加項目符號。`;

async function callOpenAI(prompt: string): Promise<string> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");

  if (!apiKey) {
    console.error("OPENAI_API_KEY is not set in Supabase Edge Function env.");
    return "哈可現在暫時連不上雲端腦袋，不過我還是在這裡，陪你一起慢慢來。";
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini", // 可以依照你的帳號可用模型調整
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: 220,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    console.error("OpenAI API error", response.status, await response.text());
    return "哈可有點當機，不過我看見你已經很努力在面對自己的心了，謝謝你願意來到這裡。";
  }

  const data = await response.json();
  const message = data?.choices?.[0]?.message?.content;
  if (typeof message === "string" && message.trim().length > 0) {
    return message.trim();
  }

  return "我還在學習怎麼把心裡的感覺說清楚，但我知道，你願意停下來看見自己的心，已經很了不起了。";
}

serve(async (req: Request): Promise<Response> => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: {
        ...corsHeaders,
      },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: {
        ...corsHeaders,
      },
    });
  }

  let event: HakoEvent;

  try {
    event = (await req.json()) as HakoEvent;
  } catch (_error) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }

  if (!event?.type || typeof event.type !== "string") {
    return new Response(JSON.stringify({ error: "Missing or invalid 'type'" }), {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }

  try {
    const userPrompt = buildUserPrompt(event);
    const message = await callOpenAI(userPrompt);

    return new Response(JSON.stringify({ message }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Unexpected error in hako-ai function", error);

    return new Response(
      JSON.stringify({
        message:
          "哈可剛剛被海風吹得有點暈，不太能好好說話。不過你願意來到這裡、看一看自己的心，已經很值得被好好抱抱了。",
      }),
      {
        status: 200, // 回傳 200 讓前端可以照常顯示這段 fallback 訊息
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
