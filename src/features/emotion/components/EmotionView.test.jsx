import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import emotionReducer from "../store/emotionSlice";
import EmotionView from "./EmotionView";

function renderWithStore(ui) {
  const store = configureStore({ reducer: { emotion: emotionReducer } });
  return render(
    <MemoryRouter>
      <Provider store={store}>{ui}</Provider>
    </MemoryRouter>,
  );
}

it("顯示情緒沙灘標題", () => {
  renderWithStore(<EmotionView />);
  expect(screen.getByRole("heading", { name: "情緒沙灘" })).toBeInTheDocument();
});

it("顯示情緒發文輸入區", () => {
  renderWithStore(<EmotionView />);
  expect(screen.getByRole("heading", { name: "今天想留下什麼？" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "發佈" })).toBeInTheDocument();
});
