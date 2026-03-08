import { Link } from "react-router-dom";

function IslandWorld() {
  return (
    <section className="island-world">
      <div className="sky">
        <div className="cloud cloud-1" />
        <div className="cloud cloud-2" />
      </div>

      <Link to="/harbor" className="island-item dock">
        <div className="island-card">
          <div className="island-icon">🚢</div>
          <div className="island-title">每日靠岸</div>
          <div className="island-subtitle">Mood log & streak</div>
        </div>
      </Link>

      <Link to="/beach" className="island-item beach">
        <div className="island-card">
          <div className="island-icon">🏖</div>
          <div className="island-title">情緒沙灘</div>
          <div className="island-subtitle">Diary bottles</div>
        </div>
      </Link>

      <Link to="/hako-cabin" className="island-item campfire">
        <div className="island-card">
          <div className="island-icon">🏡</div>
          <div className="island-title">哈可小屋</div>
          <div className="island-subtitle">Chat with Hako</div>
        </div>
      </Link>

      <Link to="/campfire" className="island-item lighthouse">
        <div className="island-card">
          <div className="island-icon">🔥</div>
          <div className="island-title">營火廣場</div>
          <div className="island-subtitle">放鬆音樂</div>
        </div>
      </Link>

      <Link to="/meditation" className="island-item meditation">
        <div className="island-card">
          <div className="island-icon">🧘</div>
          <div className="island-title">冥想碼頭</div>
          <div className="island-subtitle">冥想引導</div>
        </div>
      </Link>

      <Link to="/lighthouse" className="island-item house">
        <div className="island-card">
          <div className="island-icon">🔦</div>
          <div className="island-title">心理燈塔</div>
          <div className="island-subtitle">心理資源</div>
        </div>
      </Link>
    </section>
  );
}

export default IslandWorld;
