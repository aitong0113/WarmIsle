import React, { useEffect, useState } from "react";

const PRACTICES = [
  {
    id: "breathing",
    title: "呼吸冥想",
    description: "專注於你的呼吸，讓思緒緩平靜下來",
    seconds: 5 * 60,
    minutes: 5,
    variant: "blue",
  },
  {
    id: "body-scan",
    title: "身體掃描",
    description: "感受身體每個部位，慢慢釋放緊張",
    seconds: 10 * 60,
    minutes: 10,
    variant: "purple",
  },
  {
    id: "mindfulness",
    title: "正念觀察",
    description: "觀察當下的感受，不加評論",
    seconds: 8 * 60,
    minutes: 8,
    variant: "green",
  },
  {
    id: "loving-kindness",
    title: "愛與慈悲",
    description: "培養對自己和他人的慈悲心",
    seconds: 7 * 60,
    minutes: 7,
    variant: "orange",
  },
];

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function MeditationPage() {
  const [selectedPracticeId, setSelectedPracticeId] = useState(null);
  const [remaining, setRemaining] = useState(0);
  const [status, setStatus] = useState("idle"); // idle | running | paused | finished

  const selectedPractice =
    PRACTICES.find((practice) => practice.id === selectedPracticeId) || null;

  useEffect(() => {
    if (status !== "running") return undefined;

    const id = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          setStatus("finished");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(id);
    };
  }, [status]);

  const handleSelectPractice = (practice) => {
    setSelectedPracticeId(practice.id);
    setRemaining(practice.seconds);
    setStatus("idle");
  };

  const handleStartPause = () => {
    if (!selectedPractice) return;

    if (status === "running") {
      setStatus("paused");
    } else if (status === "paused" || status === "idle") {
      if (remaining === 0) {
        setRemaining(selectedPractice.seconds);
      }
      setStatus("running");
    } else if (status === "finished") {
      // 重新開始
      setRemaining(selectedPractice.seconds);
      setStatus("running");
    }
  };

  const handleReset = () => {
    if (!selectedPractice) return;

    setRemaining(selectedPractice.seconds);
    setStatus("idle");
  };

  const isRunning = status === "running";

  return (
    <div className="meditation-page">
      <section className="meditation-scene" aria-hidden="true">
        <div className="meditation-scene__sun" />
        <div className="meditation-scene__ring meditation-scene__ring--one" />
        <div className="meditation-scene__ring meditation-scene__ring--two" />
      </section>

      {!selectedPractice && (
        <div className="meditation-layout">
          <header className="meditation-header">
            <p className="meditation-header__eyebrow">Meditation Dock</p>
            <h1 className="meditation-title">選擇你的冥想練習</h1>
            <p className="meditation-subtitle">
              找一個安靜的地方，讓自己放鬆下來。
            </p>
          </header>

          <section className="meditation-grid" aria-label="冥想練習列表">
            {PRACTICES.map((practice) => (
              <button
                key={practice.id}
                type="button"
                className={`meditation-card meditation-card--${practice.variant}`}
                onClick={() => handleSelectPractice(practice)}
                data-hako-priority="primary"
                data-hako-hover={`這一輪是${practice.minutes}分鐘的${practice.title}，適合先把注意力慢慢收回來。`}
                data-hako-click={`我們先選${practice.title}，不用完美，只要願意開始就很好。`}
              >
                <div className="meditation-card-headline">
                  <h2 className="meditation-card-title">{practice.title}</h2>
                </div>
                <p className="meditation-card-description">{practice.description}</p>
                <div className="meditation-card-footer">
                  <span className="meditation-card-duration">{practice.minutes} 分鐘</span>
                  <span className="meditation-card-play" aria-hidden="true">
                    ▶
                  </span>
                </div>
              </button>
            ))}
          </section>
        </div>
      )}

      {selectedPractice && (
        <div className="meditation-detail">
          <header className="meditation-detail-header">
            <button
              type="button"
              className="meditation-back-btn"
              onClick={() => {
                setStatus("idle");
                setSelectedPracticeId(null);
                setRemaining(0);
              }}
              data-hako-hover="想換別的練習也沒關係，回列表重新選就好。"
              data-hako-click="我們先回練習列表，重新挑一個更適合現在的節奏。"
            >
              ← 返回練習列表
            </button>
            <div className="meditation-detail-heading">
              <p className="meditation-detail-label">冥想碼頭 · Meditation Guide</p>
              <h1 className="meditation-detail-title">{selectedPractice.title}</h1>
              <p className="meditation-detail-description">{selectedPractice.description}</p>
            </div>
          </header>

          <main className="meditation-timer-section">
            <div
              className={`meditation-circle meditation-circle--${selectedPractice.variant}`}
              aria-live="polite"
            >
              <p className="meditation-circle-label">
                {status === "running"
                  ? "跟著呼吸..."
                  : status === "paused"
                    ? "先停一下，等你準備好再繼續"
                    : status === "finished"
                      ? "做得很好，這一輪結束了"
                      : "準備好了就一起開始"}
              </p>
              <p className="meditation-circle-time">{formatTime(remaining)}</p>
            </div>

            <div className="meditation-timer-actions">
              <button
                type="button"
                className="btn btn-ghost meditation-action-secondary"
                onClick={handleReset}
                disabled={isRunning && remaining > 0}
                data-hako-hover="如果節奏亂掉了，可以把計時重新開始。"
                data-hako-click="好，我們把這一輪重新歸零，再慢慢來一次。"
              >
                重新計時
              </button>
              <button
                type="button"
                className="btn btn-soft meditation-action-primary"
                onClick={handleStartPause}
                data-hako-priority="primary"
                data-hako-hover={isRunning ? "如果想先停一下，就按這裡喘口氣。" : "準備好之後，按下去就會開始這一輪練習。"}
                data-hako-click={isRunning ? "我先陪你停一下，等呼吸穩了再繼續。" : status === "finished" ? "那我們再來一輪，這次更輕一點也可以。" : "開始了，我會在旁邊陪你把這幾分鐘走完。"}
              >
                {isRunning ? "暫停" : status === "finished" ? "再來一次" : "開始"}
              </button>
            </div>

            {status === "finished" && (
              <p className="meditation-finished-text">
                這一輪結束了，謝謝你願意陪自己待這幾分鐘。如果還有力氣，可以再來一輪，或回到島上的其他角落走走。
              </p>
            )}
          </main>
        </div>
      )}
    </div>
  );
}

export default MeditationPage;
