import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import beachDesktopImage from "../../../assets/scenes/beach/baeach-desktop.png";
import { getGuestUserId } from "../../../services/guestUser";
import EmotionSelector from "./EmotionSelector";
import { EMOTION_OPTIONS } from "../config/emotionOptions";
import { addEmotionLog, setEmotion } from "../store/emotionSlice";
import { syncEmotionLogApi } from "../../../services/emotionApi";
import { todayLocalDate } from "../../../utils/date";
import { createSandWriting, fetchRecentSandWritings, fetchSandWritingLikesMeta, toggleSandWritingLike } from "../../../services/sandWritingApi";

const VISIBILITY_OPTIONS = [
  { id: "private", label: "私密", icon: "🔒", hint: "只先留給自己。" },
  { id: "anonymous", label: "匿名", icon: "🌊", hint: "留在沙灘上讓旅人看見。" },
  { id: "counselor", label: "心理師", icon: "✨", hint: "希望被更溫柔地接住。" },
];

const FILTER_OPTIONS = [
  { id: "all", label: "全部" },
  { id: "counselor", label: "心理師精選" },
  { id: "mine", label: "我的" },
];

const EMOTION_COPY = {
  tired: {
    aiReply: "我有聽到你已經撐很久了，現在先不用把自己逼得更用力。",
    expertReply: "如果累已經維持很多天，今晚先只做一件最小的照顧：喝水、洗澡、躺下來。",
  },
  stressed: {
    aiReply: "你不是做得不夠，而是身上真的背了很多。",
    expertReply: "試著把壓力拆成一件現在能處理、兩件可以晚點處理的事，讓大腦先降噪。",
  },
  sad: {
    aiReply: "這份難過有被看見，你不用急著把它整理成漂亮的樣子。",
    expertReply: "如果今天很想哭，先讓自己安全地哭完，再決定下一步就好。",
  },
  anxious: {
    aiReply: "擔心不是你太脆弱，而是你的心正在努力保護你。",
    expertReply: "把腦中最糟的畫面寫成一句話，通常能幫焦慮從霧變成可處理的輪廓。",
  },
  ok: {
    aiReply: "現在只是還可以也沒有關係，情緒不一定每次都要很明確。",
    expertReply: "平穩的日子也值得被記下來，這也是你在恢復的證據。",
  },
  relaxed: {
    aiReply: "這份放鬆很珍貴，先讓身體記住現在的呼吸節奏。",
    expertReply: "可以替今天留下一句感謝，之後低潮時會成為很有力的錨點。",
  },
  grateful: {
    aiReply: "你願意看見被照顧的瞬間，心裡會慢慢亮起來。",
    expertReply: "把那個讓你感謝的人事物寫具體一點，會更容易留下力量感。",
  },
  happy: {
    aiReply: "這份開心值得被好好放大，今天的你有把光帶上岸。",
    expertReply: "試著記下是什麼讓你鬆一口氣，下次你會更知道怎麼回到這個狀態。",
  },
  default: {
    aiReply: "我有聽到你留下的這句話，現在先陪你站在這裡。",
    expertReply: "如果你想多說一點，去小屋把這句話展開說，通常會更容易被接住。",
  },
};

function formatCreatedAt(value) {
  if (!value) return "剛剛";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "剛剛";

  return date.toLocaleString("zh-TW", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function splitWritingContent(content) {
  const raw = (content || "").trim();
  if (!raw) {
    return { title: "", content: "" };
  }

  const [firstLine, ...rest] = raw.split("\n");
  if (rest.length === 0) {
    return { title: "", content: firstLine };
  }

  return {
    title: firstLine.trim(),
    content: rest.join("\n").trim(),
  };
}

function buildSupportCopy(moodId) {
  return EMOTION_COPY[moodId] || EMOTION_COPY.default;
}

function EmotionView() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const today = todayLocalDate();
  const todayEmotion = useSelector((state) => state.emotion?.todayEmotion || "");
  const emotionLogs = useSelector((state) => state.emotion?.emotionLogs || []);
  const prefillEmotionId = location.state?.prefillEmotionId || "";
  const prefillNote = location.state?.prefillNote || "";

  const todayLog = useMemo(
    () => (emotionLogs || []).find((entry) => entry.date === today) || null,
    [emotionLogs, today],
  );

  const [composer, setComposer] = useState(() => ({
    mood: prefillEmotionId || todayLog?.emotion || todayEmotion || "",
    title: "",
    content: prefillNote,
    visibility: "private",
  }));
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [sending, setSending] = useState(false);
  const [feedFilter, setFeedFilter] = useState("all");
  const [feedback, setFeedback] = useState("");
  const [lightPulseId, setLightPulseId] = useState(null);

  const emotionMetaById = useMemo(
    () =>
      EMOTION_OPTIONS.reduce((acc, option) => {
        acc[option.id] = option;
        return acc;
      }, {}),
    [],
  );

  useEffect(() => {
    if (!prefillEmotionId && !prefillNote) return;

    setComposer((prev) => ({
      ...prev,
      mood: prev.mood || prefillEmotionId || "",
      content: prev.content || prefillNote || "",
    }));
  }, [prefillEmotionId, prefillNote]);

  useEffect(() => {
    const loadRecent = async () => {
      setLoadingPosts(true);
      try {
        const list = await fetchRecentSandWritings({ limit: 18 });
        const ids = (list || []).map((item) => item.id).filter(Boolean);
        const me = getGuestUserId();
        const { counts: likeCounts, likedIds } = await fetchSandWritingLikesMeta(ids, me);
        const likedSet = new Set(likedIds || []);

        setPosts(
          (list || []).map((item, index) => {
            const contentParts = splitWritingContent(item.content);
            const supportCopy = buildSupportCopy(null);
            const showExpert = index % 4 === 0;

            return {
              ...item,
              title: contentParts.title,
              content: contentParts.content,
              mood: null,
              visibility: index % 5 === 0 ? "counselor" : "anonymous",
              likeCount: likeCounts[item.id] || 0,
              likedByMe: likedSet.has(item.id),
              isMine: Boolean(me && item.user_id === me),
              aiReply: supportCopy.aiReply,
              empathy: {
                relate: Math.max(1, Math.floor((likeCounts[item.id] || 0) / 2) + 2),
                hug: Math.max(1, Math.floor((likeCounts[item.id] || 0) / 3) + 1),
              },
              expertReply: showExpert ? supportCopy.expertReply : "",
              lightBoost: showExpert ? 2 : 1,
            };
          }),
        );
      } catch (error) {
        console.warn("Failed to fetch recent sand writings", error);
      } finally {
        setLoadingPosts(false);
      }
    };

    loadRecent();
  }, []);

  useEffect(() => {
    if (!lightPulseId) return undefined;

    const timer = window.setTimeout(() => {
      setLightPulseId(null);
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [lightPulseId]);

  const filteredPosts = useMemo(() => {
    if (feedFilter === "mine") {
      return posts.filter((item) => item.isMine);
    }

    if (feedFilter === "counselor") {
      return posts.filter((item) => item.visibility === "counselor" || item.expertReply);
    }

    return posts;
  }, [feedFilter, posts]);

  const composerMoodMeta = composer.mood ? emotionMetaById[composer.mood] : null;
  const selectedVisibility =
    VISIBILITY_OPTIONS.find((option) => option.id === composer.visibility) || VISIBILITY_OPTIONS[0];

  const handleComposerChange = (key, value) => {
    setComposer((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSelectMood = (emotionId) => {
    setComposer((prev) => ({
      ...prev,
      mood: emotionId,
    }));

    dispatch(setEmotion(emotionId));
    dispatch(addEmotionLog({ emotion: emotionId, date: today }));

    const userId = getGuestUserId();
    if (userId) {
      syncEmotionLogApi(userId, { emotion: emotionId, date: today }).catch((error) => {
        console.warn("Failed to sync beach emotion log", error);
      });
    }
  };

  const handleSubmit = async () => {
    const content = composer.content.trim();
    if (!content || sending) return;

    setSending(true);
    setFeedback("");

    const mergedContent = [composer.title.trim(), content].filter(Boolean).join("\n");
    const userId = getGuestUserId();
    const supportCopy = buildSupportCopy(composer.mood);

    try {
      const created = await createSandWriting({ userId, content: mergedContent });
      const createdAt = created?.created_at || new Date().toISOString();
      const newPost = {
        id: created?.id || `local-${Date.now()}`,
        created_at: createdAt,
        user_id: created?.user_id || userId || null,
        title: composer.title.trim(),
        content,
        mood: composer.mood,
        visibility: composer.visibility,
        likeCount: 0,
        likedByMe: false,
        isMine: true,
        aiReply: supportCopy.aiReply,
        empathy: { relate: 12, hug: 8 },
        expertReply: composer.visibility === "counselor" ? supportCopy.expertReply : "",
        lightBoost: composer.visibility === "counselor" ? 3 : 2,
      };

      setPosts((prev) => [newPost, ...prev]);
      setLightPulseId(newPost.id);
      setFeedFilter(composer.visibility === "counselor" ? "counselor" : "all");
      setFeedback(`你的話已經留在沙灘上了，心光 +${newPost.lightBoost}。`);
      setComposer((prev) => ({
        ...prev,
        title: "",
        content: "",
        visibility: "private",
      }));
    } finally {
      setSending(false);
    }
  };

  const handleToggleLike = async (postId) => {
    if (!postId) return;

    const userId = getGuestUserId();
    if (!userId) return;

    let optimisticLiked = false;

    setPosts((prev) =>
      prev.map((item) => {
        if (item.id !== postId) return item;

        const nextLiked = !item.likedByMe;
        optimisticLiked = nextLiked;

        return {
          ...item,
          likedByMe: nextLiked,
          likeCount: Math.max(0, (item.likeCount || 0) + (nextLiked ? 1 : -1)),
          empathy: {
            ...item.empathy,
            hug: Math.max(0, (item.empathy?.hug || 0) + (nextLiked ? 1 : -1)),
          },
        };
      }),
    );

    try {
      const result = await toggleSandWritingLike({ writingId: postId, userId });
      if (result.liked === optimisticLiked) return;

      setPosts((prev) =>
        prev.map((item) => {
          if (item.id !== postId) return item;

          return {
            ...item,
            likedByMe: result.liked,
            likeCount: Math.max(0, (item.likeCount || 0) + (result.liked ? 1 : -1)),
            empathy: {
              ...item.empathy,
              hug: Math.max(0, (item.empathy?.hug || 0) + (result.liked ? 1 : -1)),
            },
          };
        }),
      );
    } catch (error) {
      console.warn("Failed to toggle like, reverting", error);
      setPosts((prev) =>
        prev.map((item) => {
          if (item.id !== postId) return item;

          return {
            ...item,
            likedByMe: !optimisticLiked,
            likeCount: Math.max(0, (item.likeCount || 0) + (optimisticLiked ? -1 : 1)),
            empathy: {
              ...item.empathy,
              hug: Math.max(0, (item.empathy?.hug || 0) + (optimisticLiked ? -1 : 1)),
            },
          };
        }),
      );
    }
  };

  const handleOpenCabin = (post) => {
    const prompt = [post.title, post.content, post.aiReply].filter(Boolean).join("\n\n");
    navigate("/hako-cabin", {
      state: {
        source: "emotion-beach",
        post,
        prefillMessage: prompt,
      },
    });
  };

  return (
    <section className="emotion-beach">
      <div className="emotion-beach__hero" style={{ backgroundImage: `url(${beachDesktopImage})` }}>
        <div className="emotion-beach__overlay">
          <div className="emotion-beach__intro">
            <p className="emotion-beach__eyebrow">Emotion Beach</p>
            <h2>情緒沙灘</h2>
            <p className="emotion-beach__lede">
              寫下今天卡住的情緒，讓它先被看見，再慢慢被理解。
            </p>
          </div>

          <div className="emotion-composer-card">
            <div className="emotion-composer-card__header">
              <div>
                <h3>今天想留下什麼？</h3>
                <p>先選心情，再把一句話留在沙灘上。</p>
              </div>
              {composerMoodMeta && (
                <div className="emotion-composer-card__mood">
                  <img src={composerMoodMeta.iconSrc} alt="" aria-hidden="true" />
                  <span>{composerMoodMeta.label}</span>
                </div>
              )}
            </div>

            <div className="emotion-composer-card__body">
              <div className="emotion-composer-card__column emotion-composer-card__column--selection">
                <div className="emotion-composer-card__field">
                  <span className="emotion-composer-card__label">情緒選擇</span>
                  <EmotionSelector onSelect={handleSelectMood} selectedId={composer.mood} />
                </div>

                <div className="emotion-composer-card__field">
                  <span className="emotion-composer-card__label">可見性</span>
                  <div className="emotion-visibility-pills" role="radiogroup" aria-label="可見性選擇">
                    {VISIBILITY_OPTIONS.map((option) => {
                      const isSelected = composer.visibility === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          className={`emotion-visibility-pill${isSelected ? " is-selected" : ""}`}
                          aria-pressed={isSelected}
                          onClick={() => handleComposerChange("visibility", option.id)}
                        >
                          <span>{option.icon}</span>
                          <strong>{option.label}</strong>
                          <small>{option.hint}</small>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="emotion-composer-card__column emotion-composer-card__column--input">
                <label className="emotion-composer-card__field">
                  <span className="emotion-composer-card__label">標題（選填）</span>
                  <input
                    className="emotion-composer-card__input"
                    type="text"
                    placeholder="幫這份心情留一個名字"
                    maxLength={40}
                    value={composer.title}
                    onChange={(event) => handleComposerChange("title", event.target.value)}
                  />
                </label>

                <label className="emotion-composer-card__field emotion-composer-card__field--fill">
                  <span className="emotion-composer-card__label">內容</span>
                  <textarea
                    className="emotion-composer-card__textarea"
                    placeholder="例如：今天真的有點撐不住，但我還是努力撐完了。"
                    maxLength={280}
                    value={composer.content}
                    onChange={(event) => handleComposerChange("content", event.target.value)}
                  />
                </label>
              </div>
            </div>

            <div className="emotion-composer-card__footer">
              <div className="emotion-composer-card__visibility-hint">
                <span>{selectedVisibility.icon}</span>
                <p>{selectedVisibility.hint}</p>
              </div>
              <button
                type="button"
                className="btn btn-soft emotion-composer-card__submit"
                onClick={handleSubmit}
                disabled={sending || !composer.content.trim()}
              >
                {sending ? "發佈中..." : "發佈"}
              </button>
            </div>

            {feedback && <p className="emotion-composer-card__feedback">{feedback}</p>}
          </div>
        </div>
      </div>

      <section className="emotion-feed-shell">
        <div className="emotion-feed-shell__header">
          <div>
            <p className="emotion-feed-shell__eyebrow">Layer 2</p>
            <h3>沙灘上的聲音</h3>
          </div>
          <div className="emotion-feed-tabs" role="tablist" aria-label="貼文篩選">
            {FILTER_OPTIONS.map((option) => {
              const isActive = feedFilter === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`emotion-feed-tabs__button${isActive ? " is-active" : ""}`}
                  onClick={() => setFeedFilter(option.id)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {loadingPosts ? (
          <p className="emotion-feed-shell__empty">海浪正在把大家的聲音帶上岸...</p>
        ) : filteredPosts.length === 0 ? (
          <p className="emotion-feed-shell__empty">這個分類還沒有貼文，先留下你的第一句話。</p>
        ) : (
          <div className="emotion-feed-list">
            {filteredPosts.map((post) => {
              const moodMeta = post.mood ? emotionMetaById[post.mood] : null;
              const visibilityMeta =
                VISIBILITY_OPTIONS.find((option) => option.id === post.visibility) || VISIBILITY_OPTIONS[1];

              return (
                <article
                  key={post.id}
                  className={`emotion-post-card${lightPulseId === post.id ? " is-light-pulse" : ""}`}
                >
                  <div className="emotion-post-card__topline">
                    <div className="emotion-post-card__meta">
                      {moodMeta ? (
                        <span className="emotion-post-card__mood">
                          <img src={moodMeta.iconSrc} alt="" aria-hidden="true" />
                          {moodMeta.label}
                        </span>
                      ) : (
                        <span className="emotion-post-card__mood is-neutral">🌊 匿名</span>
                      )}
                      <span className="emotion-post-card__time">{post.isMine ? "你" : "匿名旅人"} · {formatCreatedAt(post.created_at)}</span>
                    </div>
                    <span className="emotion-post-card__light">✨ 心光 +{post.lightBoost || 1}</span>
                  </div>

                  {post.title && <h4>{post.title}</h4>}
                  <p className="emotion-post-card__content">{post.content}</p>

                  <div className="emotion-post-card__support">
                    <div className="emotion-post-card__ai">
                      <span>🫧 哈可</span>
                      <p>{post.aiReply}</p>
                    </div>
                    {post.expertReply && (
                      <div className="emotion-post-card__expert">
                        <span>{visibilityMeta.icon} 心理師精選</span>
                        <p>{post.expertReply}</p>
                      </div>
                    )}
                  </div>

                  <div className="emotion-post-card__actions">
                    <div className="emotion-post-card__empathy">
                      <span>🤍 我也有過 {post.empathy?.relate || 0}</span>
                      <button
                        type="button"
                        className={`emotion-post-card__hug${post.likedByMe ? " is-active" : ""}`}
                        onClick={() => handleToggleLike(post.id)}
                      >
                        🤍 抱抱你 {post.empathy?.hug || 0}
                      </button>
                    </div>
                    <button
                      type="button"
                      className="emotion-post-card__cta"
                      onClick={() => handleOpenCabin(post)}
                    >
                      🐻 去小屋聊聊
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <aside className="emotion-deep-links">
        <div className="emotion-deep-links__card">
          <p className="emotion-deep-links__eyebrow">Layer 3</p>
          <h3>想再往裡面走一點？</h3>
          <p>
            小屋適合把話說完整，心理師精選適合被溫柔整理，燈塔適合在真的需要時找更明確的方向。
          </p>
          <div className="emotion-deep-links__actions">
            <button type="button" className="btn btn-soft" onClick={() => navigate("/hako-cabin")}>哈可小屋</button>
            <button type="button" className="btn btn-soft" onClick={() => setFeedFilter("counselor")}>心理師精選</button>
            <button type="button" className="btn btn-soft" onClick={() => navigate("/lighthouse")}>心理燈塔</button>
          </div>
        </div>
      </aside>
    </section>
  );
}

export default EmotionView;
