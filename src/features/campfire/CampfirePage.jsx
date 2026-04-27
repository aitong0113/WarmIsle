import React, { useState } from "react";

const PLAYLISTS = [
  {
    id: "soft-lofi",
    title: "柔和 Lofi 節奏",
    description: "適合邊發呆邊呼吸的背景聲音，不會搶走注意力。",
    mood: "安靜陪伴",
    linkLabel: "在 YouTube 上打開",
    url: "https://www.youtube.com/results?search_query=lofi+chill+beats+for+relaxing",
    // 範例影片，可依喜好更換成自己的播放清單
    embedUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
  },
  {
    id: "ocean-waves",
    title: "海浪＋輕音樂",
    description: "像坐在岸邊聽海，一點點鋼琴或吉他在遠方。",
    mood: "想像自己在海邊",
    linkLabel: "聽聽海浪聲",
    url: "https://www.youtube.com/results?search_query=ocean+waves+relaxing+music+long",
    embedUrl: "https://www.youtube.com/embed/mcixldqDIEQ",
  },
  {
    id: "campfire-ambient",
    title: "營火＋環境聲",
    description: "火光劈啪聲、微微蟲鳴，適合睡前或寫日記。",
    mood: "睡前安靜",
    linkLabel: "找一個營火聲",
    url: "https://www.youtube.com/results?search_query=campfire+crackling+sound+for+sleep",
    embedUrl: "https://www.youtube.com/embed/L_DGQwC1BLc",
  },
];

function CampfirePage() {
  const [activeId, setActiveId] = useState(null);

  const activeItem = PLAYLISTS.find((item) => item.id === activeId) || null;

  return (
    <div className="campfire-page">
      <section className="campfire-scene" aria-hidden="true">
        <div className="campfire-scene__moon" />
        <div className="campfire-scene__glow" />
        <div className="campfire-scene__fire" />
      </section>

      <section className="campfire-hero">
        <div className="campfire-hero__copy">
          <p className="campfire-hero__eyebrow">Campfire Square</p>
          <h1>在火光旁，先把心慢慢放下來</h1>
          <p>
            這裡像夜晚島上的營火空地。你可以先選一段聲音，讓腦袋安靜一點，再決定今天要不要多想一些事。
          </p>
        </div>
        <div className="campfire-hero__panel">
          <strong>今晚的氣氛</strong>
          <span>低光、海風、火聲、慢節奏</span>
        </div>
      </section>

      <section className="campfire-card" aria-label="營火廣場靜心歌單">
        <header className="campfire-header">
          <h2 className="campfire-title">營火廣場</h2>
          <p className="campfire-intro">
            想像自己坐在營火旁，眼前有一小團溫暖的火光。挑一段聲音，讓今天的心慢慢放鬆下來。
          </p>
        </header>

        <div className="campfire-playlist-list">
          {PLAYLISTS.map((item) => (
            <article key={item.id} className="campfire-playlist">
              <h2 className="campfire-playlist-title">{item.title}</h2>
              <p className="campfire-playlist-description">{item.description}</p>
              <p className="campfire-playlist-mood">適合狀態：{item.mood}</p>
              <div className="campfire-playlist-actions">
                <button
                  type="button"
                  className="btn btn-soft"
                  onClick={() => setActiveId((prev) => (prev === item.id ? null : item.id))}
                  data-hako-priority="primary"
                  data-hako-hover={`這段${item.title}比較適合${item.mood}的時候，按下去就能先聽一會。`}
                  data-hako-click={activeId === item.id ? "好，我先幫你把這段聲音收起來。" : `先放這段${item.title}，讓環境先替你安靜一點。`}
                >
                  {activeId === item.id ? "暫停這段聲音" : "按這裡直接播放"}
                </button>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="campfire-playlist-link"
                  data-hako-hover="如果你想自己挑更多版本，也可以直接開新分頁慢慢找。"
                  data-hako-click="我幫你把外部播放清單打開了，你可以挑更合適的聲音。"
                >
                  {item.linkLabel}
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {activeItem && activeItem.embedUrl && (
        <section className="campfire-player" aria-label="目前播放中的營火聲">
          <div className="campfire-player-inner">
            <div className="campfire-player-header">
              <div className="campfire-player-meta">
                <div className="campfire-player-label">現在播放中</div>
                <div className="campfire-player-title">{activeItem.title}</div>
                <div className="campfire-player-mood">適合狀態：{activeItem.mood}</div>
              </div>
              <button
                type="button"
                className="btn btn-ghost campfire-player-close"
                onClick={() => setActiveId(null)}
                data-hako-hover="如果這段聲音不適合現在，就先收起來換一段。"
                data-hako-click="先把播放器收起來，等你想聽時再打開。"
              >
                ✕ 收起播放器
              </button>
            </div>

            <div className="campfire-player-frame">
              <iframe
                src={activeItem.embedUrl}
                title={activeItem.title}
                className="campfire-player-iframe"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default CampfirePage;
