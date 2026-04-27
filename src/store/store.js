import { configureStore } from "@reduxjs/toolkit";

import emotionReducer from "@/features/emotion/store/emotionSlice";
import hakoReducer from "../features/hako/store/hakoSlice";
import userReducer from "@/features/user/store/userSlice";

export const store = configureStore({
  reducer: {
    emotion: emotionReducer,
    hako: hakoReducer,
    user: userReducer
  }
});