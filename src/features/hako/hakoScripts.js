// 根據事件與 payload 回傳一段哈可要說的話

const PAGE_MESSAGES = {
  "/intro": "進島前先慢慢整理一下名字、心情和今天的狀態，我會陪你走完。",
  "/island": "這裡是暖心島的地圖，滑到每個角落看看，我會告訴你那裡適合做什麼。",
  "/beach": "情緒沙灘適合先放下今天的感受，寫一點點也可以。",
  "/hako-cabin": "如果你今天腦袋很吵，可以先在這裡跟我說一句最真實的話。",
  "/campfire": "營火廣場比較像慢慢降噪的地方，先挑一段聲音也很好。",
  "/meditation": "冥想碼頭不用一次做很多，先挑一輪適合現在的練習就好。",
  "/lighthouse": "心理燈塔放的是能真的求助的資源，需要時就來這裡找方向。",
  "/login": "先登入再進島，之後你的紀錄和方案狀態才會跟著你。",
  "/account": "這裡可以看你的方案狀態，準備好了再決定要不要升級。",
  "/upgrade": "你可以先選月付或年付，再決定用哪一種付款方式。",
};

export function getHakoPageMessage(pathname) {
  if (!pathname) return "我在右下角陪你，有需要就看看我。";

  const matchedPath = Object.keys(PAGE_MESSAGES)
    .sort((left, right) => right.length - left.length)
    .find((path) => pathname === path || pathname.startsWith(`${path}/`));

  return PAGE_MESSAGES[matchedPath] || "我在右下角陪你，滑到按鈕上看看，我會先幫你介紹。";
}

export function getHakoMessageForEvent(event) {
  const { type, payload } = event;

  switch (type) {
    case "welcome_random": {
      const candidates = [
        "今天過得怎麼樣？",
        "歡迎回來暖島。",
        "今天想休息一下嗎？",
      ];
      const index = Math.floor(Math.random() * candidates.length);
      return candidates[index];
    }

    case "emotion_selected": {
      const emotion = payload?.emotion;
      if (emotion === "tired") return "今天看起來有點累，要不要一起慢慢走？";
      if (emotion === "sad") return "有時候想哭是很自然的，我在這裡陪你。";
      if (emotion === "angry") return "好像有些事情讓你很煩，我們可以先在沙灘踩踩浪。";
      if (emotion === "ok") return "知道自己今天還可以，也是一種溫柔的覺察。";
      return "無論今天是什麼情緒，謝謝你願意看一看它。";
    }

    case "diary_saved":
      return "謝謝你願意把這些寫下來，慢慢來就好。";

    case "docked_today":
      return "今天也有來靠岸，真的很棒。";

    case "open_resource":
      return "這裡放著一些在需要時可以求助的資源，有需要時記得來看看。";

    case "island_hover":
      return payload?.message || "先在島上逛逛，你可以慢慢選今天想靠岸的地方。";

    case "button_hint":
      return payload?.message || "如果你準備好了，就按一下看看，我會陪你往前一步。";

    default:
      return null;
  }
}
