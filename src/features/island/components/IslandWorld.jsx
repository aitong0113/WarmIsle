import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BsArrowCounterclockwise,
  BsArrowUpRight,
  BsBarChartLine,
  BsCalendarCheck,
  BsFire,
  BsFlower1,
  BsHouseDoor,
  BsJournalText,
  BsLifePreserver,
} from "react-icons/bs";
import { Lock } from "lucide-react";

import islandMap from "@/assets/scenes/island/main-map.png";
import EmotionCalendarWidget from "@/features/homeCenter/components/EmotionCalendarWidget";
import { HOME_CENTER_PAGES } from "@/features/homeCenter/config/homeCenterPages";
import { EmotionSelector, useHomeCenterData } from "@/features/homeCenter/hooks/useHomeCenterData";

const QUICK_ICON_BY_ID = {
  intro: BsArrowCounterclockwise,
  today: BsJournalText,
  journal: BsCalendarCheck,
  status: BsBarChartLine,
};

function IslandWorld() {
  const [activeQuickPanel, setActiveQuickPanel] = useState("today");
  const {
    currentMonth,
    emotionMetaById,
    journalFeedback,
    monthDays,
    monthEntriesCount,
    recentEmotionMeta,
    recentLog,
    selectedDate,
    selectedDay,
    setCurrentMonth,
    setSelectedDate,
    setTodayNoteDraft,
    streakInfo,
    today,
    todayEmotion,
    todayEmotionMeta,
    todayLog,
    todayNoteDraft,
    handleSaveTodayNote,
    handleSelectTodayEmotion,
  } = useHomeCenterData();

  useEffect(() => {
    if (activeQuickPanel !== "journal") return;

    const todayDate = new Date(`${today}T00:00:00`);
    setSelectedDate(today);
    setCurrentMonth(new Date(todayDate.getFullYear(), todayDate.getMonth(), 1));
  }, [activeQuickPanel, setCurrentMonth, setSelectedDate, today]);

  const activeAction = HOME_CENTER_PAGES.find((action) => action.id === activeQuickPanel) || null;

  const renderQuickPanel = () => {
    if (!activeAction) return null;

    if (activeAction.id === "intro") {
      return (
        <div className="island-world__bubble-block">
          <p className="island-world__bubble-copy">
            如果你想重新走一遍進島前的對話，或回到最初那個陪你進島的入口，可以從這裡回去。
          </p>
          <Link to="/intro" className="island-world__bubble-link">
            前往入口
            <BsArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      );
    }

    if (activeAction.id === "today") {
      return (
        <div className="island-world__bubble-block">
          <p className="island-world__bubble-copy">
            先替今天的自己取一個最接近的名字，再決定要不要多寫一點。
          </p>

          <div className="island-world__bubble-current">
            <span className="island-world__bubble-label">目前記錄</span>
            {todayEmotionMeta ? (
              <strong className="emotion-current-chip">
                <img src={todayEmotionMeta.iconSrc} alt="" className="emotion-current-chip__icon" aria-hidden="true" />
                <span>{todayEmotionMeta.label}</span>
              </strong>
            ) : (
              <strong>還沒選今天的情緒</strong>
            )}
          </div>

          <EmotionSelector onSelect={handleSelectTodayEmotion} selectedId={todayLog?.emotion || todayEmotion} />

          <label className="island-world__bubble-label" htmlFor="island-emotion-note">
            一句短短的心情日記
          </label>
          <textarea
            id="island-emotion-note"
            className="island-world__note-input"
            placeholder="例如：今天想先安靜一下，晚點再慢慢整理自己。"
            maxLength={120}
            value={todayNoteDraft}
            onChange={(event) => setTodayNoteDraft(event.target.value)}
          />

          <div className="island-world__bubble-actions">
            <button type="button" className="btn btn-soft" onClick={handleSaveTodayNote}>
              存到今日紀錄
            </button>
            {journalFeedback && <p className="island-world__bubble-feedback">{journalFeedback}</p>}
          </div>
        </div>
      );
    }

    if (activeAction.id === "journal") {
      return (
        <div className="island-world__bubble-block island-world__bubble-block--calendar">
          <p className="island-world__bubble-copy">把散落的感受收進月曆裡，之後回頭看會比較知道自己怎麼走過來。</p>

          <EmotionCalendarWidget
            currentMonth={currentMonth}
            emotionMetaById={emotionMetaById}
            monthDays={monthDays}
            monthEntriesCount={monthEntriesCount}
            selectedDate={selectedDate}
            selectedDay={selectedDay}
            setCurrentMonth={setCurrentMonth}
            setSelectedDate={setSelectedDate}
            streakInfo={streakInfo}
            today={today}
          />
        </div>
      );
    }

    return (
      <div className="island-world__bubble-block">
        <p className="island-world__bubble-copy">連續天數和最近情緒，會把你最近的節奏慢慢勾勒出來。</p>

        <div className="island-world__status-grid">
          <div className="island-world__status-card">
            <span className="island-world__bubble-label">連續天數</span>
            <strong>{streakInfo.count} 天</strong>
          </div>
          <div className="island-world__status-card">
            <span className="island-world__bubble-label">最近情緒</span>
            <strong>{recentEmotionMeta?.label || "尚未記錄"}</strong>
          </div>
          <div className="island-world__status-card">
            <span className="island-world__bubble-label">本月紀錄</span>
            <strong>{monthEntriesCount} 筆</strong>
          </div>
          <div className="island-world__status-card">
            <span className="island-world__bubble-label">今天狀態</span>
            <strong>{todayEmotionMeta?.label || "還沒選情緒"}</strong>
          </div>
        </div>

        <div className="island-world__bubble-note-preview">
          <span className="island-world__bubble-label">最近一句話</span>
          <p>{todayLog?.note || recentLog?.note || "你還沒有留下短日記，今天可以從一句話開始。"}</p>
        </div>
      </div>
    );
  };

  return (
    <section className="island-world">
      <div className="island-world__quick-shell">
        <div className="island-world__quick-actions" aria-label="島嶼快捷資訊">
          {HOME_CENTER_PAGES.map((action) => {
            const ActionIcon = QUICK_ICON_BY_ID[action.id] || action.icon;
            const isActive = activeQuickPanel === action.id;

            return (
              <button
                key={action.id}
                type="button"
                className={`island-world__quick-button${isActive ? " is-active" : ""}`}
                onClick={() => setActiveQuickPanel((current) => (current === action.id ? "" : action.id))}
                aria-pressed={isActive}
                aria-label={action.label}
              >
                <ActionIcon aria-hidden="true" />
              </button>
            );
          })}
        </div>

        {activeAction && (
          <aside className="island-world__info-panel" aria-live="polite">
            <div className="island-world__info-panel-head">
              <div>
                <span className="island-world__info-panel-kicker">首頁功能</span>
                <h2>{activeAction.title}</h2>
              </div>
              <button
                type="button"
                className="island-world__info-close"
                onClick={() => setActiveQuickPanel("")}
                aria-label="關閉資訊面板"
              >
                ×
              </button>
            </div>

            {renderQuickPanel()}
          </aside>
        )}
      </div>

      <div className="island-world__scene">
        <img src={islandMap} alt="" className="island-world__backdrop" aria-hidden="true" />
        <img src={islandMap} alt="暖心島地圖" className="island-world__map" />
        <div className="island-world__veil" />

        <Link
          to="/beach"
          className="island-item beach"
          data-hako-priority="primary"
          data-hako-hover="情緒沙灘適合先把今天的感受寫下來，不用整理好也沒關係。"
          data-hako-click="我們先去情緒沙灘，留下一筆今天的心情。"
        >
          <span className="island-label">
            <BsArrowUpRight className="island-label__icon" aria-hidden="true" />
            <span>情緒沙灘</span>
            <BsArrowUpRight className="island-label__trail" aria-hidden="true" />
          </span>
        </Link>

        <Link
          to="/hako-cabin"
          className="island-item cabin"
          data-hako-priority="primary"
          data-hako-hover="哈可小屋比較適合想說話的時候，哪怕只講一句卡住的事也可以。"
          data-hako-click="一起進哈可小屋吧，我會先接住你想說的第一句。"
        >
          <span className="island-label">
            <BsHouseDoor className="island-label__icon" aria-hidden="true" />
            <span>哈可小屋</span>
            <BsArrowUpRight className="island-label__trail" aria-hidden="true" />
          </span>
        </Link>

        <Link
          to="/campfire"
          className="island-item campfire"
          data-hako-priority="primary"
          data-hako-hover="營火廣場適合先用聲音把節奏放慢，再決定要不要想更多。"
          data-hako-click="我們往營火那邊走，先讓耳朵和呼吸慢下來。"
        >
          <span className="island-label">
            <BsFire className="island-label__icon" aria-hidden="true" />
            <span>營火廣場</span>
            <span className="island-label__lock" aria-hidden="true">
              <Lock size={10} strokeWidth={2.2} />
            </span>
          </span>
        </Link>

        <Link
          to="/meditation"
          className="island-item meditation"
          data-hako-priority="primary"
          data-hako-hover="冥想碼頭有短一點的練習，適合想先穩住呼吸的時候。"
          data-hako-click="去冥想碼頭吧，先陪自己待幾分鐘就好。"
        >
          <span className="island-label">
            <BsFlower1 className="island-label__icon" aria-hidden="true" />
            <span>冥想碼頭</span>
            <span className="island-label__lock" aria-hidden="true">
              <Lock size={10} strokeWidth={2.2} />
            </span>
          </span>
        </Link>

        <Link
          to="/lighthouse"
          className="island-item lighthouse"
          data-hako-priority="primary"
          data-hako-hover="心理燈塔放的是能真的聯絡到的資源，需要幫忙時可以從這裡找。"
          data-hako-click="我帶你去心理燈塔，看看現在有哪些資源能接住你。"
        >
          <span className="island-label">
            <BsLifePreserver className="island-label__icon" aria-hidden="true" />
            <span>心理燈塔</span>
            <span className="island-label__lock" aria-hidden="true">
              <Lock size={10} strokeWidth={2.2} />
            </span>
          </span>
        </Link>
      </div>
    </section>
  );
}

export default IslandWorld;
