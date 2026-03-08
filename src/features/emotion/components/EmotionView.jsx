import React, { useEffect, useRef, useState } from "react";
import { getGuestUserId } from "../../../services/guestUser";
import {
  createBottle,
  fetchRandomBottle,
  fetchBottleReplies,
  addBottleReply,
  fetchMyBottles,
  fetchReplyCountsForBottles,
} from "../../../services/bottleApi";

function EmotionView() {
  const [newBottleText, setNewBottleText] = useState("");
  const [currentBottle, setCurrentBottle] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [loadingBottle, setLoadingBottle] = useState(false);
  const [sending, setSending] = useState(false);
  const [myBottles, setMyBottles] = useState([]);
  const [isReplying, setIsReplying] = useState(false);
  const [feedback, setFeedback] = useState("");

  const mySectionRef = useRef(null);

  const loadRandomBottle = async () => {
    setLoadingBottle(true);
    try {
      const bottle = await fetchRandomBottle();
      setCurrentBottle(bottle);
      if (bottle?.id) {
        const list = await fetchBottleReplies(bottle.id);
        setReplies(list);
      } else {
        setReplies([]);
      }
      setIsReplying(false);
    } finally {
      setLoadingBottle(false);
    }
  };

  useEffect(() => {
    loadRandomBottle();
  }, []);

  useEffect(() => {
    const id = getGuestUserId();
    if (!id) return;

    fetchMyBottles(id)
      .then(async (list) => {
        const safeList = list || [];
        const ids = safeList.map((item) => item.id).filter(Boolean);
        const counts = await fetchReplyCountsForBottles(ids);

        setMyBottles(
          safeList.map((item) => ({
            ...item,
            replyCount: counts[item.id] || 0,
          })),
        );
      })
      .catch((error) => {
        console.warn("Failed to fetch my sand writings", error);
      });
  }, []);

  const handleThrowBottle = async () => {
    const text = newBottleText.trim();
    if (!text) return;

    setSending(true);
    try {
      const userId = getGuestUserId();
      const created = await createBottle({ userId, content: text });
      setNewBottleText("");
      const localItem =
        created || {
          id: `local-${Date.now()}`,
          content: text,
          created_at: new Date().toISOString(),
          replyCount: 0,
        };

      setMyBottles((prev) => [localItem, ...prev]);
      setFeedback("已經寫在沙灘上了，之後想看的時候可以往下滑。");
    } finally {
      setSending(false);
    }
  };

  const handleReply = async () => {
    if (!currentBottle?.id) return;
    const text = replyText.trim();
    if (!text) return;

    setSending(true);
    try {
      const userId = getGuestUserId();
      const created = await addBottleReply({ bottleId: currentBottle.id, userId, content: text });
      if (created) {
        setReplies((prev) => [...prev, created]);
        setReplyText("");
        setIsReplying(false);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="emotion-beach">
      <header className="emotion-beach-header">
        <h2>情緒沙灘</h2>
        <p>
          把今天的心情寫在沙灘上，讓海把它慢慢帶走，
          再沖上新的字，提醒你：情緒會來，也會離開。
        </p>
      </header>

      <div className="emotion-bottle-create">
        <h3>在沙灘上寫下一句話</h3>
        <textarea
          className="emotion-bottle-textarea"
          placeholder="想跟陌生旅人說的一小段話..."
          maxLength={300}
          value={newBottleText}
          onChange={(e) => setNewBottleText(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-soft"
          onClick={handleThrowBottle}
          disabled={sending || !newBottleText.trim()}
        >
          {sending ? "寫入中..." : "寫在沙灘上"}
        </button>

        {feedback && <p className="emotion-bottle-feedback">{feedback}</p>}

        <button
          type="button"
          className="btn btn-ghost emotion-my-link"
          onClick={() => {
            if (mySectionRef.current) {
              mySectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }}
        >
          看看我曾經留下的字
        </button>
      </div>

      <div className="emotion-bottle-random">
        <h3>聽聽海浪帶回來的話</h3>
        <button type="button" className="btn btn-ghost" onClick={loadRandomBottle} disabled={loadingBottle}>
          {loadingBottle ? "海浪翻找中..." : "看看沙灘上的字"}
        </button>

        {currentBottle ? (
          <div className="emotion-bottle-card">
            <p className="emotion-bottle-content">{currentBottle.content}</p>
            <div className="emotion-bottle-meta">某位旅人曾在這裡留下的字</div>

            <div className="emotion-bottle-replies">
              <h4>海浪回來的回聲</h4>
              {replies.length === 0 ? (
                <p className="emotion-bottle-empty">還沒有任何回聲，你可以當第一個回應他的人。</p>
              ) : (
                <ul>
                  {replies.map((reply) => (
                    <li key={reply.id}>{reply.content}</li>
                  ))}
                </ul>
              )}

              {!isReplying ? (
                <div className="emotion-bottle-actions">
                  <button
                    type="button"
                    className="btn btn-soft"
                    onClick={() => setIsReplying(true)}
                  >
                    回覆這段話
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={loadRandomBottle}
                    disabled={loadingBottle}
                  >
                    放回海裡，看看別的字
                  </button>
                </div>
              ) : (
                <div className="emotion-bottle-reply-box">
                  <textarea
                    className="emotion-bottle-reply-textarea"
                    placeholder="想回什麼話給這個人，像海浪一樣慢慢說..."
                    maxLength={240}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="emotion-bottle-reply-actions">
                    <button
                      type="button"
                      className="btn btn-soft"
                      onClick={handleReply}
                      disabled={sending || !replyText.trim()}
                    >
                      {sending ? "送出中..." : "送出回覆"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setIsReplying(false)}
                    >
                      先不要回覆
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          !loadingBottle && <p className="emotion-bottle-empty">沙灘上暫時看不到字，或許你可以先寫一個。</p>
        )}
      </div>

      <div className="emotion-my-writings" ref={mySectionRef}>
        <h3>我曾經寫在沙灘上的字</h3>
        {myBottles.length === 0 ? (
          <p className="emotion-bottle-empty">你還沒有寫在沙灘上的字，從今天開始也可以。</p>
        ) : (
          <ul className="emotion-my-writings-list">
            {myBottles.map((item) => (
              <li key={item.id} className="emotion-my-writings-item">
                <span className="emotion-my-writings-date">
                  {item.created_at ? new Date(item.created_at).toLocaleString() : ""}
                </span>
                <span className="emotion-my-writings-content">{item.content}</span>
                {typeof item.replyCount === "number" && (
                  <span className="emotion-my-writings-replies">
                    {item.replyCount > 0 ? `已收到 ${item.replyCount} 則回應` : "還沒有回應"}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default EmotionView;
