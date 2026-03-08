import React from "react";

const PLAYLISTS = [
  {
    id: "soft-lofi",
    title: "柔和 Lofi 節奏",
    description: "適合邊發呆邊呼吸的背景聲音，不會搶走注意力。",
    mood: "安靜陪伴",
    linkLabel: "在 YouTube 上打開",
    url: "https://www.youtube.com/results?search_query=lofi+chill+beats+for+relaxing",
  },
  {
    id: "ocean-waves",
    title: "海浪＋輕音樂",
    description: "像坐在岸邊聽海，一點點鋼琴或吉他在遠方。",
    mood: "想像自己在海邊",
    linkLabel: "聽聽海浪聲",
    url: "https://www.youtube.com/results?search_query=ocean+waves+relaxing+music+long",
  },
  {
    id: "campfire-ambient",
    title: "營火＋環境聲",
    description: "火光劈啪聲、微微蟲鳴，適合睡前或寫日記。",
    mood: "睡前安靜",
    linkLabel: "找一個營火聲",
    url: "https://www.youtube.com/results?search_query=campfire+crackling+sound+for+sleep",
  },
];

function CampfirePage() {
  return (
    <div className="container">
      <section>
        <h1>🔥 營火廣場</h1>
        <p>
          想像自己坐在營火旁，眼前有一小團溫暖的火光。挑一段聲音，讓今天的心慢慢放鬆下來。
        </p>
      </section>

      <section aria-label="靜心歌單">
        {PLAYLISTS.map((item) => (
          <article key={item.id} style={{ marginTop: "20px" }}>
            <h2 style={{ fontSize: "18px", marginBottom: "4px" }}>{item.title}</h2>
            <p style={{ margin: "0 0 6px", fontSize: "14px" }}>{item.description}</p>
            <p style={{ margin: "0 0 10px", fontSize: "12px", opacity: 0.7 }}>適合狀態：{item.mood}</p>
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="btn btn-soft"
            >
              {item.linkLabel}
            </a>
          </article>
        ))}
      </section>
    </div>
  );
}

export default CampfirePage;
