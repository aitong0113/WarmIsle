import React, { useEffect, useRef, useState } from "react";
import {
  createHakoConversation,
  deleteHakoConversation,
  deleteGuestHakoConversation,
  insertHakoChatMessage,
  loadHakoChatConversations,
  saveGuestHakoConversation,
} from "../../../services/hakoChatApi";
import { fetchHakoAiReply } from "../../../services/hakoAiClient";
import hakoGreetingCutout from "../../../assets/characters/hako/chat/transparent/hako-greeting-cutout.png";

function createGreetingMessage() {
  return {
    role: "assistant",
    content: "嗨，我是哈可 🌿 今天想跟我說說什麼嗎？",
    createdAt: new Date().toISOString(),
  };
}

function buildDraftConversation() {
  return {
    ...createHakoConversation([createGreetingMessage()]),
    title: "新的對話",
  };
}

function getLatestAssistantMessage(conversations) {
  const greetingContent = createGreetingMessage().content;
  const assistantMessages = sortConversations(conversations)
    .flatMap((conversation) => [...(conversation.messages || [])].reverse())
    .filter((message) => message.role === "assistant");

  return assistantMessages.find((message) => message.content !== greetingContent)
    || assistantMessages[0]
    || null;
}

function sortConversations(conversations) {
  return [...conversations].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}

function updateConversationInList(conversations, conversationId, updater) {
  return sortConversations(
    conversations.map((conversation) => {
      if (conversation.id !== conversationId) {
        return conversation;
      }

      return updater(conversation);
    }),
  );
}

function isDraftConversation(conversation) {
  return conversation?.title === "新的對話" && (conversation?.messages?.length || 0) <= 1;
}

function getConversationPreview(conversation) {
  const latestMessage = conversation?.messages?.at(-1);
  const preview = latestMessage?.content?.replace(/\s+/g, " ").trim();

  if (!preview) {
    return "從一句現在最真實的話開始。";
  }

  return preview.length > 34 ? `${preview.slice(0, 34)}...` : preview;
}

function getRoleSearchLabel(role) {
  return role === "assistant" ? "assistant 哈可 陪伴" : "user 使用者 你 我";
}

function getConversationDateGroupLabel(updatedAt) {
  const date = new Date(updatedAt);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (target.getTime() === today.getTime()) return "今天";
  if (target.getTime() === yesterday.getTime()) return "昨天";
  return "更早之前";
}

function getConversationSearchIndex(conversation) {
  const date = new Date(conversation.updatedAt);
  const dateLabel = getConversationDateGroupLabel(conversation.updatedAt);
  const dateSearchText = [
    dateLabel,
    date.toLocaleDateString("zh-TW"),
    date.toLocaleDateString("zh-TW", { month: "numeric", day: "numeric" }),
  ].join(" ");

  const roleText = conversation.messages
    .map((message) => getRoleSearchLabel(message.role))
    .join(" ");

  return [conversation.title, conversation.summary, dateSearchText, roleText, ...conversation.messages.map((message) => message.content)]
    .join(" ")
    .toLowerCase();
}

function groupConversationsByDate(conversations) {
  const groups = [];

  conversations.forEach((conversation) => {
    const label = getConversationDateGroupLabel(conversation.updatedAt);
    const currentGroup = groups.at(-1);

    if (!currentGroup || currentGroup.label !== label) {
      groups.push({ label, items: [conversation] });
      return;
    }

    currentGroup.items.push(conversation);
  });

  return groups;
}

function HakoChatView() {
  const [initialDraftConversation] = useState(buildDraftConversation);
  const [conversations, setConversations] = useState(() => [initialDraftConversation]);
  const [activeConversationId, setActiveConversationId] = useState(() => initialDraftConversation.id);
  const [storageMode, setStorageMode] = useState("guest");
  const [searchText, setSearchText] = useState("");
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const chatEndRef = useRef(null);

  const quickPrompts = [
    "我說不上來，只覺得心裡悶悶的…",
    "最近好像特別累，不太知道為什麼。",
    "有一些事一直放在心上，卻不知道怎麼開口。",
  ];

  const activeConversation = conversations.find((conversation) => conversation.id === activeConversationId) || conversations[0] || null;
  const messages = activeConversation?.messages || [];
  const showSidebarEmptyState = conversations.length === 1 && isDraftConversation(conversations[0]);
  const showPanelWelcomeState = Boolean(activeConversation) && isDraftConversation(activeConversation);
  const normalizedSearch = searchText.trim().toLowerCase();
  const visibleConversations = normalizedSearch
    ? conversations.filter((conversation) => getConversationSearchIndex(conversation).includes(normalizedSearch))
    : conversations;
  const groupedConversations = groupConversationsByDate(visibleConversations);
  const introMessage = getLatestAssistantMessage(conversations)?.content || createGreetingMessage().content;

  useEffect(() => {
    let isActive = true;

    loadHakoChatConversations()
      .then(({ conversations: loadedConversations, mode }) => {
        if (!isActive) return;
        setStorageMode(mode);

        if (loadedConversations.length > 0) {
          setConversations(loadedConversations);
          setActiveConversationId(loadedConversations[0].id);
          return;
        }

        if (mode === "guest") {
          saveGuestHakoConversation(initialDraftConversation);
        }
      })
      .catch((error) => {
        console.warn("Failed to load hako chat history", error);
      })
      .finally(() => {
        if (isActive) {
          setIsHistoryLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!isChatOpen) return;

    let outerFrame = 0;
    let innerFrame = 0;

    outerFrame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(() => {
        chatEndRef.current?.scrollIntoView({ block: "end", behavior: "auto" });
      });
    });

    return () => {
      cancelAnimationFrame(outerFrame);
      cancelAnimationFrame(innerFrame);
    };
  }, [isChatOpen, activeConversationId, messages.length]);

  const handleStartNewConversation = () => {
    const nextConversation = buildDraftConversation();
    setConversations((prev) => sortConversations([nextConversation, ...prev]));
    setActiveConversationId(nextConversation.id);
    setText("");
    setIsHistoryOpen(false);
    setIsChatOpen(true);

    if (storageMode === "guest") {
      saveGuestHakoConversation(nextConversation);
    }
  };

  const handleDeleteConversation = (conversationId) => {
    const applyNextConversations = (nextConversations) => {
      setConversations(nextConversations);

      if (conversationId !== activeConversationId) {
        return;
      }

      const fallbackConversation = nextConversations[0] || buildDraftConversation();
      if (nextConversations.length === 0) {
        if (storageMode === "guest") {
          saveGuestHakoConversation(fallbackConversation);
        }
        setConversations([fallbackConversation]);
      }
      setActiveConversationId(fallbackConversation.id);
    };

    if (storageMode === "guest") {
      applyNextConversations(deleteGuestHakoConversation(conversationId));
      return;
    }

    deleteHakoConversation(conversationId)
      .then((deleted) => {
        if (!deleted) return;
        applyNextConversations(conversations.filter((conversation) => conversation.id !== conversationId));
      })
      .catch((error) => {
        console.warn("Failed to delete remote hako conversation", error);
      });
  };

  const handleSend = async () => {
    if (!text.trim() || isLoading || isHistoryLoading || !activeConversation) return;

    const userMessage = {
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    const newMessages = [...messages, userMessage];
    setConversations((prev) => updateConversationInList(prev, activeConversation.id, (conversation) => ({
      ...conversation,
      title: conversation.title === "新的對話" || conversation.messages.length <= 1
        ? text.trim().slice(0, 20)
        : conversation.title,
      summary: userMessage.content,
      updatedAt: userMessage.createdAt,
      messages: newMessages,
    })));
    setText("");
    setIsLoading(true);

    // 紀錄到 Supabase（作為聊天備份）
    insertHakoChatMessage(text, "user", activeConversation.id).catch((err) => {
      console.warn("Failed to sync hako chat to Supabase", err);
    });

    // 呼叫哈可 AI 回覆
    const aiReply = await fetchHakoAiReply(newMessages);
    if (aiReply) {
      const assistantMessage = {
        role: "assistant",
        content: aiReply,
        createdAt: new Date().toISOString(),
      };

      setConversations((prev) => updateConversationInList(prev, activeConversation.id, (conversation) => ({
        ...conversation,
        summary: assistantMessage.content,
        updatedAt: assistantMessage.createdAt,
        messages: [...conversation.messages, assistantMessage],
      })));

      insertHakoChatMessage(aiReply, "assistant", activeConversation.id).catch((err) => {
        console.warn("Failed to sync hako assistant reply to Supabase", err);
      });
    }

    setIsLoading(false);
  };

  const handleKeyDown = (e) => {
    if (isComposing || e.nativeEvent?.isComposing) {
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickPromptClick = (promptText) => {
    setText((prev) => {
      if (!prev) return promptText;
      const needsNewline = !prev.endsWith("\n");
      return `${prev}${needsNewline ? "\n" : ""}${promptText}`;
    });
  };

  return (
    <section className="hako-cabin-shell">
      <div className="hako-cabin-workspace">
        <div className="hako-cabin-intro">
          <header className="hako-cabin-page-header" aria-label="哈可小屋介紹">
            <p className="hako-cabin-page-header__eyebrow">Hako Cabin</p>
            <h1>哈可小屋</h1>
            <p className="hako-cabin-page-header__subtitle">
              哈可會陪你把還沒整理好的心情，一句一句接住
            </p>
          </header>

          <div className="hako-cabin-intro__bubble" role="dialog" aria-label="哈可招呼語">
            <span className="hako-cabin-intro__eyebrow">哈可正在這裡等你</span>
            <p>{introMessage}</p>
            <button
              type="button"
              className="hako-cabin-intro__cta"
              onClick={() => setIsChatOpen(true)}
            >
              打開大對話框
            </button>
          </div>

          <div className="hako-cabin-hero hako-cabin-hero--intro" aria-hidden="true">
            <div className="hako-cabin-hero__halo" />
            <img className="hako-cabin-hero__image" src={hakoGreetingCutout} alt="" />
          </div>
        </div>

        {isChatOpen && (
          <>
            <div
              className="hako-cabin-modal-backdrop"
              aria-hidden="true"
              onClick={() => {
                setIsChatOpen(false);
                setIsHistoryOpen(false);
              }}
            />

            <section className="hako-cabin hako-cabin--panel hako-cabin--modal">
              <button
                type="button"
                className="hako-cabin-close"
                aria-label="關閉大對話框"
                onClick={() => {
                  setIsChatOpen(false);
                  setIsHistoryOpen(false);
                }}
              >
                ×
              </button>

              {isHistoryOpen && (
                <button
                  type="button"
                  className="hako-history-backdrop"
                  aria-label="關閉對話列表"
                  onClick={() => setIsHistoryOpen(false)}
                />
              )}

              <div className="hako-cabin-modal-body">
                <aside className={`hako-history-drawer${isHistoryOpen ? " is-open" : ""}`}>
                  <div className="hako-cabin-sidebar">
                    <div className="hako-sidebar-top">
                      <button
                        type="button"
                        className="hako-sidebar-new-conversation"
                        onClick={handleStartNewConversation}
                      >
                        ＋ 新增對話
                      </button>

                      <label className="hako-conversation-search" htmlFor="hako-conversation-search">
                        <span className="hako-conversation-search__meta">
                          <span className="hako-conversation-search__label-wrap">
                            <span className="hako-conversation-search__icon" aria-hidden="true">⌕</span>
                            <span className="hako-conversation-search__label">搜尋對話</span>
                          </span>
                        </span>
                        <input
                          id="hako-conversation-search"
                          className="hako-conversation-search__input"
                          type="search"
                          aria-label="搜尋對話"
                          placeholder="搜尋標題、日期、角色"
                          value={searchText}
                          onChange={(event) => setSearchText(event.target.value)}
                        />
                        {searchText && (
                          <button
                            type="button"
                            className="hako-conversation-search__clear"
                            onClick={() => setSearchText("")}
                            aria-label="清除搜尋"
                          >
                            清除
                          </button>
                        )}
                      </label>
                    </div>

              <div className="hako-sidebar-body">
                <div className="hako-conversation-list" aria-label="對話列表">
                  {normalizedSearch && groupedConversations.length === 0 && (
                    <div className="hako-conversation-empty hako-conversation-empty--search">
                      <span className="hako-conversation-empty__illustration" aria-hidden="true">⌕</span>
                      <strong>沒有找到相符對話</strong>
                      <p>試試搜尋日期、角色或一句你記得的話，像是「今天」、「assistant」或某段心情。</p>
                    </div>
                  )}

                  {groupedConversations.map((group) => (
                    <div key={group.label} className="hako-conversation-group">
                      <div className="hako-conversation-group__label">{group.label}</div>

                      {group.items.map((conversation) => (
                        <div
                          key={conversation.id}
                          className={`hako-conversation-item${conversation.id === activeConversationId ? " is-active" : ""}`}
                        >
                          <button
                            type="button"
                            className="hako-conversation-button"
                            onClick={() => {
                              setActiveConversationId(conversation.id);
                              setIsHistoryOpen(false);
                            }}
                          >
                            <span className="hako-conversation-title">{conversation.title}</span>
                            <span className="hako-conversation-summary">{getConversationPreview(conversation)}</span>
                            <span className="hako-conversation-meta">
                              <span className="hako-conversation-count">{conversation.messages.length} 則</span>
                              <span className="hako-conversation-time">
                                {new Date(conversation.updatedAt).toLocaleDateString("zh-TW", {
                                  month: "numeric",
                                  day: "numeric",
                                })}
                              </span>
                            </span>
                          </button>

                          <button
                            type="button"
                            className="hako-conversation-delete"
                            onClick={() => handleDeleteConversation(conversation.id)}
                            aria-label={`刪除 ${conversation.title}`}
                          >
                            刪除
                          </button>

                          {storageMode === "guest" && (
                            <button
                              type="button"
                              className="hako-conversation-badge"
                              tabIndex={-1}
                            >
                              本機
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

                    <div className="hako-sidebar-footer">
                      <p className="hako-conversation-note">
                        {storageMode === "guest"
                          ? "訪客聊天只會留在這台裝置。"
                          : "你的對話會好好留在這裡。"}
                      </p>
                    </div>
                  </div>
                </aside>

                <div className="hako-cabin-main">
                  <header className="hako-cabin-header">
                    <div>
                      <div className="hako-cabin-title-row">
                        <span className="hako-cabin-name">哈可</span>
                        <span className="hako-cabin-tag">心靈陪伴小幫手</span>
                      </div>

                    </div>
                  </header>

                  <div className="hako-cabin-stage">
                    <div className="hako-cabin-conversation">
              <div className="hako-chat-messages">

                {isHistoryLoading && conversations.length === 0 && (
                  <div className="hako-message hako-message--assistant">
                    <span className="hako-avatar">🌿</span>
                    <div className="hako-bubble hako-bubble--loading">哈可正在整理你們之前的對話...</div>
                  </div>
                )}
                {messages.map((msg, i) => {
                  const isFirstAssistant = i === 0 && msg.role === "assistant" && messages.length === 1;

                  return (
                    <React.Fragment key={`${activeConversation?.id || "draft"}-${i}`}>
                      <div className={isFirstAssistant ? "hako-message-intro-layout" : undefined}>
                        <div className={`hako-message hako-message--${msg.role}`}>
                          {msg.role === "assistant" && <span className="hako-avatar">🌿</span>}
                          <div className="hako-bubble-wrapper">
                            {msg.role === "assistant" && <span className="hako-bubble-marker">哈可</span>}
                            <div className="hako-bubble">{msg.content}</div>
                            {msg.createdAt && (
                              <div className="hako-timestamp">
                                {new Date(msg.createdAt).toLocaleTimeString("zh-TW", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            )}
                          </div>
                        </div>

                        {isFirstAssistant && (
                          <div className="hako-quick-prompts" aria-label="聊天開頭建議">
                            <span className="hako-quick-label">不知道怎麼開始？可以從這裡試試：</span>
                            <div className="hako-quick-list">
                              {quickPrompts.map((prompt) => (
                                <button
                                  key={prompt}
                                  type="button"
                                  className="hako-quick-button"
                                  onClick={() => handleQuickPromptClick(prompt)}
                                  data-hako-hover="如果你不知道怎麼開始，可以先借用一句話，再慢慢改成自己的版本。"
                                  data-hako-click="這一句我先幫你放進輸入框了，你可以直接送出，或再改成更像你的話。"
                                >
                                  {prompt}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}
                {isLoading && (
                  <div className="hako-message hako-message--assistant">
                    <span className="hako-avatar">🌿</span>
                    <div className="hako-bubble-wrapper">
                      <span className="hako-bubble-marker">哈可</span>
                      <div className="hako-bubble hako-bubble--loading">
                        <span className="hako-typing" aria-hidden="true">
                          <span />
                          <span />
                          <span />
                        </span>
                        哈可正在想...
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} aria-hidden="true" />
              </div>

              <div className="hako-chat-input">
                <textarea
                  className="hako-chat-textarea"
                  placeholder="跟哈可說說，今天發生了什麼..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onCompositionStart={() => setIsComposing(true)}
                  onCompositionEnd={() => setIsComposing(false)}
                  disabled={isHistoryLoading}
                  data-hako-hover="不用一次講清楚，先打一句現在最卡住的感覺就可以。"
                />
                <button
                  className="hako-chat-send-btn"
                  onClick={handleSend}
                  disabled={isLoading || isHistoryLoading}
                  data-hako-priority="primary"
                  data-hako-hover="準備好就送出吧，我會先接住你剛剛寫下的內容。"
                  data-hako-click="我正在把你的話接過來，等一下就回你。"
                >
                  送出
                </button>
              </div>
                    </div>
                  </div>
                </div>
              </div>
        </section>
          </>
        )}
      </div>
    </section>
  );
}

export default HakoChatView;
