import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { signOut } from "@/services/authService";
import brandLogo from "@/assets/brand/logo.png";

const NAV_ITEMS = [
  { to: "/beach", label: "情緒沙灘", hoverMessage: "這裡是記錄今天情緒和短日記的地方，哪怕只留一筆也可以。", clickMessage: "我們去情緒沙灘，把今天的感覺先放下來。" },
  { to: "/hako-cabin", label: "哈可小屋", hoverMessage: "這裡比較像一對一說話的小屋，適合把卡住的事講出來。", clickMessage: "我們進哈可小屋，先讓我聽你說。" },
  { to: "/campfire", label: "營火廣場", requiresPaid: true, hoverMessage: "這裡是用火光和環境聲慢慢降噪的區域。", clickMessage: "如果你想進營火廣場，我可以帶你去對應入口。" },
  { to: "/meditation", label: "冥想碼頭", requiresPaid: true, hoverMessage: "這裡放的是短版冥想練習，適合先穩住呼吸和節奏。", clickMessage: "我們往冥想碼頭走，看看現在能不能進去。" },
  { to: "/lighthouse", label: "心理燈塔", requiresPaid: true, hoverMessage: "這裡收的是能實際求助的心理資源與方向。", clickMessage: "我們去心理燈塔，看看這裡能不能為你打開。" },
];

function Header() {
  const user = useSelector((state) => state.user || {});

  const handleSignOut = async () => {
    await signOut();
  };

  const rawName = user?.name;
  const hasCustomName = rawName && rawName !== "Abbie";
  const baseName = hasCustomName ? rawName : "暖心島遊客";
  const displayName = user?.isAuthenticated ? `你好，${baseName}` : "";
  const hasPaidAccess = user?.hasPaidAccess || false;

  const getHoverMessageForItem = (item) => {
    if (!item.requiresPaid) return item.hoverMessage;

    if (!user?.isAuthenticated) {
      return `${item.hoverMessage} 先登入後，我再帶你進去。`;
    }

    if (!hasPaidAccess) {
      return `${item.hoverMessage} 目前這一區還鎖著，升級後就能進去。`;
    }

    return `${item.hoverMessage} 你現在可以直接進入。`;
  };

  const getNavLinkProps = (item) => {
    if (!item.requiresPaid) {
      return { to: item.to };
    }

    if (!user?.isAuthenticated) {
      return {
        to: "/login",
        state: { from: { pathname: item.to } },
      };
    }

    if (!hasPaidAccess) {
      return {
        to: "/account",
        state: { lockedFeature: item.label, from: item.to, returnTo: item.to },
      };
    }

    return { to: item.to };
  };

  return (
    <header className="header">
      <div className="header-inner">
        <Link
          to="/island"
          className="logo"
          data-hako-priority="primary"
          data-hako-hover="這是暖心島的主標誌，按下去會回到整座島的地圖。"
          data-hako-click="我們先回到島中央。"
        >
          <span className="logo-mark" aria-hidden="true">
            <img src={brandLogo} alt="" className="logo-mark__image" />
          </span>
          <span className="logo-copy">
            <span className="logo-copy__title">Warm Isle</span>
            <span className="logo-copy__subtitle">在情緒的海上，有座懂你的島</span>
          </span>
        </Link>
        <nav className="nav nav--main">
          {NAV_ITEMS.map((item) => {
            const linkProps = getNavLinkProps(item);
            const isLocked = item.requiresPaid && !hasPaidAccess;

            return (
              <Link
                key={item.to}
                to={linkProps.to}
                state={linkProps.state}
                className={`nav-link${item.requiresPaid ? " nav-link--premium" : ""}${isLocked ? " is-locked" : ""}`}
                aria-label={item.requiresPaid ? `${item.label}（付費功能）` : item.label}
                data-hako-priority="primary"
                data-hako-hover={getHoverMessageForItem(item)}
                data-hako-click={item.clickMessage}
              >
                <span>{item.label}</span>
                {item.requiresPaid && (
                  <span
                    className="nav-link__badge"
                    aria-hidden="true"
                    data-hako-hover={hasPaidAccess ? `${item.label} 已經解鎖，可以直接進去。` : `${item.label} 目前是付費區域，鎖頭代表還需要升級才會打開。`}
                  >
                    <Lock size={11} strokeWidth={2.2} />
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="nav-user-actions">
          {user?.isAuthenticated ? (
            <>
              <Link
                to="/account"
                className="nav-user nav-user-link"
                data-hako-priority="primary"
                data-hako-hover={`這裡是你的會員中心入口，現在會用「${baseName}」這個名字跟你打招呼。`}
                data-hako-click="我們去會員中心看看你的帳號狀態。"
              >
                {displayName}
              </Link>
              <button
                type="button"
                className="nav-cta"
                onClick={handleSignOut}
                data-hako-hover="如果你想換帳號或先離開，這裡可以登出。"
                data-hako-click="好，我先幫你登出。"
              >
                登出
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="nav-cta"
              data-hako-priority="primary"
              data-hako-hover="先登入之後，島上的紀錄和方案狀態才會跟著你。"
              data-hako-click="我們先去登入。"
            >
              登入
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
