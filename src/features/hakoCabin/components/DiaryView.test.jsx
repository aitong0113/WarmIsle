import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { vi } from "vitest";
import HakoChatView from "./HakoChatView";

let conversationCounter = 0;

vi.mock("../../../services/hakoChatApi", () => ({
  createHakoConversation: vi.fn((messages = []) => ({
    id: `conversation-${++conversationCounter}`,
    title: messages[0]?.content || "新的對話",
    createdAt: "2026-04-26T10:00:00.000Z",
    updatedAt: "2026-04-26T10:00:00.000Z",
    summary: messages.at(-1)?.content || "",
    messages,
  })),
  deleteHakoConversation: vi.fn().mockResolvedValue(true),
  deleteGuestHakoConversation: vi.fn().mockReturnValue([]),
  insertHakoChatMessage: vi.fn().mockResolvedValue(null),
  loadHakoChatConversations: vi.fn().mockResolvedValue({ mode: "guest", conversations: [] }),
  saveGuestHakoConversation: vi.fn(),
}));

vi.mock("../../../services/hakoAiClient", () => ({
  fetchHakoAiReply: vi.fn().mockResolvedValue("我在這裡陪你。"),
}));

const {
  createHakoConversation,
  deleteHakoConversation,
  deleteGuestHakoConversation,
  insertHakoChatMessage,
  loadHakoChatConversations,
  saveGuestHakoConversation,
} = await import("../../../services/hakoChatApi");

beforeEach(() => {
  conversationCounter = 0;
  vi.clearAllMocks();
  loadHakoChatConversations.mockResolvedValue({ mode: "guest", conversations: [] });
  deleteHakoConversation.mockResolvedValue(true);
  deleteGuestHakoConversation.mockReturnValue([]);
});

it("會先載入既有對話紀錄", async () => {
  loadHakoChatConversations.mockResolvedValueOnce({
    mode: "authenticated",
    conversations: [
      {
        id: "conversation-history",
        title: "昨天有點睡不好",
        summary: "辛苦了，我在這裡。",
        createdAt: "2026-04-26T10:00:00.000Z",
        updatedAt: "2026-04-26T10:01:00.000Z",
        messages: [
          {
            role: "user",
            content: "昨天有點睡不好",
            createdAt: "2026-04-26T10:00:00.000Z",
          },
          {
            role: "assistant",
            content: "辛苦了，我在這裡。",
            createdAt: "2026-04-26T10:01:00.000Z",
          },
        ],
      },
    ],
  });

  render(<HakoChatView />);

  const conversationList = await screen.findByLabelText("對話列表");
  expect(within(conversationList).getByText("昨天有點睡不好")).toBeInTheDocument();
  expect(within(conversationList).getByText("辛苦了，我在這裡。")).toBeInTheDocument();
  expect(within(conversationList).getByText("2 則")).toBeInTheDocument();
  expect(within(conversationList).getByText("今天")).toBeInTheDocument();
});

it("搜尋可以支援日期與角色，並可清除", async () => {
  loadHakoChatConversations.mockResolvedValueOnce({
    mode: "authenticated",
    conversations: [
      {
        id: "conversation-search-role",
        title: "最近有點累",
        summary: "我在這裡陪你。",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [
          {
            role: "user",
            content: "最近有點累",
            createdAt: new Date().toISOString(),
          },
          {
            role: "assistant",
            content: "我在這裡陪你。",
            createdAt: new Date().toISOString(),
          },
        ],
      },
    ],
  });

  render(<HakoChatView />);

  const searchbox = await screen.findByRole("searchbox", { name: "搜尋對話" });
  fireEvent.change(searchbox, { target: { value: "assistant" } });
  expect(within(screen.getByLabelText("對話列表")).getByText("最近有點累")).toBeInTheDocument();

  fireEvent.change(searchbox, { target: { value: "今天" } });
  expect(within(screen.getByLabelText("對話列表")).getByText("最近有點累")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "清除搜尋" }));
  expect(searchbox).toHaveValue("");
});

it("可以開啟新對話並送出訊息", async () => {
  render(<HakoChatView />);

  await waitFor(() => {
    expect(loadHakoChatConversations).toHaveBeenCalled();
  });

  const newConversationButton = screen.getByRole("button", { name: "新對話" });
  fireEvent.click(newConversationButton);

  expect(createHakoConversation).toHaveBeenCalled();
  expect(saveGuestHakoConversation).toHaveBeenCalled();

  const textarea = screen.getByPlaceholderText("跟哈可說說，今天發生了什麼...");
  fireEvent.change(textarea, { target: { value: "今天有點累" } });

  const sendButton = screen.getByRole("button", { name: "送出" });
  fireEvent.click(sendButton);

  await waitFor(() => {
    expect(within(screen.getByLabelText("對話列表")).getByText("我在這裡陪你。")).toBeInTheDocument();
    expect(insertHakoChatMessage).toHaveBeenNthCalledWith(1, "今天有點累", "user", "conversation-2");
    expect(insertHakoChatMessage).toHaveBeenNthCalledWith(2, "我在這裡陪你。", "assistant", "conversation-2");
  });
});

it("訪客可以刪除自己的對話", async () => {
  loadHakoChatConversations.mockResolvedValueOnce({
    mode: "guest",
    conversations: [
      {
        id: "conversation-delete-me",
        title: "刪掉我",
        summary: "嗨，我是哈可 🌿 今天想跟我說說什麼嗎？",
        createdAt: "2026-04-26T10:00:00.000Z",
        updatedAt: "2026-04-26T10:01:00.000Z",
        messages: [
          {
            role: "assistant",
            content: "嗨，我是哈可 🌿 今天想跟我說說什麼嗎？",
            createdAt: "2026-04-26T10:00:00.000Z",
          },
        ],
      },
    ],
  });
  deleteGuestHakoConversation.mockReturnValueOnce([]);

  render(<HakoChatView />);

  expect(await screen.findByRole("button", { name: /刪除 刪掉我/ })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /刪除 刪掉我/ }));

  expect(deleteGuestHakoConversation).toHaveBeenCalledWith("conversation-delete-me");
  expect(createHakoConversation).toHaveBeenCalled();
});

it("登入使用者可以刪除遠端對話", async () => {
  loadHakoChatConversations.mockResolvedValueOnce({
    mode: "authenticated",
    conversations: [
      {
        id: "conversation-remote-delete",
        title: "保留還是刪掉？",
        summary: "最後一則遠端摘要",
        createdAt: "2026-04-26T10:00:00.000Z",
        updatedAt: "2026-04-26T10:01:00.000Z",
        messages: [
          {
            role: "user",
            content: "保留還是刪掉？",
            createdAt: "2026-04-26T10:00:00.000Z",
          },
        ],
      },
    ],
  });

  render(<HakoChatView />);

  fireEvent.click(await screen.findByRole("button", { name: /刪除 保留還是刪掉？/ }));

  await waitFor(() => {
    expect(deleteHakoConversation).toHaveBeenCalledWith("conversation-remote-delete");
  });
});
