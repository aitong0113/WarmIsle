# 測試與 Storybook 結構規劃

> 目前專案尚未安裝測試框架與 Storybook，這份文件是未來要加時可以直接照著做的指南。

## 測試建議：Vitest + Testing Library

- 套件建議（devDependencies）：
  - `vitest`
  - `@testing-library/react`
  - `@testing-library/jest-dom`
  - `jsdom`
- 指令示意：
  - `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`
  - 在 package.json scripts 加：
    - `"test": "vitest"`

### 目錄結構建議

- 單元測試：與 component 同層：
  - `src/features/island/components/IslandWorld.test.jsx`
  - `src/features/emotion/components/EmotionView.test.jsx`
  - `src/features/diary/components/DiaryView.test.jsx`
- store 測試：放在各 feature 的 store 旁邊：
  - `src/features/emotion/store/emotionSlice.test.js`
  - `src/features/diary/store/diarySlice.test.js`

### 簡單測試範例（示意）

```jsx
// src/features/emotion/components/EmotionView.test.jsx
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import emotionReducer from "../store/emotionSlice";
import EmotionView from "./EmotionView";

function renderWithStore(ui) {
  const store = configureStore({ reducer: { emotion: emotionReducer } });
  return render(<Provider store={store}>{ui}</Provider>);
}

test("顯示預設今日情緒文字", () => {
  renderWithStore(<EmotionView />);
  expect(screen.getByText(/今天情緒：/)).toBeInTheDocument();
});
```

> 實際要啟用時，再依上面安裝套件與新增 test 檔案即可。

## Storybook 建議：@storybook/react-vite

- 套件建議（devDependencies）：
  - `@storybook/react-vite`
- 指令示意：
  - `npx storybook@latest init --builder vite`

### 目錄結構建議

- Story 檔案靠近 component：
  - `src/features/island/components/IslandWorld.stories.jsx`
  - `src/features/emotion/components/EmotionView.stories.jsx`
  - `src/features/diary/components/DiaryView.stories.jsx`

### 簡單 Story 範例（示意）

```jsx
// src/features/island/components/IslandWorld.stories.jsx
import IslandWorld from "./IslandWorld";

export default {
  title: "Features/Island/IslandWorld",
  component: IslandWorld,
};

export const Default = () => <IslandWorld />;
```

> 之後如果你想真的把 Storybook 跑起來，再照官方指引搭配這個結構即可。
