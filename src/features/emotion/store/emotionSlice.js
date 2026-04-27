import { createSlice } from "@reduxjs/toolkit";

import { loadEmotionState, saveEmotionState } from "../../../services/emotionService";

const initialState = loadEmotionState();

const emotionSlice = createSlice({
  name: "emotion",
  initialState,

  reducers: {
    setEmotion: (state, action) => {
      state.todayEmotion = action.payload;
      saveEmotionState(state);
    },

    addEmotionLog: (state, action) => {
      const entry = action.payload;

      if (!entry || !entry.date) return;

      if (!Array.isArray(state.emotionLogs)) {
        state.emotionLogs = [];
      }

      const existing = state.emotionLogs.find((log) => log.date === entry.date);

      if (existing) {
        existing.emotion = entry.emotion;
      } else {
        state.emotionLogs.push(entry);
      }

      saveEmotionState(state);
    },
    setEmotionNote: (state, action) => {
      const { date, note } = action.payload || {};
      if (!date) return;

      if (!Array.isArray(state.emotionLogs)) {
        state.emotionLogs = [];
      }

      const existing = state.emotionLogs.find((log) => log.date === date);

      if (existing) {
        existing.note = note;
      } else {
        state.emotionLogs.push({ date, emotion: state.todayEmotion || null, note });
      }

      saveEmotionState(state);
    },
  },
});

export const { setEmotion, addEmotionLog, setEmotionNote } = emotionSlice.actions;

export default emotionSlice.reducer;
