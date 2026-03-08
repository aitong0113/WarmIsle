import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentUser, updateUserProfile } from "@/services/authService";
import { setUser } from "@/features/user/store/userSlice";

function MemberCenterPage() {
  const dispatch = useDispatch();
  const userState = useSelector((state) => state.user || {});
  const [authUser, setAuthUser] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user) {
        setAuthUser(user);
        const metaName = user.user_metadata?.name;
        if (metaName && metaName !== "Abbie") {
          setNameInput(metaName);
          dispatch(
            setUser({
              id: user.id,
              name: metaName,
            }),
          );
        }
      }
    });
  }, [dispatch]);

  const email = authUser?.email || "尚未登入";
  const rawName = userState?.name;
  const hasCustomName = rawName && rawName !== "Abbie";
  const trimmedInput = nameInput.trim();
  const displayName = hasCustomName ? rawName : trimmedInput || "暖心島遊客";

  const handleSaveName = async (event) => {
    event.preventDefault();
    if (!authUser) {
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
      const finalUser = updatedUser || authUser;
      const finalName = updatedUser?.user_metadata?.name || trimmed;

      setAuthUser(finalUser);
      setNameInput(finalName);
      dispatch(
        setUser({
          id: finalUser.id,
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
    <div className="container" style={{ maxWidth: 640 }}>
      <h1>會員中心</h1>
      <p>這裡之後可以放更多個人化設定與旅程紀錄。</p>

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
              style={{
                width: "100%",
                marginTop: 4,
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.1)",
              }}
            />
          </label>
          <button type="submit" className="btn">
            儲存暱稱
          </button>
        </form>
        {status && <p style={{ marginTop: 8 }}>{status}</p>}
      </section>
    </div>
  );
}

export default MemberCenterPage;
