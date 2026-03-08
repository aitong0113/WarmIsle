import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCurrentUser,
  signOut,
  signInWithPassword,
  signUpWithEmailPassword,
  signInWithGoogle,
} from "@/services/authService";

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const TEST_EMAIL = "test@warmisle.com";
  const TEST_PASSWORD = "123456";

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user) {
        setUserEmail(user.email || "");
      }
    });
  }, []);

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
        setStatus("登入成功，帶你回到暖心島首頁。");
        navigate("/");
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
    setUserEmail("");
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
      setStatus("已使用測試帳號登入，帶你回到暖心島首頁。");
      navigate("/");
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
          >
            使用帳號登入
          </button>
          <button
            type="button"
            className="btn btn-soft"
            onClick={() => setMode("signup")}
            style={{ opacity: mode === "signup" ? 1 : 0.6 }}
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
              style={{
                width: "100%",
                marginTop: 4,
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.1)",
              }}
            />
          </label>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? "處理中⋯⋯" : mode === "login" ? "登入" : "註冊"}
          </button>

          {userEmail && (
            <button
              type="button"
              className="btn btn-soft"
              style={{ marginLeft: 8 }}
              onClick={handleSignOut}
            >
              登出
            </button>
          )}
        </form>

        <div style={{ marginTop: 24 }}>
          <p style={{ marginBottom: 8 }}>或使用其他方式：</p>
          <button type="button" className="btn btn-soft" onClick={handleGoogleSignIn}>
            使用 Google 一鍵登入
          </button>
          <button
            type="button"
            className="btn btn-soft"
            style={{ marginLeft: 8 }}
            onClick={handleTestLogin}
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
      >
        回到暖心島首頁
      </button>
    </div>
  );
}

export default LoginPage;
