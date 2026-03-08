import React, { useEffect, useState } from "react";

const PRESETS = [
  { id: "3min", label: "3 分鐘", seconds: 180 },
  { id: "5min", label: "5 分鐘", seconds: 300 },
  { id: "10min", label: "10 分鐘", seconds: 600 },
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
  const [selectedSeconds, setSelectedSeconds] = useState(PRESETS[0].seconds);
  const [remaining, setRemaining] = useState(PRESETS[0].seconds);
  const [status, setStatus] = useState("idle"); // idle | running | paused | finished

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

  const handleSelectPreset = (preset) => {
    setSelectedSeconds(preset.seconds);
    setRemaining(preset.seconds);
    setStatus("idle");
  };

  const handleStartPause = () => {
    if (status === "running") {
      setStatus("paused");
    } else if (status === "paused" || status === "idle") {
      setStatus("running");
    } else if (status === "finished") {
      // 重新開始
      setRemaining(selectedSeconds);
      setStatus("running");
    }
  };

  const handleReset = () => {
    setRemaining(selectedSeconds);
    setStatus("idle");
  };

  const isRunning = status === "running";

  return (
    <div className="container">
      <section>
        <h1>🧘 冥想碼頭</h1>
        <p>
          想像自己坐在海邊的碼頭上，腳下是水聲，遠方是微微的風。選一個長度，跟著倒數一起慢慢呼吸。
        </p>
      </section>

      <section aria-label="冥想引導" style={{ marginTop: "24px" }}>
        <h2 style={{ fontSize: "18px", marginBottom: "8px" }}>簡單的引導</h2>
        <p style={{ fontSize: "14px", marginBottom: "4px" }}>・吸氣四拍，停留四拍，吐氣六拍。</p>
        <p style={{ fontSize: "14px", marginBottom: "4px" }}>・如果有雜念來，就像看到一艘船經過，讓它慢慢飄走。</p>
        <p style={{ fontSize: "14px" }}>・不用逼自己一定放鬆，只要陪自己待在這裡就好。</p>
      </section>

      <section aria-label="冥想計時器" style={{ marginTop: "24px" }}>
        <h2 style={{ fontSize: "18px", marginBottom: "8px" }}>選一個陪自己的時間</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="btn btn-ghost"
              onClick={() => handleSelectPreset(preset)}
              disabled={isRunning}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div
          aria-live="polite"
          style={{
            fontSize: "40px",
            fontVariantNumeric: "tabular-nums",
            marginBottom: "12px",
          }}
        >
          {formatTime(remaining)}
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button type="button" className="btn btn-soft" onClick={handleStartPause}>
            {isRunning ? "暫停" : status === "finished" ? "再來一次" : "開始"}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleReset}
            disabled={isRunning && remaining > 0}
          >
            重設
          </button>
        </div>

        {status === "finished" && (
          <p style={{ marginTop: "12px", fontSize: "14px" }}>
            這一輪結束了，謝謝你願意陪自己待這幾分鐘。如果還有力氣，可以再來一輪，或回到島上的其他角落走走。
          </p>
        )}
      </section>
    </div>
  );
}

export default MeditationPage;
