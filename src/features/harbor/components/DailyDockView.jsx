import React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { dockToday } from "../store/dailyDockSlice";
import { getHakoMessageForEvent } from "../../hako/hakoScripts";
import { showByEvent } from "../../hako/store/hakoSlice";
import { fetchHakoAiReply } from "../../../services/hakoAiClient";
import EmotionSelector from "../../emotion/components/EmotionSelector";
import { setEmotion, addEmotionLog } from "../../emotion/store/emotionSlice";
import { EMOTION_OPTIONS } from "../../emotion/config/emotionOptions";
import { addEmotionLogApi } from "../../../services/emotionApi";
import { getGuestUserId } from "../../../services/guestUser";

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function DailyDockView() {
  const dispatch = useDispatch();
  const { lastDockDate, dockHistory, currentStreak = 0, longestStreak = 0 } = useSelector(
    (state) => state.dailyDock || {}
  );

  const todayEmotion = useSelector((state) => state.emotion.todayEmotion);
  const emotionLogs = useSelector((state) => state.emotion.emotionLogs || []);

  const today = getTodayDateString();
  const hasDockedToday = lastDockDate === today;

  const emotionStats = React.useMemo(() => {
    if (!Array.isArray(emotionLogs) || emotionLogs.length === 0) return [];

    const counts = emotionLogs.reduce((acc, log) => {
      if (!log?.emotion) return acc;
      acc[log.emotion] = (acc[log.emotion] || 0) + 1;
      return acc;
    }, {});

    const total = Object.values(counts).reduce((sum, v) => sum + v, 0) || 0;

    return EMOTION_OPTIONS.map((opt) => {
      const value = counts[opt.id] || 0;
      const percentage = total ? Math.round((value / total) * 100) : 0;
      return { ...opt, value, percentage };
    }).filter((item) => item.value > 0);
  }, [emotionLogs]);

  const handleEmotionSelect = (emotionValue) => {
    const emotionDate = new Date().toISOString().split("T")[0];

    dispatch(setEmotion(emotionValue));

    dispatch(
      addEmotionLog({
        emotion: emotionValue,
        date: emotionDate,
      })
    );

    const message = getHakoMessageForEvent({
      type: "emotion_selected",
      payload: { emotion: emotionValue },
    });
    if (message) {
      dispatch(showByEvent(message));
    }

    const userId = getGuestUserId();
    if (userId) {
      addEmotionLogApi(userId, { emotion: emotionValue, date: emotionDate }).catch((error) => {
        console.warn("Failed to sync emotion log to Supabase", error);
      });
    }

    fetchHakoAiReply({ type: "emotion_selected", payload: { emotion: emotionValue } })
      .then((aiMessage) => {
        if (aiMessage) {
          dispatch(showByEvent(aiMessage));
        }
      })
      .catch((error) => {
        console.warn("Failed to get AI Hako reply for emotion", error);
      });
  };

  const handleDock = () => {
    if (!hasDockedToday) {
      dispatch(dockToday());
      const message = getHakoMessageForEvent({ type: "docked_today" });
      if (message) {
        dispatch(showByEvent(message));
      }

      fetchHakoAiReply({ type: "docked_today" })
        .then((aiMessage) => {
          if (aiMessage) {
            dispatch(showByEvent(aiMessage));
          }
        })
        .catch((error) => {
          console.warn("Failed to get AI Hako reply for dock", error);
        });
    }
  };

  const recentHistory = Array.isArray(dockHistory) ? dockHistory.slice(0, 7) : [];

  return (
    <section className="daily-dock">
      <header className="daily-dock-header">
        <h1>每日靠岸 Daily Harbor</h1>
        <p className="daily-dock-subtitle">每天來小港口靠岸一下，順便記錄今天的心情。</p>
      </header>

      <div className="daily-dock-card">
        <p className="daily-dock-status">
          {hasDockedToday
            ? "今天已經靠岸囉，謝謝你來到暖島。"
            : "今天還沒靠岸，想不想打個卡，讓自己被看見？"}
        </p>
        <button
          type="button"
          className="btn btn-soft"
          onClick={handleDock}
          disabled={hasDockedToday}
        >
          {hasDockedToday ? "今天已靠岸" : "今天靠岸"}
        </button>

        <div className="daily-dock-metrics">
          {hasDockedToday && currentStreak > 0 && (
            <span className="badge badge-primary">
              目前已連續靠岸
              {" "}
              {currentStreak}
              {" "}
              天
            </span>
          )}
          {longestStreak > 0 && (
            <span className="badge badge-soft">歷史最長連續 {longestStreak} 天</span>
          )}
        </div>
      </div>

      <section className="daily-dock-emotion">
        <h2>今日心情 Mood</h2>
        <p className="daily-dock-emotion-status">
          {todayEmotion ? `今天的心情：${todayEmotion}` : "還沒有選擇心情，選一個顏色看看。"}
        </p>

        <EmotionSelector onSelect={handleEmotionSelect} />

        <div className="daily-dock-emotion-log">
          <h3>心情紀錄</h3>
          {emotionLogs.length === 0 ? (
            <p className="daily-dock-empty">還沒有心情紀錄，從今天開始也很好。</p>
          ) : (
            <ul>
              {emotionLogs.map((log, index) => (
                <li key={`${log.date}-${index}`}>
                  <span className="daily-dock-date">{log.date}</span>
                  {" ".concat("- ", log.emotion)}
                </li>
              ))}
            </ul>
          )}
        </div>

        {emotionStats.length > 0 && (
          <div className="daily-dock-emotion-summary">
            <h3>心情統計</h3>
            <ul className="daily-dock-emotion-summary-list">
              {emotionStats.map((item) => (
                <li key={item.id} className="daily-dock-emotion-summary-item">
                  <span className="daily-dock-emotion-label">{item.label}</span>
                  <span className="daily-dock-emotion-count">
                    {item.value}
                    次
                  </span>
                  <span className="daily-dock-emotion-bar">
                    <span
                      className="daily-dock-emotion-bar-fill"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </span>
                  <span className="daily-dock-emotion-percentage">{item.percentage}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="daily-dock-history">
        <h2>最近的靠岸紀錄 Dock Log</h2>
        {recentHistory.length === 0 ? (
          <p className="daily-dock-empty">還沒有任何紀錄，從今天開始也很好。</p>
        ) : (
          <ul>
            {recentHistory.map((entry, index) => (
              <li key={entry.timestamp || `${entry.date}-${index}`}>
                <span className="daily-dock-date">{entry.date}</span>
                {entry.timestamp && (
                  <span className="daily-dock-time">
                    {" "}
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="daily-dock-next">
        <h2>接下來可以去哪裡</h2>
        <p className="daily-dock-next-subtitle">
          今天已經來港口靠岸了，接下來也可以到島上的其他角落晃晃。
        </p>
        <div className="daily-dock-next-actions">
          <Link to="/beach" className="btn btn-ghost">
            去情緒沙灘走走
          </Link>
          <Link to="/hako-cabin" className="btn btn-ghost">
            和哈可聊一聊
          </Link>
          <Link to="/lighthouse" className="btn btn-ghost">
            看看心理燈塔資源
          </Link>
        </div>
      </section>
    </section>
  );
}

export default DailyDockView;
