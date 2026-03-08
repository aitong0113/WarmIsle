import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import diaryReducer from "../store/diarySlice";
import DiaryView from "./DiaryView";

function renderWithStore(ui) {
  const store = configureStore({ reducer: { diary: diaryReducer } });
  return render(<Provider store={store}>{ui}</Provider>);
}

it("可以輸入並保存一則日記", () => {
  renderWithStore(<DiaryView />);

  const textarea = screen.getByPlaceholderText("今天想寫點什麼...");
  fireEvent.change(textarea, { target: { value: "今天有點累" } });

  const saveButton = screen.getByRole("button", { name: "保存" });
  fireEvent.click(saveButton);

  expect(screen.getByText(/今天有點累/)).toBeInTheDocument();
});
