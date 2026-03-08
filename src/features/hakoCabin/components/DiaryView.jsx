import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addDiary } from "../store/diarySlice";
import { getHakoMessageForEvent } from "../../hako/hakoScripts";
import { showByEvent } from "../../hako/store/hakoSlice";
import { addDiaryEntryApi } from "../../../services/diaryApi";
import { getGuestUserId } from "../../../services/guestUser";
import { fetchHakoAiReply } from "../../../services/hakoAiClient";

function DiaryView() {
  const dispatch = useDispatch();
  const entries = useSelector((state) => state.diary.entries);

  const [text, setText] = useState("");

  const handleSave = () => {
    if (!text.trim()) return;
    const today = new Date().toISOString().split("T")[0];
    dispatch(
      addDiary({
        content: text,
        date: today,
      })
    );
    setText("");

    const message = getHakoMessageForEvent({ type: "diary_saved" });
    if (message) {
      dispatch(showByEvent(message));
    }

    const userId = getGuestUserId();
    if (userId) {
      const tagMatches = text.match(/#(\S+)/g) || [];
      const tags = tagMatches.map((t) => t.slice(1));

      addDiaryEntryApi(userId, { content: text, tags, date: today }).catch((error) => {
        console.warn("Failed to sync diary entry to Supabase", error);
      });
    }

    fetchHakoAiReply({ type: "diary_saved", payload: { preview: text.slice(0, 120) } })
      .then((aiMessage) => {
        if (aiMessage) {
          dispatch(showByEvent(aiMessage));
        }
      })
      .catch((error) => {
        console.warn("Failed to get AI Hako reply for diary", error);
      });
  };

  return (
    <section className="diary-cabin">
      <header className="diary-cabin-header">
        <h2>哈可小屋</h2>
        <p className="diary-cabin-subtitle">
          想說的話，可以先寫給哈可看。寫完按下保存，哈可會用他的方式回應你，陪你一起整理今天。
        </p>
      </header>

      <textarea
        className="diary-textarea"
        placeholder="跟哈可說說，今天發生了什麼..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button className="diary-save-btn" onClick={handleSave}>
        寫給哈可
      </button>
    </section>
  );
}

export default DiaryView;
