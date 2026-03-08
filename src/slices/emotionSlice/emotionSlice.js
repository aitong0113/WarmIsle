import { createSlice } from "@reduxjs/toolkit";

const emotionSlice = createSlice({
  name: "emotion",

  initialState: {
    todayEmotion: null,
    emotionLogs: []
  },

  reducers: {

    setEmotion: (state, action) => {
      state.todayEmotion = action.payload;
    },

    addEmotionLog: (state, action) => {
      state.emotionLogs.push(action.payload);
    }

  }
});

export const { setEmotion, addEmotionLog } = emotionSlice.actions;

export default emotionSlice.reducer;