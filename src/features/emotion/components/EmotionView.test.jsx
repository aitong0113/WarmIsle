import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import emotionReducer from "../store/emotionSlice";
import EmotionView from "./EmotionView";

function renderWithStore(ui) {
  const store = configureStore({ reducer: { emotion: emotionReducer } });
  return render(<Provider store={store}>{ui}</Provider>);
}

it("顯示今日情緒文字", () => {
  renderWithStore(<EmotionView />);
  expect(screen.getByText(/今天情緒：/)).toBeInTheDocument();
});

it("點擊按鈕後新增一筆情緒紀錄", async () => {
  renderWithStore(<EmotionView />);

  const tiredButton = await screen.findByRole("button", { name: /很累/ });
  await tiredButton.click();

  const items = screen.getAllByText(/tired/);
  expect(items.length).toBeGreaterThan(0);
});
