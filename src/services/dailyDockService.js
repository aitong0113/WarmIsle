const DAILY_DOCK_KEY = "warmisle_daily_dock_v1";

/**
 * @typedef {{ date: string, timestamp: string }} DailyDockEntry
 */

/**
 * 從 localStorage 載入每日靠岸紀錄。
 * @returns {DailyDockEntry[]}
 */
export function loadDockHistory() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DAILY_DOCK_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (error) {
    console.warn("Failed to load daily dock history from localStorage", error);
    return [];
  }
}

/**
 * 將每日靠岸紀錄存入 localStorage。
 * @param {DailyDockEntry[]} history
 */
export function saveDockHistory(history) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DAILY_DOCK_KEY, JSON.stringify(history));
  } catch (error) {
    console.warn("Failed to save daily dock history to localStorage", error);
  }
}
