const DIARY_STORAGE_KEY = "warmisle_diary_entries";

/**
 * 從 localStorage 載入日記列表。
 * @returns {Array<{date: string, content: string}>}
 */
export function loadDiaryEntries() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DIARY_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (error) {
    console.warn("Failed to load diary entries from localStorage", error);
    return [];
  }
}

/**
 * 將日記列表存入 localStorage。
 * @param {Array<{date: string, content: string}>} entries
 */
export function saveDiaryEntries(entries) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.warn("Failed to save diary entries to localStorage", error);
  }
}
