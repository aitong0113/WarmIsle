const ENTRY_SESSION_KEY = "warmisle-entry-seen";

export function hasSeenEntry() {
  if (typeof window === "undefined") return true;
  return window.sessionStorage.getItem(ENTRY_SESSION_KEY) === "1";
}

export function markEntrySeen() {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(ENTRY_SESSION_KEY, "1");
}