import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  visible: false,
  message: null
};

const hakoSlice = createSlice({
  name: "hako",
  initialState,
  reducers: {
    showByEvent(state, action) {
      state.visible = true;
      state.message = action.payload;
    },
    showMessage(state, action) {
      state.visible = true;
      state.message = action.payload;
    },
    hideMessage(state) {
      state.visible = false;
    }
  }
});

export const { showByEvent, showMessage, hideMessage } = hakoSlice.actions;

export default hakoSlice.reducer;
