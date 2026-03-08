import { createSlice } from "@reduxjs/toolkit";

import { loadDockHistory, saveDockHistory } from "../../../services/dailyDockService";

const initialHistory = loadDockHistory();

function daysBetween(dateA, dateB) {
  const a = new Date(dateA);
  const b = new Date(dateB);
  const diff = a.getTime() - b.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

function computeStreaks(history) {
  if (!Array.isArray(history) || history.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const uniqueDates = Array.from(new Set(history.map((e) => e.date))).sort().reverse();

  let currentStreak = 0;
  if (uniqueDates.length > 0) {
    currentStreak = 1;
    for (let i = 1; i < uniqueDates.length; i += 1) {
      if (daysBetween(uniqueDates[i - 1], uniqueDates[i]) === 1) {
        currentStreak += 1;
      } else {
        break;
      }
    }
  }

  let longestStreak = uniqueDates.length > 0 ? 1 : 0;
  let run = 1;
  for (let i = 1; i < uniqueDates.length; i += 1) {
    if (daysBetween(uniqueDates[i - 1], uniqueDates[i]) === 1) {
      run += 1;
      if (run > longestStreak) longestStreak = run;
    } else {
      run = 1;
    }
  }

  return { currentStreak, longestStreak };
}

const initialState = (() => {
  const base = {
    lastDockDate: initialHistory[0]?.date || null,
    dockHistory: initialHistory
  };

  const { currentStreak, longestStreak } = computeStreaks(initialHistory);

  return {
    ...base,
    currentStreak,
    longestStreak
  };
})();

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

const dailyDockSlice = createSlice({
  name: "dailyDock",
  initialState,
  reducers: {
    dockToday(state) {
      const today = getTodayDateString();
      if (state.lastDockDate === today) return;

      const entry = {
        date: today,
        timestamp: new Date().toISOString()
      };

      state.lastDockDate = today;
      state.dockHistory = [entry, ...(state.dockHistory || [])];

      const { currentStreak, longestStreak } = computeStreaks(state.dockHistory);
      state.currentStreak = currentStreak;
      state.longestStreak = longestStreak;

      saveDockHistory(state.dockHistory);
    }
  }
});

export const { dockToday } = dailyDockSlice.actions;

export default dailyDockSlice.reducer;
