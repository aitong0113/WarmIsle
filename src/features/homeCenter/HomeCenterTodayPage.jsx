import HomeCenterShell from "./components/HomeCenterShell";
import { getHomeCenterPage } from "./config/homeCenterPages";
import { EmotionSelector, useHomeCenterData } from "./hooks/useHomeCenterData";

function HomeCenterTodayPage() {
  const page = getHomeCenterPage("today");
  const {
    handleSaveTodayNote,
    handleSelectTodayEmotion,
    journalFeedback,
    todayEmotion,
    todayEmotionMeta,
    todayLog,
    todayNoteDraft,
    setTodayNoteDraft,
  } = useHomeCenterData();

  return (
    <HomeCenterShell
      pageId={page.id}
      kicker={page.kicker}
      title={page.title}
      description="先替今天的自己取一個最接近的名字，再決定要不要多寫一點。"
    >
      <article className="home-center-card">
        <div className="home-center-card__split">
          <div>
            <span className="home-center-card__label">目前記錄</span>
            {todayEmotionMeta ? (
              <strong className="emotion-current-chip">
                <img src={todayEmotionMeta.iconSrc} alt="" className="emotion-current-chip__icon" aria-hidden="true" />
                <span>{todayEmotionMeta.label}</span>
              </strong>
            ) : (
              <strong>還沒選今天的情緒</strong>
            )}
          </div>
        </div>

        <div className="home-center-card__field">
          <span className="home-center-card__label">今天比較像哪一種狀態？</span>
          <EmotionSelector onSelect={handleSelectTodayEmotion} selectedId={todayLog?.emotion || todayEmotion} />
        </div>

        <label className="home-center-card__field" htmlFor="home-center-emotion-note">
          <span className="home-center-card__label">一句短短的心情日記</span>
          <textarea
            id="home-center-emotion-note"
            className="home-center-card__textarea"
            placeholder="例如：今天想先安靜一下，晚點再慢慢整理自己。"
            maxLength={120}
            value={todayNoteDraft}
            onChange={(event) => setTodayNoteDraft(event.target.value)}
          />
        </label>

        <div className="home-center-card__actions">
          <button type="button" className="btn btn-soft" onClick={handleSaveTodayNote}>
            存到今日紀錄
          </button>
          {journalFeedback && <p className="home-center-card__feedback">{journalFeedback}</p>}
        </div>
      </article>
    </HomeCenterShell>
  );
}

export default HomeCenterTodayPage;