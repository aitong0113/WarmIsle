import { todayLocalDate } from "../utils/date";

const EMOTION_STORAGE_KEY = "warmisle_emotion_state_v1";

/**
 * @typedef {{ todayEmotion: string | null, emotionLogs: Array<{ emotion: string | null, date: string, note?: string }> }} EmotionState
 */

/**
 * 從 localStorage 載入情緒狀態。
 * @returns {EmotionState}
 */
export function loadEmotionState() {
  if (typeof window === "undefined") {
    return { todayEmotion: null, emotionLogs: [] };
  }

  try {
    const raw = window.localStorage.getItem(EMOTION_STORAGE_KEY);
    if (!raw) return { todayEmotion: null, emotionLogs: [] };

    const parsed = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("todayEmotion" in parsed) ||
      !("emotionLogs" in parsed)
    ) {
      return { todayEmotion: null, emotionLogs: [] };
    }

    const state = {
      todayEmotion: parsed.todayEmotion ?? null,
      emotionLogs: Array.isArray(parsed.emotionLogs) ? parsed.emotionLogs : []
    };

    // 若最後一筆心情紀錄不是「今天」，就自動清空 todayEmotion（但保留歷史紀錄）
    const today = todayLocalDate();
    const latestLogDate = state.emotionLogs.reduce((latest, log) => {
      if (!log?.date) return latest;
      if (!latest) return log.date;
      return log.date > latest ? log.date : latest;
    }, null);

    if (!latestLogDate || latestLogDate !== today) {
      state.todayEmotion = null;
    }

    return state;
  } catch (error) {
    console.warn("Failed to load emotion state from localStorage", error);
    return { todayEmotion: null, emotionLogs: [] };
  }
}

/**
 * 將情緒狀態存入 localStorage。
 * @param {EmotionState} state
 */
export function saveEmotionState(state) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(EMOTION_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Failed to save emotion state to localStorage", error);
  }
}
