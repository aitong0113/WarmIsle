const EMOTION_STORAGE_KEY = "warmisle_emotion_state_v1";

/**
 * @typedef {{ todayEmotion: string | null, emotionLogs: Array<{ emotion: string, date: string }> }} EmotionState
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

    return {
      todayEmotion: parsed.todayEmotion ?? null,
      emotionLogs: Array.isArray(parsed.emotionLogs) ? parsed.emotionLogs : []
    };
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
