import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getCurrentUser, onAuthStateChange, signOut } from "@/services/authService";
import { setUser } from "@/features/user/store/userSlice";

function Header() {
  const [userEmail, setUserEmail] = useState("");
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user || {});

  useEffect(() => {
    let isMounted = true;

    // 初次載入時抓目前登入使用者
    getCurrentUser().then((user) => {
      if (!isMounted) return;
      setUserEmail(user?.email || "");
      if (user) {
        const metaName = user.user_metadata?.name;
        if (metaName && metaName !== "Abbie") {
          dispatch(
            setUser({
              id: user.id,
              name: metaName,
            })
          );
        }
      }
    });

    // 監聽登入／登出狀態改變
    const unsubscribe = onAuthStateChange((user) => {
      if (!isMounted) return;
      setUserEmail(user?.email || "");
      if (user) {
        const metaName = user.user_metadata?.name;
        if (metaName && metaName !== "Abbie") {
          dispatch(
            setUser({
              id: user.id,
              name: metaName,
            })
          );
        }
      } else {
        dispatch(
          setUser({
            id: null,
            name: "Abbie",
          })
        );
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUserEmail("");
  };

  const rawName = user?.name;
  const hasCustomName = rawName && rawName !== "Abbie";
  const baseName = hasCustomName ? rawName : "暖心島遊客";
  const displayName = userEmail ? `你好，${baseName}` : "";

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">
          Warm Isle
        </Link>
        <nav className="nav">
          <Link to="/harbor">每日靠岸</Link>
          <Link to="/beach">情緒沙灘</Link>
          <Link to="/hako-cabin">哈可小屋</Link>
          <Link to="/campfire">營火廣場</Link>
          <Link to="/meditation">冥想碼頭</Link>
          <Link to="/lighthouse">心理燈塔</Link>
          {userEmail ? (
            <>
              <Link to="/account" className="nav-user nav-user-link">
                {displayName}
              </Link>
              <button type="button" className="nav-cta" onClick={handleSignOut}>
                登出
              </button>
            </>
          ) : (
            <Link to="/login" className="nav-cta">
              登入
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
