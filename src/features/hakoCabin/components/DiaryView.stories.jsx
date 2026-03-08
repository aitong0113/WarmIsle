import React from "react";
import DiaryView from "./DiaryView";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import diaryReducer from "../store/diarySlice";

const store = configureStore({ reducer: { diary: diaryReducer } });

export default {
  title: "Features/Diary/DiaryView",
  component: DiaryView,
};

export const Default = {
  decorators: [
    (Story) => (
      <Provider store={store}>
        <Story />
      </Provider>
    ),
  ],
};
