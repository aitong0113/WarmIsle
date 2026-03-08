import { createSlice } from "@reduxjs/toolkit";
import { loadDiaryEntries, saveDiaryEntries } from "../../../services/diaryService";

const initialEntries = loadDiaryEntries();

const diarySlice = createSlice({
  name: "diary",
  initialState: {
    entries: initialEntries,
  },
  reducers: {
    addDiary: (state, action) => {
      state.entries.push(action.payload);
      saveDiaryEntries(state.entries);
    },
  },
});

export const { addDiary } = diarySlice.actions;

export default diarySlice.reducer;
