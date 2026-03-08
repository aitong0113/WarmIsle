import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { getHakoMessageForEvent } from "../hakoScripts";
import { showByEvent } from "../store/hakoSlice";
import { fetchHakoAiReply } from "../../../services/hakoAiClient";
import { getGuestUserId } from "../../../services/guestUser";
import { setUser } from "@/features/user/store/userSlice";
import { getCurrentUser, onAuthStateChange, updateUserProfile } from "@/services/authService";

const STEPS = [
  {
    id: 2,
    text: "島上有情緒沙灘、哈可小屋，還有心理燈塔陪你走一段路。"
  },
  {
    id: 3,
    text: "先帶你去每日靠岸，打個卡，讓自己知道：我有來到這裡。"
  }
];

function HakoGuide() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user || {});
  const hasExistingName = user.name && user.name !== "Abbie";

  const [name, setName] = useState(user.name || "");
  const [stepIndex, setStepIndex] = useState(hasExistingName ? 1 : 0);
  const [closed, setClosed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    getCurrentUser().then((current) => {
      if (!isMounted) return;
      if (current) {
        setIsLoggedIn(true);
        setCurrentUserId(current.id || null);
        const metaName = current.user_metadata?.name;
        if (metaName && metaName !== "Abbie") {
          setName(metaName);
          setStepIndex(1);
          dispatch(
            setUser({
              id: current.id,
              name: metaName,
            }),
          );
        }
      }
    });

    const unsubscribe = onAuthStateChange((sessionUser) => {
      if (!isMounted) return;
      const loggedIn = !!sessionUser;
      setIsLoggedIn(loggedIn);
      const uid = sessionUser?.id || null;
      setCurrentUserId(uid);
      const metaName = sessionUser?.user_metadata?.name;
      if (loggedIn && uid && metaName && metaName !== "Abbie") {
        setName(metaName);
        setStepIndex(1);
        dispatch(
          setUser({
            id: uid,
            name: metaName,
          }),
        );
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  if (closed) return null;

  const isNameStep = stepIndex === 0;
  const isLast = stepIndex === STEPS.length;
  const current = !isNameStep ? STEPS[stepIndex - 1] : null;

  const effectiveName = name.trim() || (user.name !== "Abbie" ? user.name : "");
  const hasDisplayName = !!effectiveName;
  const displayName = effectiveName;

  const titleText = isLoggedIn
    ? hasDisplayName
      ? `歡迎回來，${displayName}，今天想怎麼逛逛暖心島？`
      : "第一次來暖心島嗎？我可以怎麼稱呼你？"
    : "第一次來暖心島嗎？我可以怎麼稱呼你？";

  const primaryCtaLabel = isLoggedIn ? "開始今日旅程" : "先當遊客開始";

  const persistNameIfAny = () => {
    const trimmed = name.trim();
    if (trimmed) {
      const id = user.id || currentUserId || getGuestUserId();
      dispatch(
        setUser({
          id,
          name: trimmed,
        }),
      );
      if (isLoggedIn && currentUserId) {
        updateUserProfile({ name: trimmed }).catch((error) => {
          console.warn("Failed to update user profile name", error);
        });
      }
    }
  };

  const handleNext = () => {
    if (isNameStep) {
      persistNameIfAny();
      setStepIndex(1);
      return;
    }

    if (isLast) {
      setClosed(true);
      const displayName = name.trim() || user.name;
      const localMessage = displayName
        ? `嗨，${displayName}，今天過得怎麼樣？`
        : getHakoMessageForEvent({ type: "welcome_random" });

      if (localMessage) {
        dispatch(showByEvent(localMessage));
      }

      const aiEvent = displayName
        ? { type: "welcome_random", payload: { name: displayName } }
        : { type: "welcome_random" };

      fetchHakoAiReply(aiEvent)
        .then((aiMessage) => {
          if (aiMessage) {
            dispatch(showByEvent(aiMessage));
          }
        })
        .catch((error) => {
          console.warn("Failed to get AI Hako reply for welcome", error);
        });
      navigate("/daily-dock");
    } else {
      setStepIndex((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleLogin = () => {
    persistNameIfAny();
    navigate("/login");
  };

  const markGuideSeenForMember = () => {
    // TODO: 之後可以在這裡記錄會員已看過導覽（例如呼叫 API 或寫入本地 storage）
  };

  const handleSkip = () => {
    setClosed(true);
    markGuideSeenForMember();
  };

  return (
    <div className="hako-guide-overlay">
      <div className="hako-guide">
        <div className="hako-guide-avatar">🐻</div>
        <div className="hako-guide-bubble">
          {isNameStep ? (
            <>
              <p>{titleText}</p>
              <div className="hako-guide-actions">
                {!(isLoggedIn && hasDisplayName) && (
                  <input
                    type="text"
                    className="hako-name-input"
                    placeholder={
                      isLoggedIn && hasDisplayName
                        ? "如果想換個稱呼，可以在這裡改暱稱"
                        : "輸入你的名字或暱稱"
                    }
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                )}
                <button type="button" className="btn btn-soft" onClick={handleNext}>
                  {primaryCtaLabel}
                </button>
                {!isLoggedIn && (
                  <button type="button" className="btn" onClick={handleLogin}>
                    我要登入
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <p>{current.text}</p>
              <div className="hako-guide-actions">
                <button type="button" className="btn btn-soft" onClick={handleNext}>
                  {isLast ? "我準備好了" : "繼續"}
                </button>
                {!isLast && (
                  <button type="button" className="hako-guide-skip" onClick={handleSkip}>
                    先逛逛島上
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default HakoGuide;
