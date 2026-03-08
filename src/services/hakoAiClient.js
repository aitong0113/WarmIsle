import { supabase } from "./supabaseClient";

const HAKO_AI_ENDPOINT = import.meta.env.VITE_HAKO_AI_ENDPOINT;

/**
 * 對後端的「AI 哈可」端點發送事件，期待回傳 { message: string }。
 *
 * 優先透過 supabase.functions.invoke 呼叫 Edge Function，
 * 讓 Supabase 幫忙處理 CORS / Auth；若 supabase client 不存在，
 * 才退回使用環境變數中的直連 HTTP 端點。
 */
export async function fetchHakoAiReply(event) {
  // 1. 優先使用 supabase-js 內建的 Edge Function 呼叫
  if (supabase) {
    try {
      const { data, error } = await supabase.functions.invoke("hako-ai", {
        body: event,
      });

      if (error) {
        console.warn("Failed to invoke hako-ai function", error);
        // 繼續嘗試 fallback，而不是直接中斷
      } else if (data && typeof data.message === "string") {
        return data.message;
      }
    } catch (error) {
      console.warn("Error while invoking hako-ai via supabase", error);
      // 繼續嘗試 fallback
    }
  }

  // 2. 若 supabase client 不可用或失敗，再嘗試直連 Edge Function URL
  if (!HAKO_AI_ENDPOINT) return null;

  try {
    const res = await fetch(HAKO_AI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });

    if (!res.ok) {
      console.warn("Hako AI endpoint returned non-ok status", res.status);
      return null;
    }

    const data = await res.json();
    if (data && typeof data.message === "string") {
      return data.message;
    }

    return null;
  } catch (error) {
    console.warn("Failed to fetch Hako AI reply via direct endpoint", error);
    return null;
  }
}
