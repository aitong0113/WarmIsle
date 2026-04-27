import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  signOut,
  signInWithPassword,
  signUpWithEmailPassword,
  signInWithGoogle,
} from "@/services/authService";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const userEmail = useSelector((state) => state.user?.email || "");
  const isAuthenticated = useSelector((state) => state.user?.isAuthenticated || false);
  const authReady = useSelector((state) => state.user?.authReady || false);
  const redirectTo = location.state?.from?.pathname || "/intro";

  const TEST_EMAIL = "test@warmisle.com";
  const TEST_PASSWORD = "123456";

  if (authReady && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleEmailPasswordSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      setStatus("請輸入 Email 與密碼");
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      if (mode === "login") {
        await signInWithPassword(email, password);
        setStatus("登入成功，帶你回到暖心島。");
        navigate(redirectTo, { replace: true });
      } else {
        await signUpWithEmailPassword(email, password);
        setStatus("註冊成功，如果有開啟信箱驗證，請到信箱收信完成啟用。");
      }
    } catch (error) {
      console.error("Email/password auth failed", error);
      setStatus("登入或註冊失敗，請確認帳號密碼是否正確，或稍後再試。");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setStatus("已登出。若要重新登入，請再次輸入 Email。");
  };

  const handleGoogleSignIn = async () => {
    setStatus("");
    try {
      await signInWithGoogle();
      // 將會自動導回 redirectTo
    } catch (error) {
      console.error("Google sign-in failed", error);
      setStatus("Google 登入失敗，請稍後再試。");
    }
  };

  const handleTestLogin = async () => {
    setLoading(true);
    setStatus("正在使用測試帳號登入⋯⋯");

    try {
      await signInWithPassword(TEST_EMAIL, TEST_PASSWORD);
      setStatus("已使用測試帳號登入，帶你回到暖心島。");
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error("Test account login failed", error);
      setStatus(
        "測試帳號登入失敗，請先在 Supabase 後台建立 test@warmisle.com 帳號（或確認已啟用），或改用一般登入方式。",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>登入暖心島</h1>
      <p>你可以選擇使用「帳號＋密碼」或「Google 一鍵登入」，也保留一次性 Email 連結登入。</p>

      {userEmail && (
        <p>
          目前已登入：
          {userEmail}
        </p>
      )}

      <div style={{ marginTop: 16, maxWidth: 420 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className="btn btn-soft"
            onClick={() => setMode("login")}
            style={{ opacity: mode === "login" ? 1 : 0.6 }}
            data-hako-priority="primary"
            data-hako-hover="如果你已經有帳號，就從這裡登入回到島上。"
            data-hako-click="好，我們用登入模式。"
          >
            使用帳號登入
          </button>
          <button
            type="button"
            className="btn btn-soft"
            onClick={() => setMode("signup")}
            style={{ opacity: mode === "signup" ? 1 : 0.6 }}
            data-hako-priority="primary"
            data-hako-hover="如果你還沒有帳號，可以先在這裡註冊。"
            data-hako-click="那我們改成註冊模式。"
          >
            註冊新帳號
          </button>
        </div>

        <form onSubmit={handleEmailPasswordSubmit} style={{ marginTop: 16 }}>
          <label style={{ display: "block", marginBottom: 8 }}>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-hako-hover="先填 Email，之後你的紀錄和登入方式都會跟著這個帳號。"
              style={{
                width: "100%",
                marginTop: 4,
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.1)",
              }}
            />
          </label>

          <label style={{ display: "block", marginBottom: 12 }}>
            密碼
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-hako-hover="密碼填好之後，就可以直接登入或完成註冊。"
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
            disabled={loading}
            data-hako-priority="primary"
            data-hako-hover={mode === "login" ? "按下去就會用這組帳密登入。" : "按下去就會用這組資料建立新帳號。"}
            data-hako-click={mode === "login" ? "我先幫你送出登入。" : "我先幫你送出註冊。"}
          >
            {loading ? "處理中⋯⋯" : mode === "login" ? "登入" : "註冊"}
          </button>

          {userEmail && (
            <button
              type="button"
              className="btn btn-soft"
              style={{ marginLeft: 8 }}
              onClick={handleSignOut}
              data-hako-hover="如果你想換帳號，可以先從這裡登出。"
              data-hako-click="好，我先幫你登出目前帳號。"
            >
              登出
            </button>
          )}
        </form>

        <div style={{ marginTop: 24 }}>
          <p style={{ marginBottom: 8 }}>或使用其他方式：</p>
          <button
            type="button"
            className="btn btn-soft"
            onClick={handleGoogleSignIn}
            data-hako-priority="primary"
            data-hako-hover="如果你想快一點登入，Google 一鍵登入會比較省事。"
            data-hako-click="我們改走 Google 登入。"
          >
            使用 Google 一鍵登入
          </button>
          <button
            type="button"
            className="btn btn-soft"
            style={{ marginLeft: 8 }}
            onClick={handleTestLogin}
            data-hako-hover="開發階段可以先用測試帳號快速進島。"
            data-hako-click="我幫你用測試帳號登入。"
          >
            使用測試帳號一鍵登入
          </button>
        </div>
      </div>

      {status && <p style={{ marginTop: 12 }}>{status}</p>}

      <button
        type="button"
        className="btn btn-soft"
        style={{ marginTop: 24 }}
        onClick={() => navigate("/")}
        data-hako-hover="如果你想先回首頁看看，也可以晚一點再登入。"
        data-hako-click="我們先回首頁。"
      >
        回到暖心島首頁
      </button>
    </div>
  );
}

export default LoginPage;
