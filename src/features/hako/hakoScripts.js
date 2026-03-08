// 根據事件與 payload 回傳一段哈可要說的話

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

    default:
      return null;
  }
}
