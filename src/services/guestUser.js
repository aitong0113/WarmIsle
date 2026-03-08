const GUEST_ID_KEY = "warmisle_guest_id";

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // 簡單 fallback：時間戳 + 隨機數
  return `guest_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getGuestUserId() {
  if (typeof window === "undefined") return null;

  const existing = window.localStorage.getItem(GUEST_ID_KEY);
  if (existing) return existing;

  const id = generateId();
  window.localStorage.setItem(GUEST_ID_KEY, id);
  return id;
}
