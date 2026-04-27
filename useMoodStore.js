import { create } from "zustand";

export const useMoodStore = create((set) => ({
  mood: "neutral",

  setMood: (mood) => set({ mood }),
}));