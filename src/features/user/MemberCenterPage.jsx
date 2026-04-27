import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toUserState, updateUserProfile } from "@/services/authService";
import { setAuthState, setUser } from "@/features/user/store/userSlice";

const PLAN_CARDS = [
  {
    id: "free",
    name: "免費方案",
    description: "先體驗暖心島的核心陪伴，保留入口對話、情緒沙灘與哈可小屋免費版。",
    features: ["入口對話", "情緒沙灘", "哈可小屋免費版"],
    ctaLabel: "目前方案",
  },
  {
    id: "paid",
    name: "付費訂閱",
    description: "解鎖更深的陪伴內容與進階空間，讓整座島真正打開。",
    features: ["心理燈塔", "營火廣場", "冥想碼頭", "哈可小屋付費版"],
    ctaLabel: "升級訂閱",
  },
];

const PLAN_COMPARISON_ROWS = [
  { label: "入口對話", free: "可使用", paid: "可使用" },
  { label: "情緒沙灘", free: "可使用", paid: "可使用" },
  { label: "哈可小屋免費版", free: "可使用", paid: "可使用" },
  { label: "心理燈塔", free: "未開放", paid: "完整開放" },
  { label: "營火廣場", free: "未開放", paid: "完整開放" },
  { label: "冥想碼頭", free: "未開放", paid: "完整開放" },
  { label: "哈可小屋付費版", free: "未開放", paid: "完整開放" },
];

const FAQ_ITEMS = [
  {
    question: "付費版會多什麼？",
    answer: "會解鎖心理燈塔、營火廣場、冥想碼頭，以及哈可小屋付費版，讓陪伴內容從記錄延伸到引導與練習。",
  },
  {
    question: "我可以先用免費版，再之後升級嗎？",
    answer: "可以。免費版保留入口對話、情緒沙灘和哈可小屋免費版，等你真的需要更深的陪伴，再升級即可。",
  },
  {
    question: "升級後會立刻生效嗎？",
    answer: "目前升級流程會直接更新你的帳號方案，完成後會立刻開放付費頁面。後續若接金流，也會維持相同的解鎖節奏。",
  },
];

function MemberCenterPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const userState = useSelector((state) => state.user || {});
  const [nameInput, setNameInput] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (userState?.name && userState.name !== "Abbie") {
      setNameInput(userState.name);
    }
  }, [userState?.name]);

  const email = userState?.email || "尚未登入";
  const subscriptionTier = userState?.subscriptionTier || "free";
  const hasPaidAccess = userState?.hasPaidAccess || false;
  const lockedFeature = location.state?.lockedFeature || "";
  const lockedFrom = location.state?.from || "";
  const returnTo = location.state?.returnTo || lockedFrom || "/hako-cabin/premium";
  const upgraded = location.state?.upgraded || false;
  const upgradeMode = location.state?.upgradeMode || "";
  const unlockedFeature = location.state?.unlockedFeature || "";
  const rawName = userState?.name;
  const hasCustomName = rawName && rawName !== "Abbie";
  const trimmedInput = nameInput.trim();
  const displayName = hasCustomName ? rawName : trimmedInput || "暖心島遊客";
  const currentPlanLabel = subscriptionTier === "paid" ? "付費訂閱" : "免費方案";
  const upgradeLinkState = useMemo(
    () => ({ from: location.pathname, lockedFeature, returnTo }),
    [location.pathname, lockedFeature, returnTo],
  );

  const handleSaveName = async (event) => {
    event.preventDefault();
    if (!userState?.isAuthenticated) {
      setStatus("請先登入再修改暱稱。");
      return;
    }

    const trimmed = nameInput.trim();
    if (!trimmed) {
      setStatus("請輸入暱稱。");
      return;
    }

    try {
      setStatus("儲存中⋯⋯");
      const updatedUser = await updateUserProfile({ name: trimmed });
      const finalName = updatedUser?.user_metadata?.name || trimmed;
      if (updatedUser) {
        dispatch(setAuthState(toUserState(updatedUser)));
      }
      dispatch(
        setUser({
          id: userState.id,
          name: finalName,
        }),
      );
      setStatus("已更新暱稱，下次登入也會以這個稱呼陪你。");
    } catch (error) {
      console.error("Failed to update member name", error);
      setStatus("更新暱稱失敗，請稍後再試。");
    }
  };

  return (
    <div className="container member-center-page">
      <section className="member-center-hero">
        <div>
          <p className="member-center-eyebrow">會員中心</p>
          <h1>選擇你在暖心島的陪伴方案</h1>
          <p>
            先從免費方案開始也可以；當你準備好了，再把燈塔、營火、碼頭和哈可小屋付費版一起打開。
          </p>
        </div>
        <div className="member-center-plan-pill">
          目前方案：
          <strong>{currentPlanLabel}</strong>
        </div>
      </section>

      <section className="member-center-plans" aria-label="暖心島方案選擇">
        {PLAN_CARDS.map((plan) => {
          const isActive = plan.id === subscriptionTier;

          return (
            <article key={plan.id} className={`member-plan-card${isActive ? " is-active" : ""}`}>
              <div className="member-plan-card__header">
                <h2>{plan.name}</h2>
                {isActive && <span className="member-plan-card__tag">你目前的方案</span>}
              </div>
              <p>{plan.description}</p>
              <ul className="member-plan-card__features">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              {plan.id === "paid" ? (
                hasPaidAccess ? (
                  <Link
                    to="/hako-cabin/premium"
                    className="btn member-plan-card__cta"
                    data-hako-priority="primary"
                    data-hako-hover="你已經解鎖了，從這裡可以直接進到完整陪伴版的小屋。"
                    data-hako-click="我們直接去付費版小屋，看看更深一層的陪伴內容。"
                  >
                    已解鎖，前往付費版
                  </Link>
                ) : (
                  <Link
                    to="/upgrade"
                    state={upgradeLinkState}
                    className="btn member-plan-card__cta"
                    data-hako-priority="primary"
                    data-hako-hover="如果你準備把整座島打開，這裡就會帶你進升級流程。"
                    data-hako-click="我帶你去升級頁，先看看哪個方案比較適合。"
                  >
                    {plan.ctaLabel}
                  </Link>
                )
              ) : (
                <button
                  type="button"
                  className="btn btn-soft member-plan-card__cta"
                  disabled
                  data-hako-hover="你現在就在免費方案，先把核心體驗走一輪也很好。"
                >
                  {plan.ctaLabel}
                </button>
              )}
            </article>
          );
        })}
      </section>

      {upgraded && (
        <section className="member-center-success-notice">
          <h2>升級完成</h2>
          <p>
            付費方案已為你開啟。
            {unlockedFeature ? ` 目前優先解鎖：${unlockedFeature}。` : ""}
          </p>
          {upgradeMode === "local-demo" && (
            <p>目前是站內 demo 升級模式，之後接正式金流時可直接替換成實際付款回傳。</p>
          )}
        </section>
      )}

      <section className="member-center-section">
        <div className="member-center-section__header">
          <h2>方案差異比較</h2>
          <p>先把免費體驗走一輪也可以；如果你想要更多引導，就升到付費版。</p>
        </div>
        <div className="member-plan-compare" role="region" aria-label="方案差異比較表">
          <table>
            <thead>
              <tr>
                <th scope="col">功能</th>
                <th scope="col">免費方案</th>
                <th scope="col">付費訂閱</th>
              </tr>
            </thead>
            <tbody>
              {PLAN_COMPARISON_ROWS.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td>{row.free}</td>
                  <td>{row.paid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>基本資料</h2>
        <p>
          顯示名稱：
          <strong>{displayName}</strong>
        </p>
        <p>
          登入 Email：
          <strong>{email}</strong>
        </p>
        <p>
          目前方案：
          <strong>{currentPlanLabel}</strong>
        </p>
      </section>

      {lockedFeature && (
        <section className="member-center-lock-notice">
          <h2>功能尚未解鎖</h2>
          <p>
            {lockedFeature}
            目前僅開放給付費訂閱使用者。
          </p>
          {lockedFrom && <p>你剛剛想進入的路徑是：{lockedFrom}</p>}
          <p>先把免費體驗走完也可以，之後這裡可以接正式訂閱方案與付款入口。</p>
          <Link
            to="/upgrade"
            state={{ from: lockedFrom || location.pathname, lockedFeature, returnTo }}
            className="btn member-center-lock-notice__cta"
            data-hako-priority="primary"
            data-hako-hover={`如果你是為了${lockedFeature}來的，這裡可以直接去解鎖。`}
            data-hako-click={`好，我們直接去解鎖${lockedFeature}。`}
          >
            升級解鎖 {lockedFeature}
          </Link>
        </section>
      )}

      <section className="member-center-section">
        <div className="member-center-section__header">
          <h2>常見問題</h2>
          <p>先把使用者最在意的疑問放在這裡，避免升級前還要自己猜。</p>
        </div>
        <div className="member-faq-list">
          {FAQ_ITEMS.map((item) => (
            <details key={item.question} className="member-faq-item">
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>暱稱設定</h2>
        <p>這個暱稱會顯示在島上的右上角，也會用來跟你打招呼。</p>
        <form onSubmit={handleSaveName} style={{ marginTop: 12, maxWidth: 360 }}>
          <label style={{ display: "block", marginBottom: 8 }}>
            暱稱
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="輸入你希望被怎麼稱呼"
              data-hako-hover="你可以填一個讓島上更像在跟你說話的名字。"
              style={{
                width: "100%",
                marginTop: 4,
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.1)",
              }}
            />
          </label>
          <button
            type="submit"
            className="btn"
            data-hako-hover="存下去之後，右上角和一些招呼語就會改成這個稱呼。"
            data-hako-click="好，我幫你把新的稱呼存起來。"
          >
            儲存暱稱
          </button>
        </form>
        {status && <p style={{ marginTop: 8 }}>{status}</p>}
      </section>

      {userState?.isAdmin && (
        <section style={{ marginTop: 32 }}>
          <h2>站長入口</h2>
          <p>管理端入口已收斂到會員中心，避免公開暴露可編輯路徑。</p>
          <Link
            to="/lighthouse-admin"
            className="btn"
            data-hako-hover="這裡是站長看的管理入口，會進到燈塔資源維護頁。"
            data-hako-click="我們進管理頁看看燈塔資源。"
          >
            前往心理燈塔管理
          </Link>
        </section>
      )}
    </div>
  );
}

export default MemberCenterPage;
