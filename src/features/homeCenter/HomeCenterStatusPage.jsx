import HomeCenterShell from "./components/HomeCenterShell";
import { getHomeCenterPage } from "./config/homeCenterPages";
import { useHomeCenterData } from "./hooks/useHomeCenterData";

function HomeCenterStatusPage() {
  const page = getHomeCenterPage("status");
  const {
    monthEntriesCount,
    emotionMetaById,
    recentChartDays,
    recentDisplayNote,
    recentEmotionMeta,
    recentLog,
    streakInfo,
    todayEmotionMeta,
    todayLog,
  } = useHomeCenterData();

  return (
    <HomeCenterShell
      pageId={page.id}
      kicker={page.kicker}
      title={page.title}
      description="連續天數和最近情緒，會把你最近的節奏慢慢勾勒出來。"
    >
      <article className="home-center-card">
        <div className="home-center-status-grid">
          <div className="home-center-status-card">
            <span className="home-center-card__label">連續天數</span>
            <strong>{streakInfo.count} 天</strong>
          </div>
          <div className="home-center-status-card">
            <span className="home-center-card__label">最近情緒</span>
            <strong>{recentEmotionMeta?.label || "尚未記錄"}</strong>
          </div>
          <div className="home-center-status-card">
            <span className="home-center-card__label">本月紀錄</span>
            <strong>{monthEntriesCount} 筆</strong>
          </div>
          <div className="home-center-status-card">
            <span className="home-center-card__label">今天狀態</span>
            <strong>{todayEmotionMeta?.label || "還沒選情緒"}</strong>
          </div>
        </div>

        <div className="home-center-chart-card">
          <div className="home-center-chart-card__header">
            <div>
              <span className="home-center-card__label">最近 7 天節奏</span>
              <strong>情緒小波形</strong>
            </div>
            <p>把這週的心情起伏收成一張小圖。</p>
          </div>

          <div className="home-center-mini-chart" aria-label="最近七天情緒統計圖">
            {recentChartDays.map((day) => {
              const emotionMeta = day.emotionId ? emotionMetaById[day.emotionId] : null;

              return (
                <div key={day.date} className={`home-center-mini-chart__day${day.isToday ? " is-today" : ""}`}>
                  <div className="home-center-mini-chart__stamp" aria-hidden="true">
                    {emotionMeta?.iconSrc ? (
                      <img src={emotionMeta.iconSrc} alt="" className="home-center-mini-chart__stamp-icon" />
                    ) : (
                      <span className="home-center-mini-chart__stamp-dot" />
                    )}
                  </div>
                  <div className="home-center-mini-chart__bar-track">
                    <div
                      className={`home-center-mini-chart__bar${day.level > 0 ? " has-value" : ""}`}
                      style={{ height: `${Math.max(day.level, 1) * 18}%` }}
                    />
                  </div>
                  <span className="home-center-mini-chart__weekday">{day.weekday}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="home-center-note-card">
          <span className="home-center-card__label">最近一句話</span>
          <p>{recentDisplayNote || "你還沒有留下短日記，今天可以從一句話開始。"}</p>
        </div>
      </article>
    </HomeCenterShell>
  );
}

export default HomeCenterStatusPage;