import { configureStore } from "@reduxjs/toolkit";

import emotionReducer from "@/features/emotion/store/emotionSlice";
import diaryReducer from "@/features/hakoCabin/store/diarySlice";
import dailyDockReducer from "@/features/harbor/store/dailyDockSlice";
import hakoReducer from "../features/hako/store/hakoSlice";
import userReducer from "@/features/user/store/userSlice";

export const store = configureStore({
  reducer: {
    emotion: emotionReducer,
    diary: diaryReducer,
    dailyDock: dailyDockReducer,
    hako: hakoReducer,
    user: userReducer
  }
});