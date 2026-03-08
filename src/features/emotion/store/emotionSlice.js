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
      state.emotionLogs.push(action.payload);
      saveEmotionState(state);
    },
  },
});

export const { setEmotion, addEmotionLog } = emotionSlice.actions;

export default emotionSlice.reducer;
