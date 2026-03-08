import { describe, it, expect, beforeEach, vi } from "vitest";

import reducer, { dockToday } from "./dailyDockSlice";

function createState(overrides) {
  return {
    lastDockDate: null,
    dockHistory: [],
    currentStreak: 0,
    longestStreak: 0,
    ...overrides
  };
}

describe("dailyDockSlice", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("應該在第一次靠岸時建立紀錄並把當天算成 1 天連續", () => {
    vi.setSystemTime(new Date("2026-03-01T10:00:00Z"));

    const state = reducer(undefined, { type: "@@INIT" });
    const next = reducer(state, dockToday());

    expect(next.lastDockDate).toBe("2026-03-01");
    expect(next.dockHistory.length).toBe(1);
    expect(next.currentStreak).toBe(1);
    expect(next.longestStreak).toBe(1);
  });

  it("連續兩天靠岸時，應更新 currentStreak 與 longestStreak 為 2", () => {
    vi.setSystemTime(new Date("2026-03-01T10:00:00Z"));
    const firstDay = reducer(createState(), dockToday());

    vi.setSystemTime(new Date("2026-03-02T10:00:00Z"));
    const secondDay = reducer(firstDay, dockToday());

    expect(secondDay.lastDockDate).toBe("2026-03-02");
    expect(secondDay.currentStreak).toBe(2);
    expect(secondDay.longestStreak).toBe(2);
  });

  it("中斷後再靠岸，currentStreak 會重算但 longestStreak 保留最高紀錄", () => {
    vi.setSystemTime(new Date("2026-03-01T10:00:00Z"));
    let state = reducer(createState(), dockToday());

    vi.setSystemTime(new Date("2026-03-02T10:00:00Z"));
    state = reducer(state, dockToday());

    vi.setSystemTime(new Date("2026-03-04T10:00:00Z"));
    const afterBreak = reducer(state, dockToday());

    expect(afterBreak.lastDockDate).toBe("2026-03-04");
    expect(afterBreak.currentStreak).toBe(1);
    expect(afterBreak.longestStreak).toBe(2);
  });
});
