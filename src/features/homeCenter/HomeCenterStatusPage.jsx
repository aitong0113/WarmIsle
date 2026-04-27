import HomeCenterShell from "./components/HomeCenterShell";
import { getHomeCenterPage } from "./config/homeCenterPages";
import { useHomeCenterData } from "./hooks/useHomeCenterData";

function HomeCenterStatusPage() {
  const page = getHomeCenterPage("status");
  const {
    monthEntriesCount,
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

        <div className="home-center-note-card">
          <span className="home-center-card__label">最近一句話</span>
          <p>{todayLog?.note || recentLog?.note || "你還沒有留下短日記，今天可以從一句話開始。"}</p>
        </div>
      </article>
    </HomeCenterShell>
  );
}

export default HomeCenterStatusPage;