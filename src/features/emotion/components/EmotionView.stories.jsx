import React from "react";
import EmotionView from "./EmotionView";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import emotionReducer from "../store/emotionSlice";

const store = configureStore({ reducer: { emotion: emotionReducer } });

export default {
  title: "Features/Emotion/EmotionView",
  component: EmotionView,
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
